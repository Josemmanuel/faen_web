import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { NewsModule } from './news/news.module';
import { GaleriaModule } from './galeria/galeria.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    // Servir los archivos estáticos (tu carpeta `public` un nivel arriba de `backend/`)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      exclude: ['/api*'],
      serveRoot: '/',
    }),
    NewsModule,
    GaleriaModule,
    DocumentsModule,
  ],
})
export class AppModule {}
