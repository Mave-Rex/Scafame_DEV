import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { UserRole, AccessLevel } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  firstname: string;

  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  area: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(AccessLevel)
  accessLevel: AccessLevel;
}
