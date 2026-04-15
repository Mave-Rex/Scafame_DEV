import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationType {
  OUTCOME_PENDING_ADMIN = 'outcome_pending_admin',
  OUTCOME_APPROVED = 'outcome_approved',
  OUTCOME_REJECTED = 'outcome_rejected',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity()
@Index('idx_notification_log_created_at', ['createdAt'])
@Index('idx_notification_log_status', ['status'])
@Index('idx_notification_log_type', ['type'])
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  recipientEmail: string;

  @Column({ nullable: true })
  recipientUserId: number | null;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ nullable: true })
  errorMessage: string | null;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
