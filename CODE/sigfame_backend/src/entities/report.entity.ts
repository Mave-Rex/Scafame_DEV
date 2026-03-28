import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn, OneToMany } from 'typeorm';
import { ProductReport } from '../entities/productReport.entity';

export enum ReportType {
  INCOME = 'income',
  OUTCOME = 'outcome',
}

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum',  enum: ReportType})
  type: ReportType;

  @Column('int')
  quantity: number;

  @CreateDateColumn()
  createdAt: Date; 

  @OneToMany(() => ProductReport, (ProductReport) => ProductReport.report, {
    cascade: true,
  })
  ProductReports: ProductReport[];
}
