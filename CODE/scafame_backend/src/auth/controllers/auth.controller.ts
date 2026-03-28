import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Endpoint para iniciar sesión
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user; // Retorna la información del usuario autenticado
  }
}
