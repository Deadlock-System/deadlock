import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { Request } from 'express';
import { Observable } from 'rxjs';

export type RequestWithFingerprint = Request & { fingerprint: string };

@Injectable()
export class FingerprintInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<RequestWithFingerprint>();

    const forwardedFor = request.headers['x-forwarded-for'];
    const ip =
      forwardedFor && typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]
        : request.ip || request.socket.remoteAddress;

    const userAgent = request.headers['user-agent'] || 'unknown';

    const fingerprint = createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');

    request.fingerprint = fingerprint;

    return next.handle();
  }
}
