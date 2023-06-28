import { HeartRateLog } from "./heart-rate-logs.model";
import { User } from "./user.model";

export class JournalEntry {
  journalEntryId: string;
  notes: string;
  timestamp: string;
  moodEntity: MoodEntity;
  user: User;
  heartRateLog: HeartRateLog;
  journalEntryActivities: JournalEntryActivity[] = [];
}

export class JournalEntrySummary {
  moodEntityId: string;
  name: string;
  moodPercent: number;
  timestamp: Date;
  heartRate: number;
  heartRateScore: number;
  heartRatePercentTarget: number;
  heartRateStatus: string;
  lastHeartRateLogId: number;
}

export class JournalEntryWeeklySummary extends JournalEntrySummary {
  result: { moodEntityId: string; count: number; name: string; moodPercent: number }[] = [];
}

export class MoodEntity {
  moodEntityId: string;
  name: string;
}

export class JournalEntryActivity {
  journalEntryActivityId: string;
  activityType: ActivityType;
}

export class ActivityType {
  activityTypeId: string;
  name: string;
}
