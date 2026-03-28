import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto, userId: string) {
    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
        user_id: userId,
      },
    });

    return post;
  }
}
