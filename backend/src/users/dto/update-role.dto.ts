import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  default_permissions?: {
    [module: string]: 'create' | 'read' | 'update' | 'delete' | 'none';
  };
}
