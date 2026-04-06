import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Report } from '../entities/report.entity';
import { Product } from '../entities/product.entity';

@Entity()
export class ProductReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Index('idx_product_report_report_fk')
  @ManyToOne(() => Report, (report) => report.ProductReports, { onDelete: 'CASCADE' })
  report: Report;

  @Index('idx_product_report_product_fk')
  @ManyToOne(() => Product, { eager: true })
  product: Product;
}
