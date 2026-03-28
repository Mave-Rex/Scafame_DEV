import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Area } from '../entities/area.entity';
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

  @ManyToOne(() => Area, (area) => area.productCategories, { nullable: false, eager: true })
  area: Area;

  @OneToMany(() => Product, (product) => product.productCategory)
  products: Product[];
}
