import { Injectable } from '@nestjs/common';
import { Response } from 'express';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class CookieService {
  setAuthCookies(res: Response, tokens: AuthTokens) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  clear(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
