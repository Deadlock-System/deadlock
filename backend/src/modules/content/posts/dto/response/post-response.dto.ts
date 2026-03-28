import { Post, User } from '@prisma/client';
import {
  Exclude,
  Expose,
  Transform,
  TransformFnParams,
} from 'class-transformer';

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

  @Exclude()
  readonly user_id?: string;

  @Expose()
  @Transform(({ obj, value }: TransformFnParams) => {
    const post = obj as Post;
    return post.anonymous === true ? undefined : (value as User);
  })
  readonly user?: Omit<User, 'hashedPassword' | 'createdAt' | 'email'>;

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

  static fromArray(posts: Post[], currentUserId?: string) {
    return posts.map((post) => new PostResponseDto(post, currentUserId));
  }
}
