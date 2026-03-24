import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InvalidAccessTokenException } from '../exceptions/auth.exceptions';

type JwtPayload = {
  sub: string;
  username: string;
  type: 'access' | 'refresh';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type && payload.type !== 'access') {
      throw new InvalidAccessTokenException();
    }

    return {
      userId: payload.sub,
      username: payload.username,
    };
  }
}
