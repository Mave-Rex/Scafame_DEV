import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../entities/product.entity';

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  creationDate: Date;

  @OneToMany(() => Product, (product) => product.productCategory)
  products: Product[];
}
