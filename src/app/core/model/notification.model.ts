import { Gender } from './gender.model';
import { User } from './user.model';

export class Notifications {
  notificationId: string;
  date: Date;
  title: string;
  description: any;
  isReminder: boolean;
  isRead: boolean;
  user: User;
  notificationType: NotificationType;
}

export class NotificationType {
  notificationTypeId: string;
  name: string;
}

