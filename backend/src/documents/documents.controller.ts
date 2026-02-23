import { Controller, Get, Post, Put, Delete, Body, Param, UploadedFile, UseInterceptors, UseGuards, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { multerConfig } from '../utils/paths';

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.documentsService.findOne(id);
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  create(@Body() dto: any, @UploadedFile() file: any) {
    const filePath = file ? `uploads/${file.filename}` : '';
    const fileName = file ? file.originalname : '';
    return this.documentsService.create({ ...dto, filePath, fileName });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  update(@Param('id') id: string, @Body() dto: any, @UploadedFile() file: any) {
    const updateData = { ...dto };
    if (file) {
      updateData.filePath = `uploads/${file.filename}`;
      updateData.fileName = file.originalname;
    }
    const updated = this.documentsService.update(id, updateData);
    if (!updated) throw new NotFoundException('No se pudo actualizar el documento');
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const success = this.documentsService.remove(id);
    if (!success) throw new NotFoundException('No se pudo eliminar el documento');
    return { success: true };
  }
}