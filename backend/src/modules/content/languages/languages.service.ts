import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(searchTerm?: string) {
    return this.prisma.language.findMany({
      where: searchTerm
        ? {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: { name: 'asc' },
      take: 50,
    });
  }
}
