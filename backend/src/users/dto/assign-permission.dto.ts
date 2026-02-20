import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { PermissionLevel } from '../interfaces';

export class AssignPermissionDto {
  @IsNotEmpty()
  @IsString()
  module: string;

  @IsNotEmpty()
  @IsIn(['create', 'read', 'update', 'delete', 'none'])
  permission: PermissionLevel;
}
