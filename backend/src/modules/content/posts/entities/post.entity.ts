import { Post } from '@prisma/client';

export class PostEntity implements Post {
  id: string;
  title: string;
  anonymous: boolean;
  content: string;
  views: number;
  createdAt: Date;
  user_id: string;
}
