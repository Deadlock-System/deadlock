import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { User } from '../user/entities/user.entity';
import { CookieService } from './services/cookie-service';
import { RefreshTokenNotFoundException } from './exceptions/auth.exceptions';
import type { Response, Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiAppError } from 'src/common/decorators/swagger/api-app-error.decorator';
import { AuthErrorCode } from 'src/common/exceptions/error-codes/auth-error-codes';
import { AuthErrorMessages } from 'src/common/exceptions/error-messages/auth-error-messages';
import { RequestErrorCode } from 'src/common/exceptions/error-codes/request-error.code';
import { RequestErrorMessages } from 'src/common/exceptions/error-messages/request-error-messages';

@ApiTags('Auth | Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  private async handleOAuthLogin(user: User, res: Response) {
    const tokens = await this.authService.generateAuthTokens(
      user.id,
      user.username,
    );

    this.cookieService.setAuthCookies(res, tokens);
  }

  @Post('signIn')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Login com e-mail e senha',
    description:
      'Autentica o usuário com credenciais (e-mail e senha) e define os cookies de access_token e refresh_token na resposta.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'Login realizado com sucesso. Cookies de autenticação definidos.',
  })
  @ApiAppError(HttpStatus.UNAUTHORIZED, 'Credenciais inválidas.', {
    title: 'Credenciais inválidas',
    code: AuthErrorCode.INVALID_CREDENTIALS,
    message: AuthErrorMessages.INVALID_CREDENTIALS,
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
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokens = await this.authService.authenticate(signInDto);
    this.cookieService.setAuthCookies(res, tokens);
  }

  @Post('refreshToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Renovar tokens de autenticação',
    description:
      'Utiliza o refresh_token presente nos cookies para gerar novos tokens de acesso e refresh.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'Tokens renovados com sucesso. Novos cookies de autenticação definidos.',
  })
  @ApiAppError(
    HttpStatus.NOT_FOUND,
    'Refresh token não encontrado nos cookies.',
    {
      title: 'Refresh token não encontrado',
      code: AuthErrorCode.REFRESH_TOKEN_NOT_FOUND,
      message: AuthErrorMessages.REFRESH_TOKEN_NOT_FOUND,
    },
  )
  @ApiAppError(HttpStatus.UNAUTHORIZED, 'Refresh token inválido ou expirado.', {
    title: 'Refresh token inválido',
    code: AuthErrorCode.INVALID_REFRESH_TOKEN,
    message: AuthErrorMessages.INVALID_REFRESH_TOKEN,
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new RefreshTokenNotFoundException();

    const tokens = await this.authService.refreshToken(refreshToken);
    this.cookieService.setAuthCookies(res, tokens);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Iniciar login com Google',
    description:
      'Redireciona o usuário para a tela de consentimento do Google OAuth.',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirecionamento para o Google OAuth.',
  })
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Callback do Google OAuth',
    description:
      'Recebe o retorno do Google após autenticação, gera os tokens e redireciona para o frontend.',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description:
      'Autenticação realizada com sucesso. Cookies definidos e redirecionamento para o frontend.',
  })
  async googleCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as User;
    await this.handleOAuthLogin(user, res);

    return res.redirect(process.env.FRONTEND_URL!);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({
    summary: 'Iniciar login com GitHub',
    description:
      'Redireciona o usuário para a tela de autorização do GitHub OAuth.',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirecionamento para o GitHub OAuth.',
  })
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({
    summary: 'Callback do GitHub OAuth',
    description:
      'Recebe o retorno do GitHub após autenticação, gera os tokens e redireciona para o frontend.',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description:
      'Autenticação realizada com sucesso. Cookies definidos e redirecionamento para o frontend.',
  })
  async githubCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as User;
    await this.handleOAuthLogin(user, res);

    return res.redirect(process.env.FRONTEND_URL!);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout',
    description:
      'Limpa os cookies de autenticação (access_token e refresh_token), encerrando a sessão do usuário.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Logout realizado com sucesso. Cookies removidos.',
  })
  logout(@Res({ passthrough: true }) res: Response): void {
    this.cookieService.clear(res);
  }
}
