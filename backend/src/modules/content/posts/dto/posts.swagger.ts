import { ApiPropertyOptions } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { GetPostsDto } from './get-posts.dto';
import { PostResponseDto } from './response/post-response.dto';
import { Seniority } from '@prisma/client';

export const CreatePostDocs: Record<keyof CreatePostDto, ApiPropertyOptions> = {
  title: {
    description: 'Título do post.',
    maxLength: 255,
    example: 'Como evitar o problema de N+1 queries no Prisma',
  },
  content: {
    description: 'Conteúdo (corpo) do post.',
    maxLength: 20000,
    example:
      'Ao utilizar o Prisma com relações aninhadas, é comum cair no problema de N+1 queries. Neste post, vou explicar como resolver isso...',
  },
  anonymous: {
    description: 'Se for true, oculta a identidade do autor do post.',
    example: false,
  },
  languages: {
    description: 'Lista de linguagens/tecnologias associadas ao post.',
    example: ['TypeScript', 'Prisma'],
    required: false,
  },
};

export const GetPostsDocs: Record<keyof GetPostsDto, ApiPropertyOptions> = {
  page: {
    description: 'Número da página para paginação.',
    example: 1,
    default: 1,
    required: false,
  },
  limit: {
    description: 'Quantidade de posts por página.',
    example: 20,
    default: 20,
    required: false,
  },
  search: {
    description: 'Palavra-chave de pesquisa por posts',
    example: 'Prisma',
    required: false,
  },
};

export type PostResponseDtoKeys = Exclude<
  keyof PostResponseDto,
  'fromArray' | 'user_id'
>;

export const PostResponseDocs: Record<PostResponseDtoKeys, ApiPropertyOptions> =
  {
    id: { example: '123e4567-e89b-12d3-a456-426614174000' },
    title: { example: 'Como evitar o problema de N+1 queries no Prisma' },
    content: {
      example:
        'Ao utilizar o Prisma com relações aninhadas, é comum cair no problema de N+1 queries...',
    },
    anonymous: { example: false },
    isOwner: {
      description: 'Indica se o usuário logado é o autor do post.',
      example: true,
    },
    user: {
      description: 'Dados do autor. Será undefined se o post for anônimo.',
      nullable: true,
    },
    createdAt: { example: '2026-04-02T10:00:00Z' },
    updatedAt: { example: '2026-04-02T10:00:00Z' },
    views: { example: 42 },
    languages: {
      description: 'Lista de linguagens/tecnologias associadas ao post.',
      example: ['TypeScript', 'Prisma'],
      isArray: true,
    },
    scoreVotes: {
      // TODO: implementar atualizações da doc swagger
    },
    myVote: {
      // TODO: implementar atualizações da doc swagger
    },
    votes: {
      // TODO: implementar atualizações da doc swagger
    },
  };

export const PostUserSummaryDocs = {
  id: { example: '123e4567-e89b-12d3-a456-426614174000' },
  user_name: { example: 'userABC' },
  user_photo: { example: 'blobBucket.com/user_photo/id.jpg', nullable: true },
  seniority_id: { example: 'JUNIOR', enum: Seniority },
};
