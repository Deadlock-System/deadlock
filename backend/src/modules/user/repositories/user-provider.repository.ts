import { ProviderType } from '@prisma/client';
import { User } from '../entities/user.entity';

export abstract class UserProviderRepository {
  abstract findByProvider(
    provider: ProviderType,
    providerId: string,
  ): Promise<User | null>;

  abstract linkProvider(
    userId: string,
    data: { provider: ProviderType; providerId: string },
  ): Promise<any>;
}
