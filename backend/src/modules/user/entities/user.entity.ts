import { Seniority } from './enums/seniority.enum';

export class User {
  id: string;
  email: string;
  username: string;
  userPhoto: string | null;
  hashedPassword: string;
  createdAt: Date;
  seniorityId: Seniority;

  //TODO: implementação do escopo de posts

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
