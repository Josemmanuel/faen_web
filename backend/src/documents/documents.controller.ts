import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { BasicAuthGuard } from '../auth/basic-auth.guard';

function getUploadsDir() {
  // Use resolve to properly navigate from __dirname to the project root
  // __dirname is /backend/src/documents when running with ts-node-dev
  // Going up 3 levels: src/documents -> src -> backend -> /home/josemanuel/Documentos/faen_web
  const uploadsPath = resolve(__dirname, '../../../..', 'public', 'uploads');
  console.log('📁 getUploadsDir() resolved to:', uploadsPath);
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
  fileFilter: (req, file, cb) => {
    // Solo aceptar PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  },
};

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.documentsService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  create(@Body() dto: CreateDocumentDto, @UploadedFile() file: Express.Multer.File) {
    console.log('File received:', file);
    const filePath = file ? '/uploads/' + file.filename : null;
    console.log('File path:', filePath);
    if (!filePath) {
      return { error: 'No file provided' };
    }
    return this.documentsService.create({
      ...dto,
      fileName: file.originalname,
      filePath,
    });
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @UploadedFile() file: Express.Multer.File) {
    const filePath = file ? '/uploads/' + file.filename : undefined;
    const data = filePath !== undefined ? { ...dto, fileName: file.originalname, filePath } : dto;
    const updated = this.documentsService.update(id, data as any);
    if (!updated) return { error: 'Not found' };
    return updated;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.documentsService.remove(id);
    return { success: ok };
  }
}
