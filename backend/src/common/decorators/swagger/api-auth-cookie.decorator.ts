import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ApiAppError } from './api-app-error.decorator';
import { AuthErrorCode } from 'src/common/exceptions/error-codes/auth-error-codes';
import { AuthErrorMessages } from 'src/common/exceptions/error-messages/auth-error-messages';

export function ApiAuthCookie() {
  return applyDecorators(
    ApiCookieAuth('access_token'),
    ApiAppError(HttpStatus.UNAUTHORIZED, 'Acesso não autorizado.', {
      title: 'Acesso não autorizado',
      code: AuthErrorCode.INVALID_ACCESS_TOKEN,
      message: AuthErrorMessages.INVALID_ACCESS_TOKEN,
    }),
  );
}
