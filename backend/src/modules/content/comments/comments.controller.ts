import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthCookie } from 'src/common/decorators/swagger/api-auth-cookie.decorator';
import { ApiAppError } from 'src/common/decorators/swagger/api-app-error.decorator';
import { CommentErrorCode } from 'src/common/exceptions/error-codes/comment-error-codes';
import { CommentErrorMessages } from 'src/common/exceptions/error-messages/comment-error-messages';
import { PostErrorCode } from 'src/common/exceptions/error-codes/post-error.codes';
import { PostErrorMessage } from 'src/common/exceptions/error-messages/post-error-messages';
import { ApiCommentResponse } from 'src/common/decorators/swagger/api-comment-response.decorator';
import {
  VotesService,
  VoteTarget,
} from 'src/modules/engagement/votes/votes.service';
import { VoteDto } from 'src/modules/engagement/votes/dto/vote.dto';

@ApiTags('Comments | Comentários')
@ApiExtraModels(CommentTreeResponseDto)
@Controller('posts/:id/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly votesService: VotesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiAuthCookie()
  @ApiOperation({
    summary: 'Criar um comentário',
    description:
      'Cria um comentário raiz no post ou uma resposta a outro comentário (enviando o parentCommentId).',
  })
  @ApiParam({ name: 'postId', description: 'ID do Post' })
  @ApiCommentResponse(
    HttpStatus.CREATED,
    'Comentário criado com sucesso. Retorna os dados com ou sem o user dependendo da flag anonymous.',
  )
  @ApiAppError(
    HttpStatus.BAD_REQUEST,
    'Requisição inválida (Ex: Cross-Post Reply detectado).',
    {
      title: 'Comentário não pertence ao post',
      code: CommentErrorCode.PARENT_COMMENT_EXCEPTION,
      message: CommentErrorMessages.PARENT_COMMENT_EXCEPTION,
    },
  )
  @ApiAppError(
    HttpStatus.NOT_FOUND,
    'Post ou Comentário pai não encontrado.',
    {
      title: 'Comentário não encontrado',
      code: CommentErrorCode.COMMENT_NOT_FOUND,
      message: CommentErrorMessages.COMMENT_NOT_FOUND,
    },
    {
      title: 'Post não encontrado',
      code: PostErrorCode.POST_NOT_FOUND,
      message: PostErrorMessage.POST_NOT_FOUND,
    },
  )
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

  @Post(':commentId/vote')
  @UseGuards(AuthGuard('jwt'))
  async voteOnComment(
    @Param('commentId') commentId: string,
    @GetUserId() userId: string,
    @Body() body: VoteDto,
  ) {
    return this.votesService.toggleVote(
      userId,
      commentId,
      VoteTarget.COMMENT,
      body.value,
    );
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Listar comentários do Post',
    description:
      'Retorna toda a árvore recursiva de comentários de um post. Oculta automaticamente dados de autores anônimos.',
  })
  @ApiParam({
    name: 'postId',
    description: 'ID do Post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiCommentResponse(
    HttpStatus.OK,
    'Árvore de comentários retornada com sucesso.',
  )
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
  @ApiAuthCookie()
  @ApiOperation({
    summary: 'Excluir comentário (Soft Delete)',
    description:
      'Remove o conteúdo e a autoria do comentário, preservando as respostas filhas na árvore para não quebrar a discussão.',
  })
  @ApiParam({ name: 'id', description: 'ID do Post' })
  @ApiParam({
    name: 'commentId',
    description: 'ID do Comentário a ser excluído',
  })
  @ApiResponse({
    status: 200,
    description: 'Comentário excluído com sucesso.',
    example: { message: 'Comentário excluído com sucesso.' },
  })
  @ApiAppError(
    HttpStatus.FORBIDDEN,
    'Ação não permitida. Apenas o autor pode excluir o comentário',
    {
      title: 'Comentário não pertence ao usuário',
      code: CommentErrorCode.COMMENT_NOT_OWNER,
      message: CommentErrorMessages.COMMENT_NOT_OWNER,
    },
  )
  @ApiAppError(HttpStatus.NOT_FOUND, 'Comentário não encontrado.', {
    title: 'Comentário não encontrado',
    code: CommentErrorCode.COMMENT_NOT_FOUND,
    message: CommentErrorMessages.COMMENT_NOT_FOUND,
  })
  @ApiAppError(HttpStatus.BAD_REQUEST, 'Comentário já excluído.', {
    title: 'Comentário já excluído',
    code: CommentErrorCode.COMMENT_ALREADY_DELETED,
    message: CommentErrorMessages.COMMENT_ALREADY_DELETED,
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @GetUserId() userId: string,
  ) {
    return this.commentsService.deleteComment(commentId, userId);
  }
}
