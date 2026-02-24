import { Body, Controller, Post, UseGuards, Get, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);

    // Setear cookie httpOnly además de devolver el token en el body
    res.cookie('jwt', result.access_token, {
      httpOnly: true,
      secure: false,       // cambiar a true en producción con HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8,  // 8 horas
    });

    return result;
  }

  // ⚠️  Sin @UseGuards — el logout debe funcionar aunque el token ya haya expirado
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'lax', secure: false });
    return { message: 'Sesión cerrada correctamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    const { password_hash, ...user } = req.user;
    return user;
  }
}