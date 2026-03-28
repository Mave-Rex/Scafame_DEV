import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany,Check } from 'typeorm';
import { ProductCategory } from '../entities/productCategory.entity';
import { ProductReport } from '../entities/productReport.entity';

@Entity()
@Check('"stock" >= 0')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  stock: number;

  @Column()
  minimumStock: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  creationDate: Date;

  @ManyToOne(() => ProductCategory, (productCategory) => productCategory.products, { nullable: false, eager: true })
  productCategory: ProductCategory;

  @OneToMany(() => ProductReport, (ProductReport) => ProductReport.product)
  ProductReports: ProductReport[];

}
