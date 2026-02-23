import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Query, Res } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Controller('api/mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Post()
  create(@Body() dto: CreateMensajeDto) {
    return this.mensajesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.mensajesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportAll(
    @Res() res: Response,
    @Query('format') format: string = 'csv',
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('estado') estado: string = 'all',
  ) {
    let mensajes = this.mensajesService.findAll();

    // Lógica de filtrado
    const parseMensajeTs = (m: any) => {
      if (m.fechaISO && typeof m.fechaISO === 'number') return m.fechaISO;
      const parsed = Date.parse(m.fecha);
      return isNaN(parsed) ? null : parsed;
    };

    if (desde) {
      const desdeTs = Date.parse(desde + 'T00:00:00');
      if (!isNaN(desdeTs)) {
        mensajes = mensajes.filter(m => {
          const ts = parseMensajeTs(m);
          return ts === null ? false : ts >= desdeTs;
        });
      }
    }

    if (hasta) {
      const hastaTs = Date.parse(hasta + 'T23:59:59.999');
      if (!isNaN(hastaTs)) {
        mensajes = mensajes.filter(m => {
          const ts = parseMensajeTs(m);
          return ts === null ? false : ts <= hastaTs;
        });
      }
    }

    if (estado && estado !== 'all') {
      if (estado === 'leido') mensajes = mensajes.filter(m => !!m.leido);
      else if (estado === 'no-leido') mensajes = mensajes.filter(m => !m.leido);
    }

    const headers = ['id', 'nombre', 'email', 'telefono', 'asunto', 'mensaje', 'fecha', 'leido'];

    // Exportación XLSX
    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Mensajes');

      sheet.addRow(headers);
      mensajes.forEach((m) => {
        sheet.addRow(headers.map(h => m[h] ?? ''));
      });

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="mensajes.xlsx"');
      return res.send(Buffer.from(buffer as any));
    }

    // Exportación CSV (Default)
    const escapeCsv = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvLines = [headers.join(',')];
    mensajes.forEach(m => {
      const row = headers.map(h => escapeCsv(m[h]));
      csvLines.push(row.join(','));
    });

    const csv = csvLines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mensajes.csv"');
    return res.send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mensajesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/leido')
  markAsRead(@Param('id') id: string) {
    return this.mensajesService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return { success: this.mensajesService.remove(id) };
  }
}