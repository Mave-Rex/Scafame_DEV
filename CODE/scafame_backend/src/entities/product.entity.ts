import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, Check
} from 'typeorm';
import { ProductCategory } from './productCategory.entity';
import { ProductReport } from './productReport.entity';
import { Unit } from './unit.entity';

@Entity()
@Check('"stock" >= 0')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  stock: number;

  @Column()
  minimumStock: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  creationDate: Date;

  @ManyToOne(() => ProductCategory, (category) => category.products, { eager: true, nullable: false })
  productCategory: ProductCategory;

  @ManyToOne(() => Unit, { eager: true, nullable: true })
  unit?: Unit | null;

  @OneToMany(() => ProductReport, (rp) => rp.product)
  reportProducts: ProductReport[];
}
