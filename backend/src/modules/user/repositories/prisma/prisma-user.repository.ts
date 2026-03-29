import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { User } from '../../entities/user.entity';
import { UserMapper } from '../../mappers/user.mapper';
import { PrismaService } from 'src/prisma/prisma.service';
import { OAuthLoginDto } from 'src/modules/auth/dto/oauth-login.dto';

@Injectable()
export class PrismaRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: UserMapper.toPrisma(user),
    });
    return UserMapper.toDomain(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        user_name: username,
      },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async findByUserId(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async update(user: User): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: UserMapper.toPrisma(user),
    });

    return UserMapper.toDomain(updatedUser);
  }

  async updatePasswordAndRevokeTokens(
    userId: string,
    hashedNewPassword: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashed_password: hashedNewPassword,
        refreshTokens: {
          deleteMany: {},
        },
      },
    });
  }

  async createWithProvider(oauthData: OAuthLoginDto): Promise<User> {
    return this.prisma.$transaction(async (txPrisma) => {
      const user = await txPrisma.user.create({
        data: {
          email: oauthData.providerEmail,
          user_name:
            oauthData.providerUsername ||
            'User' + Math.floor(Math.random() * (1 - 500)) + 500, //!Best Ultra Fucking High Big Brain Username Feature,
          user_photo: oauthData.providerAvatar,
        },
      });

      await txPrisma.userProvider.create({
        data: {
          userId: user.id,
          provider: oauthData.providerType,
          providerId: oauthData.providerId,
        },
      });

      return UserMapper.toDomain(user);
    });
  }
}
