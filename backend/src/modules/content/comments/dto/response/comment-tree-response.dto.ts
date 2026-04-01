import { Seniority } from '@prisma/client';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
class CommentUserSummaryDto {
  @Expose()
  id: string;

  @Expose()
  user_name: string;

  @Expose()
  user_photo: string | null;

  @Expose()
  seniority_id: Seniority;
}

@Exclude()
export class CommentTreeResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(
    ({ value, obj }: { value: string; obj: CommentTreeResponseDto }) => {
      return obj.deletedAt ? '[Comentário excluído]' : value;
    },
  )
  content: string;

  @Expose()
  anonymous: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;

  @Expose()
  parentCommentId: string | null;

  @Expose()
  isOwner: boolean;

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

  @Expose()
  @Type(() => CommentTreeResponseDto)
  replies: CommentTreeResponseDto[];
}
