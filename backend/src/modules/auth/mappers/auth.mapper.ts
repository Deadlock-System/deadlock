import { RefreshToken } from '../entities/auth.entity';
import { RefreshToken as RefreshTokenRaw } from '@prisma/client';

export class RefreshTokenMapper {
  static toDomain(refreshTokenRaw: RefreshTokenRaw): RefreshToken {
    return new RefreshToken({
      id: refreshTokenRaw.id,
      userId: refreshTokenRaw.user_id,
      token: refreshTokenRaw.token,
      expiresAt: refreshTokenRaw.expires_at,
      createdAt: refreshTokenRaw.createdAt,
    });
  }

  static toPrisma(refreshToken: RefreshToken): Omit<RefreshTokenRaw, 'id'> {
    return {
      user_id: refreshToken.userId,
      token: refreshToken.token,
      expires_at: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
    };
  }
}
