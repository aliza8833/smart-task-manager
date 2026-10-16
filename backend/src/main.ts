import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allows Next.js frontend to talk to NestJS
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4000);
  console.log(`NestJS Backend running on http://localhost:4000`);
}
bootstrap();
