import { Post } from '@prisma/client';

export class PostEntity implements Post {
  id: string;
  title: string;
  anonymous: boolean;
  content: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  user_id: string;
}
