import { RefreshToken } from '../entities/auth.entity';

export abstract class RefreshTokenRepository {
  abstract refreshTokenRegister(userId: string, refreshToken: string): Promise<RefreshToken>;
  abstract findByUserId(userId: string): Promise<RefreshToken | null>;
  abstract validateToken(userId: string, refreshToken: string): Promise<boolean>;
}