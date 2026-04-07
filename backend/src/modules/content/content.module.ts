import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { LanguagesModule } from './languages/languages.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [PostsModule, LanguagesModule, CommentsModule],
})
export class ContentModule {}
