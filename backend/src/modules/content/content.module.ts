import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { LanguagesModule } from './languages/languages.module';

@Module({
  imports: [PostsModule, LanguagesModule],
})
export class ContentModule {}
