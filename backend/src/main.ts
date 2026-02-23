require('dotenv').config();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS
  // '..' sube un nivel fuera de 'backend' para entrar en la carpeta 'public' de la raíz
  const publicPath = join(process.cwd(), '..', 'public');
  app.useStaticAssets(publicPath);

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));

  app.enableCors();
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('----------------------------------------------------');
  console.log(`🚀 Servidor en: http://localhost:${port}`);
  console.log(`📂 Carpeta pública vinculada: ${publicPath}`);
  console.log('----------------------------------------------------');
}
bootstrap();