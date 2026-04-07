import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Seniority } from '@prisma/client';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  CommentTreeResponseDocs,
  CommentUserSummaryDocs,
} from '../comments.swagger';

@Exclude()
export class CommentUserSummaryDto {
  @ApiProperty(CommentUserSummaryDocs.id)
  @Expose()
  id: string;

  @ApiProperty(CommentUserSummaryDocs.user_name)
  @Expose()
  user_name: string;

  @ApiProperty(CommentUserSummaryDocs.user_photo)
  @Expose()
  user_photo: string | null;

  @ApiProperty(CommentUserSummaryDocs.seniority_id)
  @Expose()
  seniority_id: Seniority;
}

@Exclude()
export class CommentTreeResponseDto {
  @ApiProperty(CommentTreeResponseDocs.id)
  @Expose()
  id: string;

  @ApiProperty(CommentTreeResponseDocs.content)
  @Expose()
  @Transform(
    ({ value, obj }: { value: string; obj: CommentTreeResponseDto }) => {
      return obj.deletedAt ? '[Comentário excluído]' : value;
    },
  )
  content: string;

  @ApiProperty(CommentTreeResponseDocs.anonymous)
  @Expose()
  anonymous: boolean;

  @Expose()
  scoreVotes: number;

  @Expose()
  @Transform(({ obj }: { obj: { votes: { value: number }[] } }) => {
    return obj.votes?.[0]?.value ?? 0;
  })
  myVote: number;

  @ApiProperty(CommentTreeResponseDocs.createdAt)
  @Expose()
  createdAt: Date;

  @ApiProperty(CommentTreeResponseDocs.updatedAt)
  @Expose()
  updatedAt: Date;

  @ApiProperty(CommentTreeResponseDocs.deletedAt)
  @Expose()
  deletedAt: Date | null;

  @ApiProperty(CommentTreeResponseDocs.parentCommentId)
  @Expose()
  parentCommentId: string | null;

  @ApiProperty(CommentTreeResponseDocs.isOwner)
  @Expose()
  isOwner: boolean;

  @ApiProperty({
    ...CommentTreeResponseDocs.user,
    type: CommentUserSummaryDto,
  } as ApiPropertyOptions)
  @Expose()
  @Transform(
    ({
      value,
      obj,
    }: {
      value: CommentUserSummaryDto;
      obj: CommentTreeResponseDto;
    }) => {
      if (obj.anonymous) return undefined;
      if (obj.deletedAt) return undefined;
      return value;
    },
  )
  @Type(() => CommentUserSummaryDto)
  user: CommentUserSummaryDto | undefined;

  @ApiProperty({
    ...CommentTreeResponseDocs.replies,
    type: CommentTreeResponseDto,
  } as ApiPropertyOptions)
  @Expose()
  @Type(() => CommentTreeResponseDto)
  replies: CommentTreeResponseDto[];
}
