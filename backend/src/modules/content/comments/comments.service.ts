import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostNotFoundException } from '../posts/exceptions/posts.exceptions';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  CommentAlreadyDeletedException,
  CommentNotFoundException,
  CommentNotOwnerException,
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
      include: {
        ...COMMENT_INCLUDE_USER,
        votes: currentUserId ? { where: { userId: currentUserId } } : false,
      },
    });

    return newComment;
  }

  async getCommentsTreeByPost(postId: string, currentUserId?: string) {
    const flatComments = await this.prisma.comment.findMany({
      where: { post_id: postId },
      orderBy: { createdAt: 'asc' },
      include: {
        ...COMMENT_INCLUDE_USER,
        votes: currentUserId ? { where: { userId: currentUserId } } : false,
      },
    });

    const commentMap = new Map<string, CommentTreeNode>();
    const rootComments: CommentTreeNode[] = [];

    for (const comment of flatComments) {
      commentMap.set(comment.id, {
        id: comment.id,
        content: comment.content,
        anonymous: comment.anonymous,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        parentCommentId: comment.parent_comment_id,
        isOwner: comment.user_id === currentUserId,
        user: comment.user,
        replies: [],
        scoreVotes: comment.scoreVotes,
        votes: comment.votes,
      });
    }

    for (const comment of flatComments) {
      const mappedComment = commentMap.get(comment.id);
      if (!mappedComment) continue;

      if (!comment.parent_comment_id) {
        rootComments.push(mappedComment);
        continue;
      }

      const parentComment = commentMap.get(comment.parent_comment_id);
      if (parentComment) {
        parentComment.replies.push(mappedComment);
      }
    }

    return rootComments;
  }

  async deleteComment(commentId: string, userId: string) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!existingComment) throw new CommentNotFoundException();

    if (existingComment.user_id !== userId) {
      throw new CommentNotOwnerException();
    }

    if (existingComment.deletedAt) {
      throw new CommentAlreadyDeletedException();
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Comentário excluído com sucesso.' };
  }
}
