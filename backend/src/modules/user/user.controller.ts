import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthCookie } from 'src/common/decorators/swagger/api-auth-cookie.decorator';
import { ApiAppError } from 'src/common/decorators/swagger/api-app-error.decorator';
import { UserErrorCode } from 'src/common/exceptions/error-codes/user-error-codes';
import { UserErrorMessages } from 'src/common/exceptions/error-messages/user-error-messages';
import { RequestErrorCode } from 'src/common/exceptions/error-codes/request-error.code';
import { RequestErrorMessages } from 'src/common/exceptions/error-messages/request-error-messages';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users | Usuários')
@ApiExtraModels(UserResponseDto)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description:
      'Registra um novo usuário com e-mail, nome de usuário e senha.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso.',
    type: UserResponseDto,
  })
  @ApiAppError(
    HttpStatus.CONFLICT,
    'E-mail ou nome de usuário já em uso.',
    {
      title: 'E-mail já existe',
      code: UserErrorCode.EMAIL_ALREADY_EXISTS,
      message: UserErrorMessages.EMAIL_ALREADY_EXISTS,
    },
    {
      title: 'Nome de usuário já existe',
      code: UserErrorCode.USERNAME_ALREADY_EXISTS,
      message: UserErrorMessages.USERNAME_ALREADY_EXISTS,
    },
  )
  @ApiAppError(
    HttpStatus.BAD_REQUEST,
    'Erro de validação ou senhas não conferem.',
    {
      title: 'Senhas não conferem',
      code: UserErrorCode.INVALID_PASSWORD,
      message: UserErrorMessages.INVALID_PASSWORD,
    },
    {
      title: 'Requisição inválida',
      code: RequestErrorCode.INVALID_REQUEST_FORMAT,
      message: RequestErrorMessages.INVALID_REQUEST_FORMAT,
    },
  )
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna todos os usuários cadastrados.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuários retornada com sucesso.',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuthCookie()
  @ApiOperation({
    summary: 'Buscar perfil do usuário logado',
    description:
      'Retorna os dados do usuário autenticado com base no token JWT.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados do usuário retornados com sucesso.',
    type: UserResponseDto,
  })
  @ApiAppError(HttpStatus.NOT_FOUND, 'Usuário não encontrado.', {
    title: 'Usuário não encontrado',
    code: UserErrorCode.USER_NOT_FOUND,
    message: UserErrorMessages.USER_NOT_FOUND,
  })
  findByUserId(@GetUserId() userId: string) {
    return this.userService.findByUserId(userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuthCookie()
  @ApiOperation({
    summary: 'Atualizar perfil do usuário',
    description:
      'Atualiza os dados do perfil do usuário autenticado (nome de usuário, foto e senioridade).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil atualizado com sucesso.',
    type: UserResponseDto,
  })
  @ApiAppError(HttpStatus.NOT_FOUND, 'Usuário não encontrado.', {
    title: 'Usuário não encontrado',
    code: UserErrorCode.USER_NOT_FOUND,
    message: UserErrorMessages.USER_NOT_FOUND,
  })
  @ApiAppError(HttpStatus.CONFLICT, 'Nome de usuário já em uso.', {
    title: 'Nome de usuário já existe',
    code: UserErrorCode.USERNAME_ALREADY_EXISTS,
    message: UserErrorMessages.USERNAME_ALREADY_EXISTS,
  })
  @ApiAppError(
    HttpStatus.BAD_REQUEST,
    'Erro de validação nos campos enviados.',
    {
      title: 'Requisição inválida',
      code: RequestErrorCode.INVALID_REQUEST_FORMAT,
      message: RequestErrorMessages.INVALID_REQUEST_FORMAT,
    },
  )
  update(@Body() updateUserDto: UpdateUserDto, @GetUserId() userId: string) {
    return this.userService.update(updateUserDto, userId);
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('jwt'))
  @ApiAuthCookie()
  @ApiOperation({
    summary: 'Alterar senha',
    description:
      'Altera a senha do usuário autenticado. Exige a senha atual para confirmação e revoga os tokens anteriores.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Senha alterada com sucesso.',
    schema: {
      properties: {
        message: { type: 'string', example: 'Senha redefinida com sucesso' },
      },
    },
  })
  @ApiAppError(HttpStatus.NOT_FOUND, 'Usuário não encontrado.', {
    title: 'Usuário não encontrado',
    code: UserErrorCode.USER_NOT_FOUND,
    message: UserErrorMessages.USER_NOT_FOUND,
  })
  @ApiAppError(
    HttpStatus.BAD_REQUEST,
    'Senha atual incorreta ou senhas não conferem.',
    {
      title: 'Senha inválida',
      code: UserErrorCode.INVALID_PASSWORD,
      message: UserErrorMessages.INVALID_PASSWORD,
    },
    {
      title: 'Requisição inválida',
      code: RequestErrorCode.INVALID_REQUEST_FORMAT,
      message: RequestErrorMessages.INVALID_REQUEST_FORMAT,
    },
  )
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @GetUserId() userId: string,
  ) {
    return this.userService.updatePassword(updatePasswordDto, userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover usuário',
    description: 'Remove um usuário pelo ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário a ser removido.',
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário removido com sucesso.',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
