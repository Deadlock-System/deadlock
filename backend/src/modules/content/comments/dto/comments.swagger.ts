import { ApiPropertyOptions } from '@nestjs/swagger';
import { Seniority } from '@prisma/client';
import { CreateCommentDto } from './create-comment.dto';
import {
  CommentTreeResponseDto,
  CommentUserSummaryDto,
} from './response/comment-tree-response.dto';

export const CreateCommentDocs: Record<
  keyof CreateCommentDto,
  ApiPropertyOptions
> = {
  content: {
    description: 'O conteúdo do comentário.',
    maxLength: 10000,
    example:
      'Acredito que optar por uma arquitetura de microsserviços numa aplicação que recebe 1000 usuários é overkill...',
  },
  anonymous: {
    description: 'Se for true, oculta a identidade do autor do comentário.',
    example: false,
  },
  parentCommentId: {
    description:
      'ID do comentário pai (se estiver respondendo a alguém). Se nulo, é um comentário raiz.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  },
};

export const CommentUserSummaryDocs: Record<
  keyof CommentUserSummaryDto,
  ApiPropertyOptions
> = {
  id: { example: '123e4567-e89b-12d3-a456-426614174000' },
  user_name: { example: 'userABC' },
  user_photo: { example: 'blobBucket.com/user_photo/id.jpg', nullable: true },
  seniority_id: { example: 'JUNIOR', enum: Seniority },
};

export const CommentTreeResponseDocs: Record<
  keyof CommentTreeResponseDto,
  ApiPropertyOptions
> = {
  id: { example: '123e4567-e89b-12d3-a456-426614174000' },
  content: { example: 'Isso resolve o problema de N+1 queries perfeitamente.' },
  anonymous: { example: false },
  createdAt: { example: '2026-04-02T10:00:00Z' },
  updatedAt: { example: '2026-04-02T10:00:00Z' },
  parentCommentId: { example: null, nullable: true },
  isOwner: {
    description: 'Indica se o usuário logado é o autor do comentário',
    example: true,
  },
  deletedAt: {
    description:
      'Data de exclusão (Soft Delete). Se preenchido, o conteúdo e autor são ocultados.',
    example: null,
    nullable: true,
  },
  user: {
    description:
      'Dados do autor. Será null se o post for anônimo ou se o comentário foi apagado.',
    nullable: true,
  },
  replies: {
    description: 'Lista de respostas diretas a este comentário.',
    isArray: true,
  },
  scoreVotes: {
    // TODO: implementar atualizações da doc swagger
  },
  myVote: {
    // TODO: implementar atualizações da doc swagger
  },
};
