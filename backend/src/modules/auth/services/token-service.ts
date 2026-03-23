import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';

interface JwtPayload {
  sub: string;
  username: string;
}

type JwtPayloadWithType = JwtPayload & {
  type: 'access' | 'refresh';
};

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(payload: JwtPayload): string {
    const expiresIn: StringValue =
      (process.env.JWT_ACCESS_TTL as StringValue) || '15m';

    const tokenPayload: JwtPayloadWithType = {
      ...payload,
      type: 'access',
    };

    return this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn,
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    const expiresIn: StringValue =
      (process.env.JWT_REFRESH_TTL as StringValue) || '7d';

    const tokenPayload: JwtPayloadWithType = {
      ...payload,
      type: 'refresh',
    };

    return this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn,
    });
  }
}
