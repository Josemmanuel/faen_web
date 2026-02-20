import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<{ module: string; level: string }>('permission', context.getHandler());

    // Si no hay decorador de permiso, permitir acceso
    if (!permission) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('No autorizado');
    }

    const userPermissionLevel = user.permissions[permission.module];

    // Mapear niveles de permiso a valores numéricos para comparación
    const permissionHierarchy = {
      'none': 0,
      'read': 1,
      'update': 2,
      'create': 3,
      'delete': 3,
    };

    const requiredLevel = permissionHierarchy[permission.level] || 0;
    const userLevel = permissionHierarchy[userPermissionLevel] || 0;

    if (userLevel < requiredLevel) {
      throw new ForbiddenException(`No tienes permiso para ${permission.level} en ${permission.module}`);
    }

    return true;
  }
}
