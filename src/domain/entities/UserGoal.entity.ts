export interface UserGoalEntity {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  category: string;
  targetDate?: string;
  createdAt: Date;
  updatedAt: Date;
}
