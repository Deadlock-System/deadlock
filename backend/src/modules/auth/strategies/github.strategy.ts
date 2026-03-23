import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    const clientID = process.env.GITHUB_CLIENT_ID || 'fake_id';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'fake_secret';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    super({
      clientID,
      clientSecret,
      callbackURL: `${appUrl}/auth/github/callback`,
      scope: ['user:email', 'read:user'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
      username?: string;
      emails?: Array<{ value?: string }>;
      photos?: Array<{ value?: string }>;
    },
  ) {
    const email = profile.emails?.find((e) => e.value)?.value;
    if (!email) {
      throw new UnauthorizedException('E-mail do GitHub não encontrado');
    }

    const username = profile.username || email.split('@')[0] || 'user';
    const userPhoto = profile.photos?.find((p) => p.value)?.value;

    return { email, username, userPhoto };
  }
}
