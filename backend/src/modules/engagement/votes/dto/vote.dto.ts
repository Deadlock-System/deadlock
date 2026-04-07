import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber } from 'class-validator';

export class VoteDto {
  @ApiProperty({
    description: 'Valor do voto. Use 1 para upvote e -1 para downvote.',
    enum: [-1, 1],
    example: 1,
  })
  @IsNumber()
  @IsIn([1, -1], {
    message: 'Valor do voto deve ser 1 (upvote) ou -1 (downvote)',
  })
  value: 1 | -1;
}
