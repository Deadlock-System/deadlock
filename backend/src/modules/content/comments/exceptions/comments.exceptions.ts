import { HttpStatus } from '@nestjs/common';
import { AppException } from 'src/common/exceptions/app.exception';
import { CommentErrorCode } from 'src/common/exceptions/error-codes/comment-error-codes';
import { CommentErrorMessages } from 'src/common/exceptions/error-messages/comment-error-messages';

export class CommentNotFoundException extends AppException {
  constructor() {
    super({
      code: CommentErrorCode.COMMENT_NOT_FOUND,
      message: CommentErrorMessages.COMMENT_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    });
  }
}

export class ParentCommentException extends AppException {
  constructor() {
    super({
      code: CommentErrorCode.PARENT_COMMENT_EXCEPTION,
      message: CommentErrorMessages.PARENT_COMMENT_EXCEPTION,
      status: HttpStatus.BAD_REQUEST,
    });
  }
}

export class CommentNotOwnerException extends AppException {
  constructor() {
    super({
      code: CommentErrorCode.COMMENT_NOT_OWNER,
      message: CommentErrorMessages.COMMENT_NOT_OWNER,
      status: HttpStatus.FORBIDDEN,
    });
  }
}

export class CommentAlreadyDeletedException extends AppException {
  constructor() {
    super({
      code: CommentErrorCode.COMMENT_ALREADY_DELETED,
      message: CommentErrorMessages.COMMENT_ALREADY_DELETED,
      status: HttpStatus.BAD_REQUEST,
    });
  }
}
