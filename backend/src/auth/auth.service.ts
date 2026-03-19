import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignInUseCase } from './useCases/sign-in.usecase';
import { AuthRepository } from './repository/prisma-auth.repository';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenService } from './services/token-service';

@Injectable()
export class AuthService {
  constructor(
    private signInUseCase: SignInUseCase,
    private authRepository: AuthRepository,
    private tokenService: TokenService,
  ){ }

  async authenticate(signInDto: SignInDto){
    return await this.signInUseCase.execute(signInDto);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { userId, refreshToken } = refreshTokenDto;

    const isValid = await this.authRepository.validateToken(
      userId,
      refreshToken
    );

    if(!isValid) throw new UnauthorizedException('Refresh token inválido ou expirado');
    
    const refreshData = await this.authRepository.findByUserId(userId);
    if(!refreshData) throw new UnauthorizedException('Refresh Token não encontrado');

    const payload = { 
      sub: userId, username:
      refreshData.user.user_name 
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const newRefreshToken = this.tokenService.generateRefreshToken(payload);

    await this.authRepository.refreshTokenRegister(
        userId,
        newRefreshToken
    )

    return { accessToken, newRefreshToken };
  }
}
