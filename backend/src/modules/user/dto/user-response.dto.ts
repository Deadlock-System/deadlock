import { Seniority } from '../entities/enums/seniority.enum';

export class UserResponseDto {
  id: string;
  email: string | null;
  username: string;
  userPhoto: string | null;
  seniorityId: Seniority;
  createdAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
