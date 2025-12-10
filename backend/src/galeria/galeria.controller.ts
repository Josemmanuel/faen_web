import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import * as path from 'path';
import { GaleriaService, Foto } from './galeria.service';
import { BasicAuthGuard } from '../auth/basic-auth.guard';

@Controller('api/galeria')
export class GaleriaController {
  constructor(private galeriaService: GaleriaService) {}

  @Get()
  async getAllFotos(): Promise<Foto[]> {
    return this.galeriaService.getAllFotos();
  }

  @Post('subir')
  @UseGuards(BasicAuthGuard)
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(
            null,
            '/home/josemanuel/Documentos/faen_web/public/uploads'
          );
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const ext = path.extname(file.originalname);
          const name = path.basename(file.originalname, ext);
          cb(null, `${timestamp}-${name}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'),
            false
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    })
  )
  async uploadFoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('titulo') titulo?: string,
  ): Promise<Foto> {
    if (!file) {
      throw new BadRequestException('No se subió ninguna imagen');
    }

    const foto: Foto = {
      id: Date.now().toString(),
      titulo: titulo && titulo.trim() ? titulo.trim() : 'Sin título',
      ruta: `uploads/${file.filename}`,
      fecha: new Date().toLocaleString('es-ES'),
    };

    return this.galeriaService.addFoto(foto);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  async deleteFoto(@Param('id') id: string): Promise<{ message: string }> {
    await this.galeriaService.deleteFoto(id);
    return { message: 'Foto eliminada correctamente' };
  }
}
