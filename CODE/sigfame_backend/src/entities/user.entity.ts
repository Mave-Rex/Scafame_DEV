import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

export enum AccessLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })// Asegura que no se repita el username
  username: string;

  @Column({ unique: true }) // Asegura que no se repita el email
  email: string;

  @Column()
  password: string;

  @Column()
  area: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: AccessLevel, default: AccessLevel.LOW })
  accessLevel: AccessLevel;

  @CreateDateColumn()
  createdAt: Date;

}
