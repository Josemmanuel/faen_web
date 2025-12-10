import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { comparePassword } from './password.util';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    
    const b = Buffer.from(auth.split(' ')[1], 'base64').toString('utf8');
    const [user, pass] = b.split(':');
    
    const expectedUser = process.env.ADMIN_USER || 'admin';
    // Hash pre-generado de '1234'
    const expectedPassHash = process.env.ADMIN_PASS_HASH || '$2b$10$9r38a9aNgRnQnMpmcTngge6T1KGfrKSix0anfZAp11MPZ5/4DEiE.';
    
    if (user !== expectedUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isValid = await comparePassword(pass, expectedPassHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return true;
  }
}
