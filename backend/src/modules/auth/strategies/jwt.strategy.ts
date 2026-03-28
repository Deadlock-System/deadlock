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
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          return req?.cookies?.access_token;
        },
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    if (payload.type && payload.type !== 'access') {
      throw new InvalidAccessTokenException();
    }

    return {
      userId: payload.sub,
      username: payload.username,
    };
  }
}
