import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InvalidAccessTokenException } from '../exceptions/auth.exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret =
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      'fake_jwt_secret';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
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
