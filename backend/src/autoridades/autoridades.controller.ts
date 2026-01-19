import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AutoridadesService } from './autoridades.service';
import { CreateAutoridadDto } from './dto/create-autoridad.dto';
import { UpdateAutoridadDto } from './dto/update-autoridad.dto';
import { BasicAuthGuard } from '../auth/basic-auth.guard';

@Controller('api/autoridades')
export class AutoridadesController {
  constructor(private readonly autoridadesService: AutoridadesService) {}

  @Get()
  findAll() {
    return this.autoridadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autoridadesService.findOne(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  create(@Body() dto: CreateAutoridadDto) {
    console.log('Recibiendo POST /api/autoridades con datos:', dto);
    try {
      const result = this.autoridadesService.create(dto);
      console.log('Resultado del create:', result);
      return result;
    } catch (err) {
      console.error('Error en controller create:', err);
      throw err;
    }
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAutoridadDto) {
    const updated = this.autoridadesService.update(id, dto);
    if (!updated) return { error: 'Not found' };
    return updated;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.autoridadesService.remove(id);
    return { success: ok };
  }
}
