import { Module } from '@nestjs/common';
import { AutoridadesController } from './autoridades.controller';
import { AutoridadesService } from './autoridades.service';

@Module({
  controllers: [AutoridadesController],
  providers: [AutoridadesService],
})
export class AutoridadesModule {}
