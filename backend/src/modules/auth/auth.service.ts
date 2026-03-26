import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignInUseCase } from './useCases/sign-in.usecase';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenService } from './services/token-service';
import { UserNotFoundException } from '../user/exceptions/user.exceptions';
import { AuthRepository } from './repositories/auth.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { compare } from 'bcrypt';
import {
  InvalidRefreshTokenException,
  RefreshTokenNotFoundException,
} from './exceptions/auth.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private signInUseCase: SignInUseCase,
    private tokenService: TokenService,
    private authRepository: AuthRepository,
    private userRepository: UserRepository,
  ) {}

  async authenticate(signInDto: SignInDto) {
    return await this.signInUseCase.execute(signInDto);
  }

  async generateAuthTokens(userId: string, username: string) {
    const payload = { sub: userId, username };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    await this.authRepository.refreshTokenRegister(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { userId, refreshToken } = refreshTokenDto;

    const refreshData = await this.authRepository.findByUserId(userId);
    if (!refreshData) throw new RefreshTokenNotFoundException();

    const isValid = await this.validateRefreshToken(
      refreshToken,
      refreshData.token,
    );
    if (!isValid) throw new InvalidRefreshTokenException();

    const userData = await this.userRepository.findByUserId(userId);
    if (!userData) throw new UserNotFoundException();

    const authTokens = await this.generateAuthTokens(userId, userData.username);

    return authTokens;
  }

  private async validateRefreshToken(
    token: string,
    hashedToken: string,
  ): Promise<boolean> {
    return compare(token, hashedToken);
  }
}
