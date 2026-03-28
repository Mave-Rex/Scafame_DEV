import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    user.password = await bcrypt.hash(dto.password, 10);
    return this.userRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    await this.userRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

    async changePassword(id: number, currentPassword: string, newPassword: string) {
    const user = await this.findOne(id); // lanza NotFound si no existe

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { message: 'Contraseña actualizada' };
  }
}
