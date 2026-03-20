import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignInUseCase } from './useCases/sign-in.usecase';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenService } from './services/token-service';
import { AuthRepository } from './repository/auth.repository';
import { UserRepository } from '../user/repository/user.repository';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private signInUseCase: SignInUseCase,
    private tokenService: TokenService,
    private authRepository: AuthRepository,
    private userRepository: UserRepository,
  ){ }

  async authenticate(signInDto: SignInDto){
    return await this.signInUseCase.execute(signInDto);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { userId, refreshToken } = refreshTokenDto;

    const refreshData = await this.authRepository.findByUserId(userId);
    if(!refreshData) throw new UnauthorizedException('Refresh Token não encontrado');

    const isValid = await this.validateRefreshToken(refreshToken, refreshData.token);
    if(!isValid) throw new UnauthorizedException('Refresh token inválido ou expirado');
  
    const userData = await this.userRepository.findByUserId(userId);
    if(!userData) throw new UnauthorizedException('Usuário não encontrado');

    const payload = { sub: userId, username: userData.username };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const newRefreshToken = this.tokenService.generateRefreshToken(payload);

    await this.authRepository.refreshTokenRegister(
        userId,
        newRefreshToken
    )

    return { accessToken, newRefreshToken };
  }

  private async validateRefreshToken(token: string, hashedToken: string): Promise<boolean> {
    return compare(token, hashedToken);
  }
}
