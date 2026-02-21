import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Si el usuario no está autenticado o hay un error
    if (err || !user) {
      // Si la URL es de la API, devolvemos 401 normal
      if (request.url.startsWith('/api/')) {
        throw err || new Error('Unauthorized');
      }
      // Si es una ruta de página (como /admin), redireccionamos al login
      return response.redirect('/login'); 
    }
    
    return user;
  }
}
