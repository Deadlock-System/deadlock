import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions/app.exception';
import { PostErrorCode } from 'src/common/exceptions/error-codes/post-error.codes';
import { PostErrorMessage } from 'src/common/exceptions/error-messages/post-error-messages';

export class PostNotFoundException extends AppException {
  constructor() {
    super({
      code: PostErrorCode.POST_NOT_FOUND,
      message: PostErrorMessage.POST_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    });
  }
}

export class UserIsNotOwnerException extends AppException {
  constructor() {
    super({
      code: PostErrorCode.USER_IS_NOT_OWNER,
      message: PostErrorMessage.USER_IS_NOT_OWNER,
      status: HttpStatus.FORBIDDEN,
    });
  }
}
