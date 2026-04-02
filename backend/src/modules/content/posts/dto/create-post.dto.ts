import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreatePostDocs } from './posts.swagger';

export class CreatePostDto {
  @ApiProperty(CreatePostDocs.title)
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty(CreatePostDocs.content)
  @IsString()
  @MaxLength(20000)
  content: string;

  @ApiProperty(CreatePostDocs.anonymous)
  @IsBoolean()
  anonymous: boolean;

  @ApiProperty(CreatePostDocs.languages)
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: 'Você só pode adicionar até 5 linguagens.' })
  @IsOptional()
  languages?: string[];
}
