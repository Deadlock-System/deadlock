import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto, userId: string) {
    const { languages, ...dtoData } = createPostDto;

    const validLanguages = languages
      ? languages.map((lang) => lang.trim()).filter((lang) => lang.length > 0)
      : [];

    const post = await this.prisma.post.create({
      data: {
        ...dtoData,
        user_id: userId,
        languages:
          languages && languages.length > 0
            ? {
                connectOrCreate: validLanguages.map((name) => {
                  const slug = name.toLowerCase().trim();
                  return {
                    where: { slug: slug },
                    create: {
                      slug: slug,
                      name: name.trim(),
                    },
                  };
                }),
              }
            : undefined,
      },
      include: {
        languages: true,
        user: {
          select: {
            id: true,
            user_name: true,
            user_photo: true,
            seniority_id: true,
          },
        },
      },
    });

    return post;
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
        },
      }),
      this.prisma.post.count(),
    ]);
    return { posts, total };
  }
}
