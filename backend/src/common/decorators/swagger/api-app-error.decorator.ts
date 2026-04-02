import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { AppErrorResponseDto } from 'src/common/exceptions/dto/app-error-response.dto';

export type ErrorExample = {
  title: string;
  code: string;
  message: string;
};

export function ApiAppError(
  status: HttpStatus | number,
  description: string,
  ...errors: ErrorExample[]
) {
  const formattedExamples = errors.reduce(
    (acc, error) => {
      acc[error.title] = {
        value: {
          status,
          code: error.code,
          message: error.message,
          path: '/caminho/da/requisicao',
          requestId: '123e4567-e89b-12d3-a456-426614174000',
          timestamp: '2026-04-02T17:00:00.000Z',
        },
      };
      return acc;
    },
    {} as Record<string, any>,
  );

  return applyDecorators(
    ApiExtraModels(AppErrorResponseDto),
    ApiResponse({
      status,
      description,
      content: {
        'application/json': {
          schema: {
            $ref: getSchemaPath(AppErrorResponseDto),
          },
          examples: formattedExamples,
        },
      },
    }),
  );
}
