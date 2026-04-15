import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from '../../entities/notificationLog.entity';
import { User, UserRole } from '../../entities/user.entity';
import { EmailProviderService } from './email-provider.service';
import { NotificationLogService } from './notification-log.service';
import { TemplateService } from './template.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailProviderService: EmailProviderService,
    private readonly notificationLogService: NotificationLogService,
    private readonly templateService: TemplateService,
  ) {}

  async sendOutcomePendingToAdministrators(input: {
    requesterName: string;
    requesterEmail: string;
    reportId: number;
    createdAt: Date;
  }): Promise<void> {
    const admins = await this.userRepository.find({
      where: {
        role: UserRole.ADMIN,
      },
      select: ['id', 'email'],
    });

    const recipients = admins
      .filter((u) => !!u.email)
      .map((u) => ({ id: u.id, email: u.email.trim().toLowerCase() }))
      .filter((u) => u.email.length > 0);

    if (recipients.length === 0) {
      this.logger.warn('No hay usuarios ADMIN con correo para notificar.');
      return;
    }

    const uniqueRecipients = Array.from(
      new Map(recipients.map((r) => [r.email, r])).values(),
    );

    const template = this.templateService.buildOutcomePendingForAdmin({
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
      reportId: input.reportId,
      createdAt: input.createdAt,
    });

    await Promise.all(
      uniqueRecipients.map((recipient) =>
        this.sendWithLog({
          type: NotificationType.OUTCOME_PENDING_ADMIN,
          recipientEmail: recipient.email,
          recipientUserId: recipient.id ?? null,
          subject: template.subject,
          body: template.body,
        }),
      ),
    );
  }

  async sendOutcomeApproved(input: {
    recipientEmail: string;
    recipientUserId: number | null;
    requesterName: string;
    reportId: number;
    approvedByName: string;
    createdAt: Date;
  }): Promise<void> {
    const template = this.templateService.buildOutcomeApproved({
      requesterName: input.requesterName,
      reportId: input.reportId,
      approvedByName: input.approvedByName,
      createdAt: input.createdAt,
    });

    await this.sendWithLog({
      type: NotificationType.OUTCOME_APPROVED,
      recipientEmail: input.recipientEmail,
      recipientUserId: input.recipientUserId,
      subject: template.subject,
      body: template.body,
    });
  }

  async sendOutcomeRejected(input: {
    recipientEmail: string;
    recipientUserId: number | null;
    requesterName: string;
    reportId: number;
    createdAt: Date;
  }): Promise<void> {
    const template = this.templateService.buildOutcomeRejected({
      requesterName: input.requesterName,
      reportId: input.reportId,
      createdAt: input.createdAt,
    });

    await this.sendWithLog({
      type: NotificationType.OUTCOME_REJECTED,
      recipientEmail: input.recipientEmail,
      recipientUserId: input.recipientUserId,
      subject: template.subject,
      body: template.body,
    });
  }

  private async sendWithLog(input: {
    type: NotificationType;
    recipientEmail: string;
    recipientUserId: number | null;
    subject: string;
    body: string;
  }): Promise<void> {
    const log = await this.notificationLogService.createPending(input);

    try {
      await this.emailProviderService.sendMail({
        to: input.recipientEmail,
        subject: input.subject,
        text: input.body,
      });

      await this.notificationLogService.markSent(log.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Fallo desconocido al enviar correo';

      await this.notificationLogService.markFailed(log.id, message);
      this.logger.error(`No se pudo enviar correo a ${input.recipientEmail}: ${message}`);
    }
  }
}
