import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions/app.exception';
import { UserErrorCode } from 'src/common/exceptions/error-codes/user-error-codes';
import { UserErrorMessages } from 'src/common/exceptions/error-messages/user-error-messages';

export class EmailAlreadyExistsException extends AppException {
  constructor() {
    super({
      code: UserErrorCode.EMAIL_ALREADY_EXISTS,
      message: UserErrorMessages.EMAIL_ALREADY_EXISTS,
      status: HttpStatus.CONFLICT,
    });
  }
}

export class UsernameAlreadyExistsException extends AppException {
  constructor() {
    super({
      code: UserErrorCode.USERNAME_ALREADY_EXISTS,
      message: UserErrorMessages.USERNAME_ALREADY_EXISTS,
      status: HttpStatus.CONFLICT,
    });
  }
}

export class InvalidPasswordException extends AppException {
  constructor() {
    super({
      code: UserErrorCode.INVALID_PASSWORD,
      message: UserErrorMessages.INVALID_PASSWORD,
      status: HttpStatus.BAD_REQUEST,
    });
  }
}

export class UserNotFoundException extends AppException {
  constructor() {
    super({
      code: UserErrorCode.USER_NOT_FOUND,
      message: UserErrorMessages.USER_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    });
  }
}