require('dotenv').config();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';

// Establecer la ruta base del proyecto como variable global ANTES de cargar los módulos
const projectRoot = path.resolve(__dirname, '../..');
console.log('__dirname en main.ts:', __dirname);
console.log('projectRoot configurado en:', projectRoot);
globalThis['projectRoot'] = projectRoot;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  await app.listen(3000);
  console.log('Nest backend listening on http://localhost:3000');
}

bootstrap();
