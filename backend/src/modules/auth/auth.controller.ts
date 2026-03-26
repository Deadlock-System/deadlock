import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { User } from '../user/entities/user.entity';
import type { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signIn')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.authenticate(signInDto);
  }

  @Post('auth/refreshToken')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
  
  @Post('auth/google')
  async googleRegister(
    @Body() googleSignUpDto: { credential?: string },
  ): Promise<SignInResponseDto> {
    return this.authService.registerWithGoogle(googleSignUpDto);
  }

  @Get('auth/github')
  @UseGuards(GithubAuthGuard)
  async githubLogin() {}

  @Get('auth/github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(@Req() req, @Res() res: Response) {
    const user = req.user as User;

    const authTokens = await this.authService.generateAuthTokens(
      user.id,
      user.username,
    );

    res.cookie('access_token', authTokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });

    res.cookie('refresh_token', authTokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
    });

    // return res.redirect('http://localhost:3000/');
  }
}
