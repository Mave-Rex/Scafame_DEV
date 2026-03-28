import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Report } from '../entities/report.entity';
import { Product } from '../entities/product.entity';

@Entity()
export class ProductReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Report, (report) => report.ProductReports, { onDelete: 'CASCADE' })
  report: Report;

  @ManyToOne(() => Product, { eager: true })
  product: Product;
}
