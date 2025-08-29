import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// Change the import style for cookie-parser
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('setup.port') || 8083;
  const env = configService.get<string>('setup.env');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Important for data transformation
    }),
  );

  await app.listen(port);
  console.log(`🚀 App running on http://localhost:${port} [${env}]`);
}

bootstrap();
