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
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokens = await this.authService.authenticate(signInDto);
    this.cookieService.setAuthCookies(res, tokens);
  }

  @Post('refreshToken')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
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
  async githubLogin() {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
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
  logout(@Res({ passthrough: true }) res: Response): void {
    this.cookieService.clear(res);
  }
}
