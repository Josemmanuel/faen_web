require('dotenv').config();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import cookieParser = require('cookie-parser');   // ← NUEVO
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Archivos estáticos (frontend)
  const publicPath = join(process.cwd(), '..', 'public');
  app.useStaticAssets(publicPath);

  // ── Middlewares ────────────────────────────────────────────────────────────
  // cookie-parser es NECESARIO para que el backend pueda leer req.cookies.jwt
  app.use(cookieParser());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS con credentials: true para que el browser envíe las cookies
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('----------------------------------------------------');
  console.log(`🚀 Servidor en: http://localhost:${port}`);
  console.log(`📂 Carpeta pública vinculada: ${publicPath}`);
  console.log('----------------------------------------------------');
}
bootstrap();