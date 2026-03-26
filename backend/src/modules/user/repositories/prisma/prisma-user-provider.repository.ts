import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserProviderRepository } from '../user-provider.repository';
import { ProviderType } from '@prisma/client';
import { UserMapper } from '../../mappers/user.mapper';

@Injectable()
export class PrismaUserProviderRepository implements UserProviderRepository {
  constructor(private prisma: PrismaService) {}

  async findByProvider(provider: ProviderType, providerId: string) {
    const result = await this.prisma.userProvider.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: { user: true },
    });

    return result ? UserMapper.toDomain(result.user) : null;
  }

  async linkProvider(
    userId: string,
    data: { provider: ProviderType; providerId: string },
  ) {
    await this.prisma.userProvider.create({
      data: { userId, ...data },
    });
  }
}
