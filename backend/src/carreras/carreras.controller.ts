import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CarrerasService } from './carreras.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

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

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCarreraDto) {
    console.log('=== POST /api/carreras ===');
    console.log('DTO recibido:', dto);
    console.log('DTO.title:', dto.title, 'tipo:', typeof dto.title);
    console.log('DTO.code:', dto.code, 'tipo:', typeof dto.code);
    console.log('DTO.description:', dto.description, 'tipo:', typeof dto.description);
    console.log('DTO.duration:', dto.duration, 'tipo:', typeof dto.duration);
    return this.carrerasService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCarreraDto) {
    const updated = this.carrerasService.update(id, dto);
    if (!updated) return { error: 'Not found' };
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.carrerasService.remove(id);
    return { success: ok };
  }
}
