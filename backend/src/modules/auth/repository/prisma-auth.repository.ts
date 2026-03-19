import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { hash, compare } from 'bcrypt';
import { RefreshTokenMapper } from "../mappers/auth.mapper";

@Injectable()
export class AuthRepository {
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
        const prismaToken = await this.prisma.refreshToken.findUnique({ 
            where: { user_id: userId },
            include: { user: true }
        });
        if(!prismaToken) return null;
        return prismaToken;
    }

    async validateToken(userId: string, token: string): Promise<boolean> {
        const data = await this.findByUserId(userId);
        if (!data) return false;
        return compare(token, data.token);
    }
}