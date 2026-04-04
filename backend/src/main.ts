import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppException } from './common/exceptions/app.exception';
import { RequestErrorCode } from './common/exceptions/error-codes/request-error.code';
import { RequestErrorMessages } from './common/exceptions/error-messages/request-error-messages';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    }),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
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
    new SanitizePipe(),
  );

  app.use(cookieParser());

  const configSwagger = new DocumentBuilder()
    .setTitle('Deadlock API')
    .setDescription('Documentação oficial da API do Deadlock')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, configSwagger);

  app.use(
    '/docs',
    apiReference({
      content: documentFactory,
      theme: 'elysiajs',
      layout: 'modern',
      metaData: {
        title: 'Deadlock API Docs',
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
