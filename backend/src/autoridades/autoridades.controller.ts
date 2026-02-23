import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutoridadesService } from './autoridades.service';
import { CreateAutoridadDto } from './dto/create-autoridad.dto';
import { UpdateAutoridadDto } from './dto/update-autoridad.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { multerConfig } from '../utils/paths';

@Controller('api/autoridades')
export class AutoridadesController {
  constructor(private readonly autoridadesService: AutoridadesService) {}

  @Get()
  findAll() {
    return this.autoridadesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const autoridad = await this.autoridadesService.findOne(id);
    if (!autoridad) throw new NotFoundException('Autoridad no encontrada');
    return autoridad;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('foto', multerConfig))
  async create(
    @UploadedFile() file: any, 
    @Body() dto: CreateAutoridadDto
  ) {
    if (!dto.nombre || !dto.cargo) {
        throw new BadRequestException('Nombre y Cargo son obligatorios');
    }

    // NORMALIZACIÓN: Si hay archivo, guardamos la ruta. Si no, NULL.
    // No uses 'default-avatar.png' si el archivo no existe físicamente.
    const data = {
      ...dto,
      foto: file ? `/uploads/${file.filename}` : null
    };
    
    return this.autoridadesService.create(data);
  }

  @UseGuards(JwtAuthGuard)
@Put(':id')
// Quitamos el Interceptor de Multer
async update(
  @Param('id') id: string, 
  @Body() dto: UpdateAutoridadDto 
) {
  // dto.foto ya trae el string "data:image/jpeg;base64,..."
  return this.autoridadesService.update(id, dto);
}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.autoridadesService.remove(id);
    if (!deleted) throw new NotFoundException('Autoridad no encontrada');
    return { success: true, message: 'Autoridad eliminada correctamente' };
  }
}