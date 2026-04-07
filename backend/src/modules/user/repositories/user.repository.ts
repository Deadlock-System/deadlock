import { OAuthLoginDto } from 'src/modules/auth/dto/oauth-login.dto';
import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract create(user: User): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract findByUserId(userId: string): Promise<User | null>;
  abstract update(user: User): Promise<User>;
  abstract updatePasswordAndRevokeTokens(
    userId: string,
    hashedNewPassword: string,
  ): Promise<void>;
  abstract createWithProvider(oauthData: OAuthLoginDto);
}
