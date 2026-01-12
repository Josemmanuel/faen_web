import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { BasicAuthGuard } from '../auth/basic-auth.guard';

@Controller('api/mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Post()
  create(@Body() dto: CreateMensajeDto) {
    console.log('Controller recibió DTO:', dto);
    return this.mensajesService.create(dto);
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  findAll() {
    return this.mensajesService.findAll();
  }

  @UseGuards(BasicAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mensajesService.findOne(id);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/leido')
  markAsRead(@Param('id') id: string) {
    const updated = this.mensajesService.markAsRead(id);
    if (!updated) return { error: 'Not found' };
    return updated;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.mensajesService.remove(id);
    return { success: ok };
  }
}
