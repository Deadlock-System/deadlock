import { ApiProperty } from '@nestjs/swagger';

export class AppErrorResponseDto {
  @ApiProperty({ description: 'Status HTTP do erro', example: 404 })
  status: number;

  @ApiProperty({
    description: 'Código interno do erro',
    example: 'COMMENT_NOT_FOUND',
  })
  code: string;

  @ApiProperty({
    description: 'Mensagem detalhada sobre o erro ocorrido',
    example: 'Comentário não encontrado.',
  })
  message: string;

  @ApiProperty({
    description: 'Rota que originou o erro',
    example: '/posts/123/comments',
  })
  path: string;

  @ApiProperty({
    description: 'ID de rastreio da requisição (Traceability)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  requestId: string;

  @ApiProperty({
    description: 'Data e hora do erro',
    example: '2026-04-02T17:00:00.000Z',
  })
  timestamp: string;
}
