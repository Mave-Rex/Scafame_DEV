import {
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UserRole, AccessLevel } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  firstname?: string;

  @IsOptional()
  lastname?: string;

  @IsOptional()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  area?: string;

  @IsOptional()
  jobTitle?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;
}