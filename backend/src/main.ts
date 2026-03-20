import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppException } from './common/exceptions/app.exception';
import { RequestErrorCode } from './common/exceptions/error-codes/request-error.code';
import { RequestErrorMessages } from './common/exceptions/error-messages/request-error-messages';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: () => {
        return new AppException({
          code: RequestErrorCode.INVALID_REQUEST_FORMAT,
          message: RequestErrorMessages.INVALID_REQUEST_FORMAT,
          status: 400,
        });
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
