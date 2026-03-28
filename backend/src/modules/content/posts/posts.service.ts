import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto, userId: string) {
    const { languages, ...dtoData } = createPostDto;

    const post = await this.prisma.post.create({
      data: {
        ...dtoData,
        user_id: userId,
        languages:
          languages && languages.length > 0
            ? {
                connectOrCreate: languages.map((originalName) => {
                  const slug = originalName.toLowerCase().trim();
                  return {
                    where: { slug: slug },
                    create: {
                      slug: slug,
                      name: originalName.trim(),
                    },
                  };
                }),
              }
            : undefined,
      },
      include: {
        languages: true,
      },
    });

    return post;
  }
}
