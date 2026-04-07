import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { Post, User } from '@prisma/client';
import {
  Exclude,
  Expose,
  Transform,
  TransformFnParams,
} from 'class-transformer';
import { PostResponseDocs, PostUserSummaryDocs } from '../posts.swagger';

export type PostInput = Post & {
  votes?: { value: number }[];
};

export class PostUserSummaryDto {
  @ApiProperty(PostUserSummaryDocs.id)
  id: string;

  @ApiProperty(PostUserSummaryDocs.user_name)
  user_name: string;

  @ApiProperty(PostUserSummaryDocs.user_photo)
  user_photo: string | null;

  @ApiProperty(PostUserSummaryDocs.seniority_id)
  seniority_id: string;
}

export class PostResponseDto {
  @ApiProperty(PostResponseDocs.id)
  @Expose()
  readonly id: string;

  @ApiProperty(PostResponseDocs.title)
  @Expose()
  readonly title: string;

  @ApiProperty(PostResponseDocs.content)
  @Expose()
  readonly content: string;

  @ApiProperty(PostResponseDocs.anonymous)
  @Expose()
  readonly anonymous: boolean;

  @ApiProperty(PostResponseDocs.isOwner)
  @Expose()
  readonly isOwner: boolean;

  @ApiHideProperty()
  @Exclude()
  readonly user_id?: string;

  @ApiProperty({
    ...PostResponseDocs.user,
    type: PostUserSummaryDto,
  } as ApiPropertyOptions)
  @Expose()
  @Transform(({ obj, value }: TransformFnParams) => {
    const post = obj as Post;
    return post.anonymous === true ? undefined : (value as User);
  })
  readonly user?: Omit<User, 'hashedPassword' | 'createdAt' | 'email'>;

  @ApiProperty(PostResponseDocs.createdAt)
  @Expose()
  readonly createdAt: Date;

  @ApiProperty(PostResponseDocs.updatedAt)
  @Expose()
  readonly updatedAt: Date;

  @ApiProperty(PostResponseDocs.views)
  @Expose()
  readonly views: number;

  @Expose()
  readonly scoreVotes: number;

  @Expose()
  readonly myVote: number;

  @Exclude()
  readonly votes: [];

  @ApiProperty(PostResponseDocs.languages)
  @Expose()
  readonly languages: string[];

  constructor(partial: Partial<PostInput>, currentUserId?: string) {
    Object.assign(this, partial);

    this.isOwner = currentUserId === this.user_id;

    this.scoreVotes = partial.scoreVotes ?? 0;

    this.myVote = partial.votes?.[0]?.value ?? 0;
  }

  static fromArray(posts: PostInput[], currentUserId?: string) {
    return posts.map((post) => new PostResponseDto(post, currentUserId));
  }
}
