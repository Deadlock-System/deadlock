import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { InvalidTokenTypeException } from '../exceptions/auth.exceptions';

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

  verifyRefreshToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    if (payload.type !== 'refresh') throw new InvalidTokenTypeException();
    return payload;
  }
}
