import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { CommentTreeResponseDto } from 'src/modules/content/comments/dto/response/comment-tree-response.dto';

export function ApiCommentResponse(
  status: HttpStatus | number,
  description: string,
) {
  return applyDecorators(
    ApiExtraModels(CommentTreeResponseDto),
    ApiResponse({
      status,
      description,
      content: {
        'application/json': {
          schema: {
            $ref: getSchemaPath(CommentTreeResponseDto),
          },
          examples: {
            'Comentário Público': {
              value: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                content: 'Isso resolve o problema perfeitamente.',
                anonymous: false,
                createdAt: '2026-04-02T17:00:00.000Z',
                updatedAt: '2026-04-02T17:00:00.000Z',
                parent_id: null,
                isOwner: false,
                deletedAt: null,
                user: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  user_name: 'userABC',
                  user_photo: 'blobBucket.com/user_photo/id.jpg',
                  seniority_id: 'JUNIOR',
                },
                replies: [],
              },
            },
            'Comentário Anônimo': {
              value: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                content: 'Pergunta polêmica mas necessária...',
                anonymous: true,
                createdAt: '2026-04-02T17:00:00.000Z',
                updatedAt: '2026-04-02T17:00:00.000Z',
                parent_id: null,
                isOwner: true,
                deletedAt: null,
                replies: [],
              },
            },
          },
        },
      },
    }),
  );
}
