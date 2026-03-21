import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app/app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppException } from './common/exceptions/app.exception';
import { RequestErrorCode } from './common/exceptions/error-codes/request-error.code';
import { RequestErrorMessages } from './common/exceptions/error-messages/request-error-messages';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  app.enableCors({
    origin: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: () => {
        return new AppException({
          code: RequestErrorCode.INVALID_REQUEST_FORMAT,
          message: RequestErrorMessages.INVALID_REQUEST_FORMAT,
          status: 400,
        });
      },
    }),
    new SanitizePipe()
  );

  const configSwagger = new DocumentBuilder()
    .setTitle('Deadlock API')
    .setVersion('1.0')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('docs', app, documentFactory);

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

