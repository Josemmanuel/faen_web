import { Module, RequestMethod } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Importamos la raíz del proyecto desde nuestra utilidad centralizada
import { PROJECT_ROOT } from './utils/paths';

// Importación de módulos
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
    // 1. Servir la carpeta UPLOADS (donde se guardan las fotos)
    ServeStaticModule.forRoot({
      rootPath: join(PROJECT_ROOT, 'uploads'),
      serveRoot: '/uploads', // Las fotos serán accesibles en http://localhost:3000/uploads/...
    }),

    // 2. Servir la carpeta PUBLIC (donde está tu admin.html, index.html, etc.)
    ServeStaticModule.forRoot({
      rootPath: join(PROJECT_ROOT, 'public'),
      serveRoot: '/', // El frontend se sirve en la raíz
      exclude: ['/api*'], // Excluir rutas de API para no entrar en conflicto
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
export class AppModule { }