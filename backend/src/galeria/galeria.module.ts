import { Module } from '@nestjs/common';
import { GaleriaController } from './galeria.controller';
import { GaleriaService } from './galeria.service';

@Module({
  controllers: [GaleriaController],
  providers: [GaleriaService],
})
export class GaleriaModule {}
