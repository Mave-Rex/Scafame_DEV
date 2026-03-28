import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ProductCategory } from '../entities/productCategory.entity';

@Entity()
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  creationDate: Date;

  @OneToMany(() => ProductCategory, (productCategory) => productCategory.area)
  productCategories: ProductCategory[];
}
