import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CreateCommentDocs } from './comments.swagger';

export class CreateCommentDto {
  @ApiProperty(CreateCommentDocs.content)
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @ApiProperty(CreateCommentDocs.anonymous)
  @IsBoolean()
  anonymous: boolean;

  @ApiProperty(CreateCommentDocs.parentCommentId)
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
