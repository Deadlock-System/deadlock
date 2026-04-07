import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { GetPostsDocs } from './posts.swagger';

export class GetPostsDto {
  @ApiProperty(GetPostsDocs.page)
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty(GetPostsDocs.limit)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  limit: number = 20;

  @ApiProperty(GetPostsDocs.search)
  @IsOptional()
  @IsString()
  search?: string;
}
