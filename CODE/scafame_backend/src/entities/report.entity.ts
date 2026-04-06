import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
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
@Index('idx_report_type_status_created_at', ['type', 'status', 'createdAt'])
@Index('idx_report_created_at', ['createdAt'])
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  // (YA EXISTENTE) Usuario que realiza la entrega
  @Index('idx_report_user_fk')
  @ManyToOne(() => User, { eager: true, nullable: true })
  user: User;

  // (NUEVO) Usuario que solicita el pedido
  @Index('idx_report_requested_by_fk')
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
