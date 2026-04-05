import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
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
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthCookie } from 'src/common/decorators/swagger/api-auth-cookie.decorator';
import { ApiAppError } from 'src/common/decorators/swagger/api-app-error.decorator';
import {
  ApiPaginatedPostResponse,
  ApiPostResponse,
} from 'src/common/decorators/swagger/api-post-response.decorator';
import { PostErrorCode } from 'src/common/exceptions/error-codes/post-error.codes';
import { PostErrorMessage } from 'src/common/exceptions/error-messages/post-error-messages';
import { RequestErrorCode } from 'src/common/exceptions/error-codes/request-error.code';
import { RequestErrorMessages } from 'src/common/exceptions/error-messages/request-error-messages';
import { FingerprintInterceptor } from 'src/common/interceptors/fingerprint.interceptor';
import { GetFingerprint } from 'src/common/decorators/getFingerprint.decorator';
import { ViewsService } from 'src/modules/engagement/views/views.service';

@ApiTags('Posts | Postagens')
@ApiExtraModels(PostResponseDto)
@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly viewsService: ViewsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiAuthCookie()
  @ApiOperation({
    summary: 'Criar um post',
    description:
      'Cria um novo post. O autor pode optar por publicá-lo anonimamente e associar linguagens/tecnologias.',
  })
  @ApiPostResponse(HttpStatus.CREATED, 'Post criado com sucesso.')
  @ApiAppError(
    HttpStatus.BAD_REQUEST,
    'Erro de validação nos campos enviados.',
    {
      title: 'Requisição inválida',
      code: RequestErrorCode.INVALID_REQUEST_FORMAT,
      message: RequestErrorMessages.INVALID_REQUEST_FORMAT,
    },
  )
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
  @ApiOperation({
    summary: 'Listar posts',
    description:
      'Retorna uma lista paginada de posts ordenados por data de criação (mais recentes primeiro).',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página para paginação.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade de posts por página.',
    example: 20,
  })
  @ApiPaginatedPostResponse(
    HttpStatus.OK,
    'Lista de posts retornada com sucesso.',
  )
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

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(FingerprintInterceptor)
  @ApiOperation({
    summary: 'Buscar post por ID',
    description:
      'Retorna os detalhes de um post específico. Oculta automaticamente dados do autor caso o post seja anônimo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do Post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiPostResponse(HttpStatus.OK, 'Post retornado com sucesso.')
  @ApiAppError(HttpStatus.NOT_FOUND, 'Post não encontrado.', {
    title: 'Post não encontrado',
    code: PostErrorCode.POST_NOT_FOUND,
    message: PostErrorMessage.POST_NOT_FOUND,
  })
  async findOneById(
    @Param('id') postId: string,
    @GetUserId() userId: string,
    @GetFingerprint() fingerprint: string,
  ) {
    const post = await this.postsService.findOneById(postId);

    this.viewsService.incrementView(postId, fingerprint).catch((error) => {
      console.error('Error incrementing view:', error);
    });

    return new PostResponseDto(post, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuthCookie()
  @ApiOperation({
    summary: 'Atualizar post',
    description:
      'Atualiza os dados de um post existente. Apenas o autor do post pode editá-lo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do Post',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiPostResponse(HttpStatus.OK, 'Post atualizado com sucesso.')
  @ApiAppError(HttpStatus.NOT_FOUND, 'Post não encontrado.', {
    title: 'Post não encontrado',
    code: PostErrorCode.POST_NOT_FOUND,
    message: PostErrorMessage.POST_NOT_FOUND,
  })
  @ApiAppError(
    HttpStatus.FORBIDDEN,
    'Ação não permitida. Apenas o autor pode editar o post.',
    {
      title: 'Usuário não é o dono do post',
      code: PostErrorCode.USER_IS_NOT_OWNER,
      message: PostErrorMessage.USER_IS_NOT_OWNER,
    },
  )
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
