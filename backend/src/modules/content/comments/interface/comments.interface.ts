import { Seniority } from '@prisma/client';

export type CommentTreeNode = {
  id: string;
  content: string;
  anonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  parentCommentId: string | null;
  isOwner: boolean;
  user: UserInclude | null;
  replies: CommentTreeNode[];
};

type UserInclude = {
  id: string;
  user_name: string;
  user_photo: string | null;
  seniority_id: Seniority;
};
