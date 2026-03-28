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
import { AuthRepository } from './repositories/auth.repository';
import { PrismaAuthRepository } from './repositories/prisma-auth.repository';
import { OAuthLoginUseCase } from './useCases/oauth-login-usecase';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { CookieService } from './services/cookie-service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ session: false }),
    JwtModule.register({}),
    forwardRef(() => UserModule),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SignInUseCase,
    GithubStrategy,
    GoogleStrategy,
    OAuthLoginUseCase,
    JwtStrategy,
    TokenService,
    CookieService,
    { provide: AuthRepository, useClass: PrismaAuthRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
