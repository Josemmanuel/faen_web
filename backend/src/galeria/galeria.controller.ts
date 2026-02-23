import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards, 
  Body, // 👈 AGREGA ESTO AQUÍ
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GaleriaService } from './galeria.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { multerConfig } from '../utils/paths'; // Usamos la configuración centralizada

@Controller('api/galeria')
export class GaleriaController {
  constructor(private readonly galeriaService: GaleriaService) {}

  @Get()
  findAll() {
    return this.galeriaService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image', multerConfig)) 
  async upload(@UploadedFile() file: any, @Body() body: any) { // 👈 Agregamos @Body() body
    if (!file) {
      throw new BadRequestException('No se ha subido ninguna imagen');
    }

    // 1. Capturamos el título del body que envía el FormData
    const titulo = body.titulo || 'Sin título'; 

    // 2. Agregamos la barra '/' inicial para que el navegador la encuentre desde cualquier URL
    const imagePath = `/uploads/${file.filename}`; 

    // 3. Pasamos ambos datos al servicio
    return this.galeriaService.create(imagePath, titulo);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galeriaService.remove(id);
  }
}