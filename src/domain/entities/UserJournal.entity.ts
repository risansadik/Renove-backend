export interface UserJournalEntity {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: string;
  createdAt: Date;
  updatedAt: Date;
}
