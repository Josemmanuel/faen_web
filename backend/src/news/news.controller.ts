import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { BasicAuthGuard } from '../auth/basic-auth.guard';

function getUploadsDir() {
  // Use the global projectRoot that was set in main.ts
  const projectRoot = (globalThis as any)['projectRoot'] || resolve(__dirname, '../../..');
  const uploadsPath = resolve(projectRoot, 'public', 'uploads');
  console.log('📁 getUploadsDir() resolved to:', uploadsPath);
  console.log('📁 projectRoot is:', projectRoot);
  if (!existsSync(uploadsPath)) {
    console.log('📁 Creating uploads directory:', uploadsPath);
    mkdirSync(uploadsPath, { recursive: true });
  }
  return uploadsPath;
}

const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, getUploadsDir());
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname;
      console.log('Multer saving file as:', uniqueName);
      cb(null, uniqueName);
    },
  }),
};

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  create(@Body() dto: CreateNewsDto, @UploadedFile() file: Express.Multer.File) {
    console.log('File received:', file);
    const imagePath = file ? '/uploads/' + file.filename : null;
    console.log('Image path:', imagePath);
    return this.newsService.create({ ...dto, image: imagePath });
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto, @UploadedFile() file: Express.Multer.File) {
    const imagePath = file ? '/uploads/' + file.filename : undefined;
    const data = imagePath !== undefined ? { ...dto, image: imagePath } : dto;
    const updated = this.newsService.update(id, data as any);
    if (!updated) return { error: 'Not found' };
    return updated;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.newsService.remove(id);
    return { success: ok };
  }
}
