import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { SignInDto } from '../dto/sign-in.dto';
import { compare } from 'bcrypt';
import { TokenService } from '../services/token-service';
import { InvalidCredentialException } from '../exceptions/auth.exceptions';
import { InvalidPasswordException } from 'src/modules/user/exceptions/user.exceptions';

@Injectable()
export class SignInUseCase {
  constructor(
    private userRepository: UserRepository,
    private authRepository: AuthRepository,
    private tokenService: TokenService,
  ) {}

  async execute(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.userRepository.findByEmail(email);

    if (!user?.hashedPassword) throw new InvalidPasswordException();

    const passwordMatches = user
      ? await compare(password, user.hashedPassword)
      : false;

    if (!user || !passwordMatches) {
      throw new InvalidCredentialException();
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    await this.authRepository.refreshTokenRegister(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
