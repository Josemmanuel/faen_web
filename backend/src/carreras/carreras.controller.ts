import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CarrerasService } from './carreras.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { BasicAuthGuard } from '../auth/basic-auth.guard';

@Controller('api/carreras')
export class CarrerasController {
  constructor(private readonly carrerasService: CarrerasService) {}

  @Get()
  findAll() {
    return this.carrerasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carrerasService.findOne(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  create(@Body() dto: CreateCarreraDto) {
    return this.carrerasService.create(dto);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCarreraDto) {
    const updated = this.carrerasService.update(id, dto);
    if (!updated) return { error: 'Not found' };
    return updated;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.carrerasService.remove(id);
    return { success: ok };
  }
}
