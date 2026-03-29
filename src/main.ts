import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prefix = 'api';

  app.setGlobalPrefix(prefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: false },
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`✅ Server is running on http://localhost:${port}/${prefix}`);

  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // Вывод списка всех роутов
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  console.log('\n📋 Registered Routes:\n');
  console.table(
    router.stack
      .filter((layer: any) => layer.route) // только реальные роуты
      .map((layer: any) => ({
        method: Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase())
          .join(', '),
        path: layer.route.path,
        fullPath:
          (app.getHttpAdapter().getInstance().mountpath || '') +
          layer.route.path,
      })),
  );
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
}
bootstrap();
