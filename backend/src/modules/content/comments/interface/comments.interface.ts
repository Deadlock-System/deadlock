import { Seniority } from '@prisma/client';

export type CommentTreeNode = {
  id: string;
  content: string;
  anonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  parentCommentId: string | null;
  isOwner: boolean;
  user: UserInclude | null;
  replies: CommentTreeNode[];
  scoreVotes: number;
  votes: VotesInclude[];
};

type UserInclude = {
  id: string;
  user_name: string;
  user_photo: string | null;
  seniority_id: Seniority;
};

type VotesInclude = {
  id: string;
  userId: string;
  value: number;
  commentId: string;
};
