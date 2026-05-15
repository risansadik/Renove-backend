import { UserProgressModel } from "../databases/schema/user-progress.schema.js";
import type { IUserProgressDocument, IMission } from "../databases/schema/user-progress.schema.js";

const XP_PER_LEVEL = 500;

function computeLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function computeStreak(doc: IUserProgressDocument): number {
  if (!doc.lastActivityDate) return 0;
  const last = new Date(doc.lastActivityDate);
  const today = new Date();
  const diffMs = today.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays <= 1) return doc.streakDays;
  return 0; // streak broken
}

export class UserProgressRepository {
  /** Find or create a progress record for the user */
  async findOrCreate(userId: string): Promise<IUserProgressDocument> {
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

  async getDashboard(userId: string): Promise<IUserProgressDocument> {
    return this.findOrCreate(userId);
  }

  async logMood(userId: string, mood: string): Promise<void> {
    const doc = await this.findOrCreate(userId);
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

  async toggleMission(userId: string, missionId: string): Promise<IMission[]> {
    const doc = await this.findOrCreate(userId);
    const mission = doc.missions.find((m) => m.id === missionId);
    if (!mission) return doc.missions;
    mission.done = !mission.done;
    if (mission.done) {
      doc.xp += mission.xp;
    } else {
      doc.xp = Math.max(0, doc.xp - mission.xp);
    }
    doc.level = computeLevel(doc.xp);
    doc.lastActivityDate = new Date();
    await doc.save();
    return doc.missions;
  }

  async updateStreak(userId: string): Promise<void> {
    const doc = await this.findOrCreate(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = doc.lastActivityDate ? new Date(doc.lastActivityDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    if (!last || (today.getTime() - last.getTime()) > 86400000) {
      doc.streakDays = last && (today.getTime() - last.getTime()) === 86400000 
        ? doc.streakDays + 1 
        : 1;
    }
    doc.lastActivityDate = new Date();
    await doc.save();
  }
}
