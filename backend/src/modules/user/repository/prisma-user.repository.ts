import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from './user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { PrismaService } from 'src/modules/prisma/prisma.service';

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
}
