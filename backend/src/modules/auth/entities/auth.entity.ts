export class RefreshToken {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;

  constructor(partial: Partial<RefreshToken>) {
    Object.assign(this, partial);
  }
}