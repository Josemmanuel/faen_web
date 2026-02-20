import { Module } from '@nestjs/common';
import { join, resolve } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { NewsModule } from './news/news.module';
import { GaleriaModule } from './galeria/galeria.module';
import { DocumentsModule } from './documents/documents.module';
import { CarrerasModule } from './carreras/carreras.module';
import { AutoridadesModule } from './autoridades/autoridades.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { ConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Servir los archivos estáticos (tu carpeta `public` un nivel arriba de `backend/`)
    ServeStaticModule.forRoot({
      rootPath: resolve((globalThis as any)['projectRoot'] || resolve(__dirname, '../..'), 'public'),
      exclude: ['/api(.*)'],
      serveRoot: '/',
    }),
    ConfigModule,
    AuthModule,
    UsersModule,
    NewsModule,
    GaleriaModule,
    DocumentsModule,
    CarrerasModule,
    AutoridadesModule,
    MensajesModule,
  ],
})
export class AppModule {}
