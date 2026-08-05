import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Constants } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const config = new DocumentBuilder()
    .setTitle('pikai 쇼핑몰')
    .setDescription('API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  app.setGlobalPrefix('pikai');
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  app.enableCors({
    origin: `${Constants.front}`,
    credentials: true, // 쿠키나 인증 헤더를 허용할지 여부
  });
  await app.listen(Constants.port);
  console.log(
    `Pikai 쇼핑몰 시작 : http://localhost:${Constants.port} (Swagger) 문서: /docs`,
  );
}
bootstrap();
