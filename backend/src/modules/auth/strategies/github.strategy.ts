import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { OAuthLoginUseCase } from '../useCases/oauth-login-usecase';
import { ProviderType } from '@prisma/client';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly oauthLoginUseCase: OAuthLoginUseCase) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.APP_URL}/auth/github/callback`,
      scope: ['user:email', 'read:user'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;

    return this.oauthLoginUseCase.execute({
      providerId: profile.id,
      providerEmail: email,
      providerUsername: profile.username,
      providerAvatar: avatar,
      providerType: ProviderType.GITHUB,
    });
  }
}
