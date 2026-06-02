export type Mood = "great" | "good" | "okay" | "low" | "crisis";

export interface MissionEntity {
  id: string;
  label: string;
  done: boolean;
  xp: number;
}

export interface HabitDayEntity {
  date: string;
  done: boolean;
}

export interface HabitEntity {
  label: string;
  color: string;
  days: HabitDayEntity[];
}

export interface MoodLogEntity {
  mood: Mood;
  loggedAt: Date;
}

export interface UserProgressEntity {
  id?: string;
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  totalSessionsDone: number;
  missions: MissionEntity[];
  habits: HabitEntity[];
  moodLogs: MoodLogEntity[];
  lastActivityDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
