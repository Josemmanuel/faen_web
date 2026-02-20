import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (module: string, level: 'create' | 'read' | 'update' | 'delete') => {
  return SetMetadata('permission', { module, level });
};
