import { Post } from '@prisma/client';
import { Expose, Transform, TransformFnParams } from 'class-transformer';

export class PostResponseDto {
  @Expose()
  readonly id: string;

  @Expose()
  readonly title: string;

  @Expose()
  readonly content: string;

  @Expose()
  readonly anonymous: boolean;

  @Expose()
  readonly isOwner: boolean;

  @Expose()
  @Transform(({ obj }: TransformFnParams) => {
    const post = obj as Post;
    return post.anonymous === true ? undefined : post.user_id;
  })
  readonly user_id?: string;

  @Expose()
  readonly createdAt: Date;

  @Expose()
  readonly views: number;

  @Expose()
  readonly languages: string[];

  constructor(partial: Partial<Post>, currentUserId?: string) {
    Object.assign(this, partial);

    this.isOwner = currentUserId === this.user_id;
  }
}
