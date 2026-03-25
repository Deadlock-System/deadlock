import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { Profile } from 'passport-github2';
import { ProviderType } from '@prisma/client';
import { OAuthLoginDto } from '../dto/oauth-login.dto';

@Injectable()
export class OAuthLoginUseCase {
  constructor() {}

  async execute(profileInfo: OAuthLoginDto) {
    console.log(profileInfo);
  }
}
