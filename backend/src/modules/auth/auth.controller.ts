import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GithubAuthGuard } from './guards/github-auth.guard';

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

  @Get('auth/github')
  @UseGuards(GithubAuthGuard)
  async githubLogin() {}

  @Get('auth/github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(@Req() req) {}
}
