import type { IUserProgressDocument, IMission } from "../databases/schema/user-progress.schema";
import type { UserProgressEntity, MissionEntity } from "../../domain/entities/UserProgress.entity";

export class UserProgressDbMapper {
  static toEntity(doc: IUserProgressDocument): UserProgressEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      xp: doc.xp,
      level: doc.level,
      streakDays: doc.streakDays,
      totalSessionsDone: doc.totalSessionsDone,
      missions: doc.missions.map((mission) => ({
        id: mission.id,
        label: mission.label,
        done: mission.done,
        xp: mission.xp,
      })),
      habits: doc.habits.map((habit) => ({
        label: habit.label,
        color: habit.color,
        days: habit.days.map((day) => ({
          date: day.date,
          done: day.done,
        })),
      })),
      moodLogs: doc.moodLogs.map((log) => ({
        mood: log.mood,
        loggedAt: log.loggedAt,
      })),
      lastActivityDate: doc.lastActivityDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toMissionEntity(mission: IMission): MissionEntity {
    return {
      id: mission.id,
      label: mission.label,
      done: mission.done,
      xp: mission.xp,
    };
  }
}
