import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

interface HttpExceptionResponse {
  message?: string | string[];
  code?: string;
  [key: string]: unknown;
}

interface UnknownException {
  message?: string;
  [key: string]: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const requestId = randomUUID();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : 500;

    const exceptionResponse = isHttp ? exception.getResponse() : null;

    const errorResponse =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as HttpExceptionResponse) || {};

    const message = isHttp
      ? Array.isArray(errorResponse.message)
        ? errorResponse.message.join(', ')
        : errorResponse.message
      : (exception as UnknownException)?.message;

    const code = errorResponse.code || (isHttp ? 'HTTP_ERROR' : 'ERROR');

    response.status(status).json({
      status,
      code,
      message: message || 'Erro interno do servidor',
      path: request.url,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
