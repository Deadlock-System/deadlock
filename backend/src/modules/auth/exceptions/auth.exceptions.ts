import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions/app.exception';
import { AuthErrorCode } from 'src/common/exceptions/error-codes/auth-error-codes';
import { AuthErrorMessages } from 'src/common/exceptions/error-messages/auth-error-messages';

export class RefreshTokenNotFoundException extends AppException {
  constructor() {
    super({
      code: AuthErrorCode.REFRESH_TOKEN_NOT_FOUND,
      message: AuthErrorMessages.REFRESH_TOKEN_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    });
  }
}

export class InvalidRefreshTokenException extends AppException {
  constructor() {
    super({
      code: AuthErrorCode.INVALID_REFRESH_TOKEN,
      message: AuthErrorMessages.INVALID_REFRESH_TOKEN,
      status: HttpStatus.UNAUTHORIZED,
    });
  }
}

export class InvalidAccessTokenException extends AppException {
  constructor() {
    super({
      code: AuthErrorCode.INVALID_ACCESS_TOKEN,
      message: AuthErrorMessages.INVALID_ACCESS_TOKEN,
      status: HttpStatus.UNAUTHORIZED,
    });
  }
}

export class InvalidCredentialException extends AppException {
  constructor() {
    super({
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: AuthErrorMessages.INVALID_CREDENTIALS,
      status: HttpStatus.UNAUTHORIZED,
    });
  }
}