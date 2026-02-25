import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (err || !user) {
      if (request.url.startsWith('/api/')) {
        // Devolver 401 correctamente para que el frontend lo maneje
        throw new UnauthorizedException('Token inválido o expirado');
      }
      return response.redirect('/login.html');
    }

    return user;
  }
}
