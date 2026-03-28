import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUserId } from 'src/modules/auth/decorators/get-user-id.decorator';
import { PostResponseDto } from './dto/response/post-response.dto';

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUserId() userId: string,
  ) {
    const createdPost = await this.postsService.createPost(
      createPostDto,
      userId,
    );

    return new PostResponseDto(createdPost, userId);
  }
}
