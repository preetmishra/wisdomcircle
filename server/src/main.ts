import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>("port");

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // NOTE: Should be more restrictive in production.
  app.enableCors();

  await app.listen(port);
  Logger.log(`Server is listening at ${port}`);
}
bootstrap();
