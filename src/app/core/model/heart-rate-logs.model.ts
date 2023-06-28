import { User } from "./user.model";

export class HeartRateLog {
  heartRateLogId: string;
  timestamp: Date;
  value: string;
  user: User;
}
