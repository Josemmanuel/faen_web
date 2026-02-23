import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCarreraDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  title?: string;

  @IsOptional()
  @IsString({ message: 'El código debe ser texto' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  code?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string;

  @IsOptional()
  @IsString({ message: 'La descripción completa debe ser texto' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  fullDescription?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La duración debe ser un número' })
  // El FormData envía todo como string, esto asegura la conversión a número
  @Transform(({ value }) => value ? parseInt(value, 10) : 1)
  @Min(1, { message: 'La duración debe ser al menos 1' })
  duration?: number;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser texto' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  category?: string;

  /**
   * IMPORTANTE:
   * Cambiamos el mensaje de validación. 
   * Ya no recibimos Base64, sino que el controlador asignará 
   * la ruta del archivo (string) después de que Multer lo procese.
   */
  @IsOptional()
  @IsString({ message: 'La ruta de la foto debe ser un texto' })
  foto?: string;

  @IsOptional()
  @IsString({ message: 'La ruta del documento debe ser un texto' })
  documento?: string;
}
