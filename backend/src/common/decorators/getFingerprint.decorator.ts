import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithFingerprint } from '../interceptors/fingerprint.interceptor';

export const GetFingerprint = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithFingerprint>();

    return request.fingerprint;
  },
);
