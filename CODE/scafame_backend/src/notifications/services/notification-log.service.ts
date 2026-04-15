import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationLog,
  NotificationStatus,
  NotificationType,
} from '../../entities/notificationLog.entity';

@Injectable()
export class NotificationLogService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
  ) {}

  async createPending(input: {
    type: NotificationType;
    recipientEmail: string;
    recipientUserId: number | null;
    subject: string;
    body: string;
  }): Promise<NotificationLog> {
    const log = this.notificationLogRepository.create({
      ...input,
      status: NotificationStatus.PENDING,
      attempts: 1,
      errorMessage: null,
      sentAt: null,
    });

    return this.notificationLogRepository.save(log);
  }

  async markSent(id: number): Promise<void> {
    await this.notificationLogRepository.update(id, {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      errorMessage: null,
    });
  }

  async markFailed(id: number, errorMessage: string): Promise<void> {
    await this.notificationLogRepository.update(id, {
      status: NotificationStatus.FAILED,
      errorMessage,
    });
  }
}
