import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, length: 16 })
  abbreviation?: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  creationDate: Date;
}
