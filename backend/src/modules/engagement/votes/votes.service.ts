import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export enum VoteTarget {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleVote(
    userId: string,
    targetId: string,
    targetType: VoteTarget,
    intendedValue: 1 | -1,
  ) {
    if (targetType === VoteTarget.POST) {
      return this.handlePostVote(userId, targetId, intendedValue);
    }

    return this.handleCommentVote(userId, targetId, intendedValue);
  }

  private async handlePostVote(
    userId: string,
    postId: string,
    intendedValue: 1 | -1,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existingVote = await tx.postVote.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      // Remover voto
      if (existingVote && existingVote.value === intendedValue) {
        await tx.postVote.delete({ where: { id: existingVote.id } });

        const delta = intendedValue === 1 ? -1 : 1;
        await tx.post.update({
          where: { id: postId },
          data: { scoreVotes: { increment: delta } },
        });

        return { action: 'removed', scoreDelta: delta };
      }

      // Inverter voto
      if (existingVote && existingVote.value !== intendedValue) {
        await tx.postVote.update({
          where: { id: existingVote.id },
          data: { value: intendedValue },
        });

        const delta = intendedValue === 1 ? 2 : -2;
        await tx.post.update({
          where: { id: postId },
          data: { scoreVotes: { increment: delta } },
        });

        return { action: 'changed', scoreDelta: delta };
      }

      // Adicionar voto
      await tx.postVote.create({
        data: { userId, postId, value: intendedValue },
      });

      await tx.post.update({
        where: { id: postId },
        data: { scoreVotes: { increment: intendedValue } },
      });

      return { action: 'created', scoreDelta: intendedValue };
    });
  }

  private async handleCommentVote(
    userId: string,
    commentId: string,
    intendedValue: 1 | -1,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existingVote = await tx.commentVote.findUnique({
        where: { commentId_userId: { commentId, userId } },
      });

      // Remover voto
      if (existingVote && existingVote.value === intendedValue) {
        await tx.commentVote.delete({ where: { id: existingVote.id } });

        const delta = intendedValue === 1 ? -1 : 1;
        await tx.comment.update({
          where: { id: commentId },
          data: { scoreVotes: { increment: delta } },
        });

        return { action: 'removed', scoreDelta: delta };
      }
      // Inverter voto
      if (existingVote && existingVote.value !== intendedValue) {
        await tx.commentVote.update({
          where: { id: existingVote.id },
          data: { value: intendedValue },
        });

        const delta = intendedValue === 1 ? 2 : -2;
        await tx.comment.update({
          where: { id: commentId },
          data: { scoreVotes: { increment: delta } },
        });

        return { action: 'changed', scoreDelta: delta };
      }

      // Adicionar voto
      await tx.commentVote.create({
        data: { userId, commentId, value: intendedValue },
      });

      await tx.comment.update({
        where: { id: commentId },
        data: { scoreVotes: { increment: intendedValue } },
      });

      return { action: 'created', scoreDelta: intendedValue };
    });
  }
}
