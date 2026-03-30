import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Prisma } from '@prisma/client';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  PostNotFoundException,
  UserIsNotOwnerException,
} from './exceptions/posts.exceptions';

const POST_DEFAULT_INCLUDES = Prisma.validator<Prisma.PostInclude>()({
  languages: true,
  user: {
    select: {
      id: true,
      user_name: true,
      user_photo: true,
      seniority_id: true,
    },
  },
});

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto, userId: string) {
    const { languages, ...dtoData } = createPostDto;

    const post = await this.prisma.post.create({
      data: {
        ...dtoData,
        user_id: userId,
        languages: this.buildLanguagesPayload(languages, false),
      },
      include: POST_DEFAULT_INCLUDES,
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
        include: POST_DEFAULT_INCLUDES,
      }),
      this.prisma.post.count(),
    ]);
    return { posts, total };
  }

  async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ) {
    const existingPost = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) throw new PostNotFoundException();

    if (existingPost.user_id !== userId) throw new UserIsNotOwnerException();

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...updatePostDto,
        languages: this.buildLanguagesPayload(updatePostDto.languages, true),
      },
      include: POST_DEFAULT_INCLUDES,
    });

    return updatedPost;
  }

  private buildLanguagesPayload(
    languages?: string[],
    isUpdate: boolean = false,
  ) {
    if (!languages || languages.length === 0) return undefined;

    const validLanguages = languages
      .map((lang) => lang.trim())
      .filter((lang) => lang.length > 0);

    if (validLanguages.length === 0) return undefined;

    return {
      ...(isUpdate && { set: [] }),
      connectOrCreate: validLanguages.map((name) => {
        const slug = name.toLowerCase();
        return {
          where: { slug: slug },
          create: { slug: slug, name: name },
        };
      }),
    };
  }
}
