import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateAutoridadDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  cargo: string;

  @IsOptional()
  // Si el email llega vacío desde el form, esto evita que IsEmail falle
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  // Permitimos que sea opcional para que no rebote si la imagen no se sube
  foto?: string;
}