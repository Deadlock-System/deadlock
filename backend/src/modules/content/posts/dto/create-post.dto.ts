import { IsBoolean, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(20000)
  content: string;

  @IsBoolean()
  anonymous: boolean;
}
