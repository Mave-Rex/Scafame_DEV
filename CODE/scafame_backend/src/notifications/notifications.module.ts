import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from '../entities/notificationLog.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from './services/notifications.service';
import { NotificationLogService } from './services/notification-log.service';
import { EmailProviderService } from './services/email-provider.service';
import { TemplateService } from './services/template.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLog, User])],
  providers: [
    NotificationsService,
    NotificationLogService,
    EmailProviderService,
    TemplateService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
