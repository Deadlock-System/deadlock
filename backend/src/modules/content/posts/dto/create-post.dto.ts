import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(20000)
  content: string;

  @IsBoolean()
  anonymous: boolean;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: 'Você só pode adicionar até 5 linguagens.' })
  @IsOptional()
  languages?: string[];
}
