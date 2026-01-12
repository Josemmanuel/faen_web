import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMensajeDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  telefono?: string;

  @IsNotEmpty({ message: 'El asunto es requerido' })
  @IsString({ message: 'El asunto debe ser texto' })
  asunto: string;

  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @IsString({ message: 'El mensaje debe ser texto' })
  mensaje: string;
}
