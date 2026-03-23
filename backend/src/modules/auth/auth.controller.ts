import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refreshToken')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('google')
  async googleRegister(
    @Body() googleSignUpDto: { credential?: string },
  ): Promise<SignInResponseDto> {
    return this.authService.registerWithGoogle(googleSignUpDto);
  }

  @Get('github')
  githubAuth(@Res() res: Response) {
    const authorizeUrl = this.authService.getGithubAuthorizeUrl();
    res.redirect(authorizeUrl);
  }

  @Get('github/callback')
  async githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('Código do GitHub não encontrado');
    }

    const result = await this.authService.registerWithGithubCode({
      code,
      state,
    });

    const frontendUrl = this.authService.getFrontendUrl();
    const hash = new URLSearchParams({
      provider: 'github',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      isNewUser: String(Boolean(result.isNewUser)),
    }).toString();

    res.redirect(`${frontendUrl}/register#${hash}`);
  }
}

@Controller()
export class LegacyAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signIn')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.authenticate(signInDto);
  }
}
