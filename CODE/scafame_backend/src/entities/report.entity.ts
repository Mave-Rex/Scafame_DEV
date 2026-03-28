import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductReport } from '../entities/productReport.entity';
import { User } from './user.entity';

export enum ReportType {
  INCOME = 'income',
  OUTCOME = 'outcome',
}

export enum ReportStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  // (YA EXISTENTE) Usuario que realiza la entrega
  @ManyToOne(() => User, { eager: true, nullable: true })
  user: User;

  // (NUEVO) Usuario que solicita el pedido
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'requested_by_id' })   
  requestedBy: User;

  @Column({ type: 'enum',  enum: ReportType})
  type: ReportType;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date; 

  @OneToMany(() => ProductReport, (ProductReport) => ProductReport.report, {
    cascade: true,
  })
  ProductReports: ProductReport[];
}
