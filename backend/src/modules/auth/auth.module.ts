import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GithubStrategy } from "./strategies/github.strategy";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { SignInUseCase } from "./useCases/sign-in.usecase";
import { UserModule } from "src/modules/user/user.module";
import { TokenService } from "./services/token-service";
import { ConfigModule } from "@nestjs/config";
import { AuthRepository } from "./repository/prisma-auth.repository";
import { PrismaModule } from "src/modules/prisma/prisma.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        JwtModule.register({}),
        UserModule,
        PrismaModule
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthRepository,
        SignInUseCase,
        GithubStrategy,
        JwtStrategy,
        TokenService,
    ],
})
export class AuthModule { }