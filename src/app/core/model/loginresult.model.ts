import { Gender } from './gender.model';
import { User } from './user.model';

export class LoginResult extends User {
  accessToken: any;
  refreshToken: any;
  totalUnreadNotif: number;
  isVerified: boolean;
}
