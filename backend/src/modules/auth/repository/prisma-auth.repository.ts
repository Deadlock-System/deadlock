import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { hash } from 'bcrypt';
import { RefreshTokenMapper } from "../mappers/auth.mapper";
import { AuthRepository as AuthRepositoryInterface } from "./auth.repository";

@Injectable()
export class PrismaAuthRepository  implements AuthRepositoryInterface {
    constructor(
        private prisma: PrismaService
    ) {}

    async refreshTokenRegister(userId: string, refreshToken: string) {
        const hashedToken = await hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() +  7 * 24 * 60 * 60 * 1000);

        const prismaRefreshToken = await this.prisma.refreshToken.upsert({
            where: { user_id: userId },
            update: { token: hashedToken, expires_at: expiresAt },
            create: RefreshTokenMapper.toPrisma({
                userId,
                token: hashedToken,
                expiresAt,
                createdAt: new Date()
            })
        });

        return RefreshTokenMapper.toDomain(prismaRefreshToken)
    }

    async findByUserId(userId: string){
        const refreshTokenData = await this.prisma.refreshToken.findUnique({ 
            where: { user_id: userId },
        });
        
        if(!refreshTokenData) return null;

        return RefreshTokenMapper.toDomain(refreshTokenData);
    }
}