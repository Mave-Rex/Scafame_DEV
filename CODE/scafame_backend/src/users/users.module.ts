import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '../users/controllers/users.controller';
import { UsersService } from '../users/services/users.service';
import { User } from '../entities/user.entity'; // Ajusta la ruta según tu estructura

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule], // <-- útil si otros módulos necesitan acceder
})
export class UsersModule {}