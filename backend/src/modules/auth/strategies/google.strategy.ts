import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { OAuthLoginUseCase } from '../useCases/oauth-login-usecase';
import { ProviderType } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly oauthLoginUseCase: OAuthLoginUseCase) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.APP_URL}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;

    return this.oauthLoginUseCase.execute({
      providerId: profile.id,
      providerEmail: email,
      providerUsername: profile.username,
      providerAvatar: avatar,
      providerType: ProviderType.GOOGLE,
    });
  }
}
