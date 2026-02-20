import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  default_permissions?: {
    [module: string]: 'create' | 'read' | 'update' | 'delete' | 'none';
  };
}
