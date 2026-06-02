export interface AdminEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
