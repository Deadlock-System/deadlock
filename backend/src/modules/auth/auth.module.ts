import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SignInUseCase } from './useCases/sign-in.usecase';
import { UserModule } from 'src/modules/user/user.module';
import { TokenService } from './services/token-service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthRepository } from './repository/auth.repository';
import { PrismaAuthRepository } from './repository/prisma-auth.repository';
import { OAuthLoginUseCase } from './useCases/oauth-login-usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({}),
    forwardRef(() => UserModule),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SignInUseCase,
    GithubStrategy,
    OAuthLoginUseCase,
    JwtStrategy,
    TokenService,
    { provide: AuthRepository, useClass: PrismaAuthRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
