import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PostResponseDto } from 'src/modules/content/posts/dto/response/post-response.dto';

const PUBLIC_POST_EXAMPLE = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Como evitar o problema de N+1 queries no Prisma',
  content:
    'Ao utilizar o Prisma com relações aninhadas, é comum cair no problema de N+1 queries...',
  anonymous: false,
  isOwner: false,
  createdAt: '2026-04-02T17:00:00.000Z',
  updatedAt: '2026-04-02T17:00:00.000Z',
  views: 42,
  languages: ['TypeScript', 'Prisma'],
  user: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_name: 'userABC',
    user_photo: 'blobBucket.com/user_photo/id.jpg',
    seniority_id: 'JUNIOR',
  },
};

const ANONYMOUS_POST_EXAMPLE = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  title: 'Pergunta polêmica sobre arquitetura',
  content: 'É realmente necessário usar microsserviços para...',
  anonymous: true,
  isOwner: true,
  createdAt: '2026-04-02T17:00:00.000Z',
  updatedAt: '2026-04-02T17:00:00.000Z',
  views: 10,
  languages: [],
};

export function ApiPostResponse(
  status: HttpStatus | number,
  description: string,
) {
  return applyDecorators(
    ApiExtraModels(PostResponseDto),
    ApiResponse({
      status,
      description,
      content: {
        'application/json': {
          schema: {
            $ref: getSchemaPath(PostResponseDto),
          },
          examples: {
            'Post Público': { value: PUBLIC_POST_EXAMPLE },
            'Post Anônimo': { value: ANONYMOUS_POST_EXAMPLE },
          },
        },
      },
    }),
  );
}

export function ApiPaginatedPostResponse(
  status: HttpStatus | number,
  description: string,
) {
  return applyDecorators(
    ApiExtraModels(PostResponseDto),
    ApiResponse({
      status,
      description,
      content: {
        'application/json': {
          schema: {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(PostResponseDto) },
              },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 100 },
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 20 },
                  totalPages: { type: 'number', example: 5 },
                },
              },
            },
          },
          examples: {
            'Lista com posts públicos e anônimos': {
              value: {
                data: [PUBLIC_POST_EXAMPLE, ANONYMOUS_POST_EXAMPLE],
                meta: {
                  total: 100,
                  page: 1,
                  limit: 20,
                  totalPages: 5,
                },
              },
            },
          },
        },
      },
    }),
  );
}
