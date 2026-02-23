import { 
  Body, Controller, Delete, Get, Param, Post, Put, 
  UseGuards, UseInterceptors, UploadedFiles, NotFoundException 
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CarrerasService } from './carreras.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto'; // Asegúrate de que este archivo exista
import { JwtAuthGuard } from '../auth/jwt.guard';
import { multerConfig } from '../utils/paths';

@Controller('api/carreras')
export class CarrerasController {
  constructor(private readonly carrerasService: CarrerasService) {}

  @Get()
  findAll() {
    return this.carrerasService.findAll();
  }

  @Get(':id')
  // Eliminamos el 'async' si tu service no es una Promesa, 
  // o lo dejamos si lo es. Aquí lo ajustamos al Service que pasaste:
  findOne(@Param('id') id: string) {
    const carrera = this.carrerasService.findOne(id);
    if (!carrera) throw new NotFoundException('Carrera no encontrada');
    return carrera;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto', maxCount: 1 },
    { name: 'documento', maxCount: 1 }
  ], multerConfig))
  create(
    @Body() dto: CreateCarreraDto, 
    @UploadedFiles() files: { foto?: Express.Multer.File[], documento?: Express.Multer.File[] }
  ) {
    const data = {
      ...dto,
      foto: files?.foto?.[0] ? `uploads/${files.foto[0].filename}` : 'uploads/default-carrera.png',
      documento: files?.documento?.[0] ? `uploads/${files.documento[0].filename}` : null
    };
    return this.carrerasService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto', maxCount: 1 },
    { name: 'documento', maxCount: 1 }
  ], multerConfig))
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateCarreraDto, 
    @UploadedFiles() files: { foto?: Express.Multer.File[], documento?: Express.Multer.File[] }
  ) {
    // Creamos un objeto con los datos que vienen del Body
    const updateData: any = { ...dto };
    
    // Si hay archivos nuevos, añadimos la ruta al objeto de actualización
    if (files?.foto?.[0]) {
      updateData.foto = `uploads/${files.foto[0].filename}`;
    }

    if (files?.documento?.[0]) {
      updateData.documento = `uploads/${files.documento[0].filename}`;
    }

    const updated = this.carrerasService.update(id, updateData);
    if (!updated) throw new NotFoundException('Carrera no encontrada');
    
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    const deleted = this.carrerasService.remove(id);
    if (!deleted) throw new NotFoundException('No se pudo eliminar la carrera');
    return { success: true };
  }
}