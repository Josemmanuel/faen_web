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
  @Transform(({ value }) => value ? parseInt(value, 10) : 1)
  @Min(1, { message: 'La duración debe ser al menos 1' })
  duration?: number;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser texto' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  category?: string;

  @IsOptional()
  @IsString({ message: 'La foto debe ser una cadena base64' })
  foto?: string;

  @IsOptional()
  @IsString({ message: 'El documento debe ser una cadena base64' })
  documento?: string;
}
