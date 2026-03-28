import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true, 
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
