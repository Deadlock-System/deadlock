import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostNotFoundException } from '../posts/exceptions/posts.exceptions';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  CommentNotFoundException,
  ParentCommentException,
} from './exceptions/comments.exceptions';
import { CommentTreeNode } from './interface/comments.interface';

const COMMENT_INCLUDE_USER = Prisma.validator<Prisma.CommentInclude>()({
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
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    postId: string,
    currentUserId: string,
    dto: CreateCommentDto,
  ) {
    const postExists = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!postExists) throw new PostNotFoundException();

    if (dto.parentCommentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentCommentId },
        select: { id: true, post_id: true },
      });

      if (!parentComment) throw new CommentNotFoundException();

      if (parentComment.post_id !== postId) {
        throw new ParentCommentException();
      }
    }

    const newComment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        anonymous: dto.anonymous,
        user_id: currentUserId,
        post_id: postId,
        parent_comment_id: dto.parentCommentId || null,
      },
      include: COMMENT_INCLUDE_USER,
    });

    return newComment;
  }
}
