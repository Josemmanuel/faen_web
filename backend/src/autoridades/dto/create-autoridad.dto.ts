import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateAutoridadDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  cargo: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  foto?: string;
}
