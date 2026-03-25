import { Injectable } from '@nestjs/common';
import { OAuthLoginDto } from '../dto/oauth-login.dto';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { UserProviderRepository } from 'src/modules/user/repositories/user-provider.repository';

@Injectable()
export class OAuthLoginUseCase {
  constructor(
    private readonly userProviderRepository: UserProviderRepository,
    private readonly UserRepository: UserRepository,
  ) {}

  async execute(oauthLoginDto: OAuthLoginDto) {
    const existingProvider = await this.userProviderRepository.findByProvider(
      oauthLoginDto.providerType,
      oauthLoginDto.providerId,
    );

    if (existingProvider) return existingProvider;

    if (oauthLoginDto.providerEmail) {
      const existingUser = await this.UserRepository.findByEmail(
        oauthLoginDto.providerEmail,
      );

      if (existingUser) {
        await this.userProviderRepository.linkProvider(existingUser.id, {
          provider: oauthLoginDto.providerType,
          providerId: oauthLoginDto.providerId,
        });
        return existingUser;
      }
    }

    return this.UserRepository.createWithProvider({
      providerId: oauthLoginDto.providerId,
      providerType: oauthLoginDto.providerType,
      providerAvatar: oauthLoginDto.providerAvatar,
      providerEmail: oauthLoginDto.providerEmail,
    });
  }
}
