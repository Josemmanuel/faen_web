import { Body, Controller, Post, UseGuards, Get, Request, Res } from '@nestjs/common';
import { Response } from 'express'; // <--- Importar de express
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    
    // Guardamos el token en una cookie para el navegador
    res.cookie('jwt', result.access_token, {
      httpOnly: true,
      secure: false, // Cambiar a true si usas HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8, // 8 horas
    });

    return result; 
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt'); // <--- Borramos la cookie
    return { message: 'Sesión cerrada correctamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    const { password_hash, ...user } = req.user;
    return user;
  }
}