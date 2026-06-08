import { injectable } from "inversify";
import type { IUserProgressRepository } from "../../domain/repositories/user-progress.repository.ts";
import type { MissionEntity, UserProgressEntity } from "../../domain/entities/UserProgress.entity.ts";
import { UserProgressModel } from "../databases/schema/user-progress.schema.ts";
import { MS_IN_DAY } from "../../shared/constants/index.ts";
import type { IUserProgressDocument, IMission } from "../databases/schema/user-progress.schema.ts";

const XP_PER_LEVEL = 500;

function computeLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function computeStreak(doc: IUserProgressDocument): number {
  if (!doc.lastActivityDate) return 0;
  const last = new Date(doc.lastActivityDate);
  const today = new Date();
  const diffMs = today.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(diffMs / MS_IN_DAY);
  if (diffDays <= 1) return doc.streakDays;
  return 0; // streak broken
}

function toEntity(doc: IUserProgressDocument): UserProgressEntity {
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

@injectable()
export class UserProgressRepository implements IUserProgressRepository {
  /** Find or create a progress record for the user */
  private async _findOrCreateDocument(userId: string): Promise<IUserProgressDocument> {
    let doc = await UserProgressModel.findOne({ userId }).exec();
    if (!doc) {
      doc = await UserProgressModel.create({ userId });
    }
    // Re-compute streak in case days have passed
    const computed = computeStreak(doc);
    if (computed !== doc.streakDays) {
      doc.streakDays = computed;
      await doc.save();
    }
    return doc;
  }

  async findOrCreate(userId: string): Promise<UserProgressEntity> {
    return toEntity(await this._findOrCreateDocument(userId));
  }

  async getDashboard(userId: string): Promise<UserProgressEntity> {
    return this.findOrCreate(userId);
  }

  async logMood(userId: string, mood: string): Promise<void> {
    const doc = await this._findOrCreateDocument(userId);
    doc.moodLogs.push({ mood: mood as IUserProgressDocument["moodLogs"][0]["mood"], loggedAt: new Date() });
    // Award XP for mood logging if mission 2 not yet done
    const moodMission = doc.missions.find((m) => m.id === "2");
    if (moodMission && !moodMission.done) {
      moodMission.done = true;
      doc.xp += moodMission.xp;
      doc.level = computeLevel(doc.xp);
    }
    doc.lastActivityDate = new Date();
    doc.streakDays = doc.streakDays + (doc.streakDays === 0 ? 1 : 0);
    await doc.save();
  }

  async toggleMission(userId: string, missionId: string): Promise<MissionEntity[]> {
    const doc = await this._findOrCreateDocument(userId);
    const mission = doc.missions.find((m) => m.id === missionId);
    if (!mission) return doc.missions.map(toMissionEntity);
    mission.done = !mission.done;
    if (mission.done) {
      doc.xp += mission.xp;
    } else {
      doc.xp = Math.max(0, doc.xp - mission.xp);
    }
    doc.level = computeLevel(doc.xp);
    doc.lastActivityDate = new Date();
    await doc.save();
    return doc.missions.map(toMissionEntity);
  }

  async updateStreak(userId: string): Promise<void> {
    const doc = await this._findOrCreateDocument(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = doc.lastActivityDate ? new Date(doc.lastActivityDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    if (!last || (today.getTime() - last.getTime()) > MS_IN_DAY) {
      doc.streakDays = last && (today.getTime() - last.getTime()) === MS_IN_DAY
        ? doc.streakDays + 1
        : 1;
    }
    doc.lastActivityDate = new Date();
    await doc.save();
  }

  async addXp(userId: string, xp: number): Promise<void> {
    const doc = await this._findOrCreateDocument(userId);
    doc.xp += xp;
    doc.level = computeLevel(doc.xp);
    doc.lastActivityDate = new Date();
    await doc.save();
  }
}

function toMissionEntity(mission: IMission): MissionEntity {
  return {
    id: mission.id,
    label: mission.label,
    done: mission.done,
    xp: mission.xp,
  };
}
