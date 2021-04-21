import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { useGovUkUi, useHelmet, usePassport, useRedisSession } from './bootstrap';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});

  useHelmet(app);
  useGovUkUi(app);
  useRedisSession(app);
  usePassport(app);

  await app.listen(3000);
}

bootstrap();
