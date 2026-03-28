import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { ChangePasswordDto } from '../../dtos/change-password.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Obtener todos los usuarios
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Obtener un usuario por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // Crear un nuevo usuario
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Actualizar un usuario por ID
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // Eliminar un usuario por ID
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // Cambiar contraseña (usuario dueño o admin)
  @Patch(':id/password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangePasswordDto,
    @Request() req: any,
  ) {
    
    const requesterRole = req.user?.role;
    const requesterId = Number(req.user?.userId);
    if (requesterId !== id && requesterRole !== 'admin') {
      throw new ForbiddenException('No autorizado');
    }


    return this.usersService.changePassword(id, dto.currentPassword, dto.newPassword);
  }
}
