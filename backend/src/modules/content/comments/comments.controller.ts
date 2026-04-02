import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { OptionalJwtAuthGuard } from 'src/modules/auth/guards/optional-jwt.guard';
import { GetUserId } from 'src/modules/auth/decorators/get-user-id.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/create-comment.dto';
import { plainToInstance } from 'class-transformer';
import { CommentTreeResponseDto } from './dto/response/comment-tree-response.dto';

@Controller('posts/:id/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Param('id') postId: string,
    @GetUserId() currentUserId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.createComment(
      postId,
      currentUserId,
      dto,
    );

    const commentToResponse = {
      ...comment,
      isOwner: true,
      replies: [],
    };

    return plainToInstance(CommentTreeResponseDto, commentToResponse, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getCommentsTreeByPost(
    @Param('id') postId: string,
    @GetUserId() userId?: string,
  ) {
    const commentsTree = await this.commentsService.getCommentsTreeByPost(
      postId,
      userId,
    );

    return plainToInstance(CommentTreeResponseDto, commentsTree, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(
    @Param('commentId') commentId: string,
    @GetUserId() userId: string,
  ) {
    return this.commentsService.deleteComment(commentId, userId);
  }
}
