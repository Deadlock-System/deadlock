import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUserId } from 'src/modules/auth/decorators/get-user-id.decorator';
import { PostResponseDto } from './dto/response/post-response.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { OptionalJwtAuthGuard } from 'src/modules/auth/guards/optional-jwt.guard';
import { UpdatePostDto } from './dto/update-post.dto';

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

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Query() query: GetPostsDto, @GetUserId() userId: string) {
    const { posts, total } = await this.postsService.findAll(
      query.page,
      query.limit,
    );

    const postsResponse = PostResponseDto.fromArray(posts, userId);

    return {
      data: postsResponse,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUserId() userId: string,
  ) {
    const updatedPost = await this.postsService.updatePost(
      postId,
      updatePostDto,
      userId,
    );

    return new PostResponseDto(updatedPost, userId);
  }
}
