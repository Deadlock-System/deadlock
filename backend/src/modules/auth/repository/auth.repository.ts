import { RefreshToken } from '../entities/auth.entity';

export abstract class AuthRepository {
  abstract refreshTokenRegister(userId: string, refreshToken: string): Promise<RefreshToken>;
  abstract findByUserId(userId: string): Promise<RefreshToken | null>;
}