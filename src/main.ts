import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorHandlingInterceptor } from './common/interceptors/errorHandling.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove chaves que não estão no DTO
      forbidNonWhitelisted: true, // retorna um erro quando for enviado uma chave que não existe no DTO
      transform: false, // tenta converter os tipos de dados de params e DTOs
    }),
  );

  app.useGlobalInterceptors(new ErrorHandlingInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
