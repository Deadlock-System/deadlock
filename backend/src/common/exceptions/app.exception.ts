import { HttpException, HttpStatus } from '@nestjs/common';

interface AppExceptionParams {
  code: string;
  message: string;
  status: HttpStatus;
}

export class AppException extends HttpException {
  public readonly code: string;

  constructor({
    code,
    message,
    status = HttpStatus.BAD_REQUEST,
  }: AppExceptionParams) {
    super({ code, message }, status);
    this.code = code;
  }
}
