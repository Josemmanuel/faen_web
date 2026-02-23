import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { multerConfig } from '../utils/paths';

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const news = this.newsService.findOne(id);
    if (!news) throw new BadRequestException('Noticia no encontrada');
    return news;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', multerConfig)) // <-- Verifica que el frontend use 'image'
  async create(@Body() dto: CreateNewsDto, @UploadedFile() file: any) {
    console.log('--- Nueva Noticia ---');
    console.log('Datos:', dto);
    console.log('Archivo recibido:', file ? file.filename : 'Ninguno');

    const imagePath = file ? `uploads/${file.filename}` : null;
    return this.newsService.create({ ...dto, image: imagePath });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto, @UploadedFile() file: any) {
    const imagePath = file ? `uploads/${file.filename}` : undefined;
    
    // Si no hay archivo nuevo, mantenemos el anterior o enviamos undefined para que el service no lo toque
    const data = imagePath !== undefined ? { ...dto, image: imagePath } : dto;
    
    const updated = this.newsService.update(id, data as any);
    if (!updated) throw new BadRequestException('No se pudo actualizar la noticia');
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.newsService.remove(id);
    return { success: ok };
  }
}