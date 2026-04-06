import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CommentsService } from './comments.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { HttpStatus } from '@nestjs/common';
import { PostNotFoundException } from '../posts/exceptions/posts.exceptions';
import {
  CommentAlreadyDeletedException,
  CommentNotFoundException,
  CommentNotOwnerException,
  ParentCommentException,
} from './exceptions/comments.exceptions';
import { PostErrorCode } from 'src/common/exceptions/error-codes/post-error.codes';
import { PostErrorMessage } from 'src/common/exceptions/error-messages/post-error-messages';
import { CommentErrorCode } from 'src/common/exceptions/error-codes/comment-error-codes';
import { CommentErrorMessages } from 'src/common/exceptions/error-messages/comment-error-messages';
import { Comment, Post } from '@prisma/client';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: DeepMockProxy<PrismaService>;

  const userSelectFields = {
    id: 'user-id-mock',
    user_name: 'usernameMock',
    user_photo: 'photo-url-mock',
    seniority_id: 'seniority-id-mock',
  };

  const commentIncludeUser = {
    user: {
      select: {
        id: true,
        user_name: true,
        user_photo: true,
        seniority_id: true,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get(PrismaService) as DeepMockProxy<PrismaService>;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    const postId = 'post-id-mock';
    const userId = 'user-id-mock';

    it('should create a root comment successfully', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'This is a test comment',
        anonymous: false,
      };

      const expectedComment = {
        id: 'comment-id-mock',
        content: createCommentDto.content,
        anonymous: createCommentDto.anonymous,
        user_id: userId,
        post_id: postId,
        parent_comment_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: userSelectFields,
      };

      prisma.post.findUnique.mockResolvedValue({ id: postId } as Post);
      prisma.comment.create.mockResolvedValue(expectedComment);

      const result = await service.createComment(
        postId,
        userId,
        createCommentDto,
      );

      expect(result).toEqual(expectedComment);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        select: { id: true },
      });
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: createCommentDto.content,
          anonymous: createCommentDto.anonymous,
          user_id: userId,
          post_id: postId,
          parent_comment_id: null,
        },
        include: commentIncludeUser,
      });
    });

    it('should create an anonymous comment', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Anonymous comment',
        anonymous: true,
      };

      const expectedComment = {
        id: 'comment-id-mock',
        content: createCommentDto.content,
        anonymous: true,
        user_id: userId,
        post_id: postId,
        parent_comment_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: userSelectFields,
      };

      prisma.post.findUnique.mockResolvedValue({ id: postId } as Post);
      prisma.comment.create.mockResolvedValue(expectedComment);

      const result = await service.createComment(
        postId,
        userId,
        createCommentDto,
      );

      expect(result).toEqual(expectedComment);
      expect(result.anonymous).toBe(true);
    });

    it('should create a reply to an existing comment', async () => {
      const parentCommentId = 'parent-comment-id-mock';
      const createCommentDto: CreateCommentDto = {
        content: 'This is a reply',
        anonymous: false,
        parentCommentId,
      };

      const parentComment = {
        id: parentCommentId,
        post_id: postId,
      };

      const expectedComment = {
        id: 'reply-comment-id-mock',
        content: createCommentDto.content,
        anonymous: createCommentDto.anonymous,
        user_id: userId,
        post_id: postId,
        parent_comment_id: parentCommentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: userSelectFields,
      };

      prisma.post.findUnique.mockResolvedValue({ id: postId } as Post);
      prisma.comment.findUnique.mockResolvedValue(parentComment as Comment);
      prisma.comment.create.mockResolvedValue(expectedComment);

      const result = await service.createComment(
        postId,
        userId,
        createCommentDto,
      );

      expect(result).toEqual(expectedComment);
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: parentCommentId },
        select: { id: true, post_id: true },
      });
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: createCommentDto.content,
          anonymous: createCommentDto.anonymous,
          user_id: userId,
          post_id: postId,
          parent_comment_id: parentCommentId,
        },
        include: commentIncludeUser,
      });
    });

    it('should throw PostNotFoundException when post does not exist', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Comment on missing post',
        anonymous: false,
      };

      prisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment(postId, userId, createCommentDto),
      ).rejects.toThrow(PostNotFoundException);

      await expect(
        service.createComment(postId, userId, createCommentDto),
      ).rejects.toMatchObject({
        code: PostErrorCode.POST_NOT_FOUND,
        message: PostErrorMessage.POST_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });

      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it('should throw CommentNotFoundException when parent comment does not exist', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Reply to missing comment',
        anonymous: false,
        parentCommentId: 'non-existent-parent-id',
      };

      prisma.post.findUnique.mockResolvedValue({ id: postId } as Post);
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment(postId, userId, createCommentDto),
      ).rejects.toThrow(CommentNotFoundException);

      await expect(
        service.createComment(postId, userId, createCommentDto),
      ).rejects.toMatchObject({
        code: CommentErrorCode.COMMENT_NOT_FOUND,
        message: CommentErrorMessages.COMMENT_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });

      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it('should throw ParentCommentException when parent comment belongs to a different post', async () => {
      const parentCommentId = 'parent-comment-id-mock';
      const createCommentDto: CreateCommentDto = {
        content: 'Reply to wrong post comment',
        anonymous: false,
        parentCommentId,
      };

      prisma.post.findUnique.mockResolvedValue({ id: postId } as Post);
      prisma.comment.findUnique.mockResolvedValue({
        id: parentCommentId,
        post_id: 'different-post-id',
      } as Comment);

      await expect(
        service.createComment(postId, userId, createCommentDto),
      ).rejects.toThrow(ParentCommentException);

      await expect(
        service.createComment(postId, userId, createCommentDto),
      ).rejects.toMatchObject({
        code: CommentErrorCode.PARENT_COMMENT_EXCEPTION,
        message: CommentErrorMessages.PARENT_COMMENT_EXCEPTION,
        status: HttpStatus.BAD_REQUEST,
      });

      expect(prisma.comment.create).not.toHaveBeenCalled();
    });
  });

  describe('getCommentsTreeByPost', () => {
    const postId = 'post-id-mock';
    const currentUserId = 'user-id-mock';

    const baseMockDate = new Date('2026-01-01T00:00:00Z');

    it('should return an empty array when there are no comments', async () => {
      prisma.comment.findMany.mockResolvedValue([]);

      const result = await service.getCommentsTreeByPost(postId, currentUserId);

      expect(result).toEqual([]);
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { post_id: postId },
        orderBy: { createdAt: 'asc' },
        include: commentIncludeUser,
      });
    });

    it('should return root comments without replies', async () => {
      const flatComments = [
        {
          id: 'comment-1',
          content: 'First comment',
          anonymous: false,
          user_id: currentUserId,
          post_id: postId,
          parent_comment_id: null,
          createdAt: baseMockDate,
          updatedAt: baseMockDate,
          deletedAt: null,
          user: userSelectFields,
        },
        {
          id: 'comment-2',
          content: 'Second comment',
          anonymous: false,
          user_id: 'another-user-id',
          post_id: postId,
          parent_comment_id: null,
          createdAt: baseMockDate,
          updatedAt: baseMockDate,
          deletedAt: null,
          user: userSelectFields,
        },
      ];

      prisma.comment.findMany.mockResolvedValue(flatComments);

      const result = await service.getCommentsTreeByPost(postId, currentUserId);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'comment-1',
        content: 'First comment',
        isOwner: true,
        replies: [],
      });
      expect(result[1]).toMatchObject({
        id: 'comment-2',
        content: 'Second comment',
        isOwner: false,
        replies: [],
      });
    });

    it('should build a nested comment tree with replies', async () => {
      const flatComments = [
        {
          id: 'root-comment',
          content: 'Root comment',
          anonymous: false,
          user_id: currentUserId,
          post_id: postId,
          parent_comment_id: null,
          createdAt: baseMockDate,
          updatedAt: baseMockDate,
          deletedAt: null,
          user: userSelectFields,
        },
        {
          id: 'reply-1',
          content: 'First reply',
          anonymous: false,
          user_id: 'another-user-id',
          post_id: postId,
          parent_comment_id: 'root-comment',
          createdAt: new Date('2026-01-01T01:00:00Z'),
          updatedAt: new Date('2026-01-01T01:00:00Z'),
          deletedAt: null,
          user: userSelectFields,
        },
        {
          id: 'reply-2',
          content: 'Second reply',
          anonymous: false,
          user_id: currentUserId,
          post_id: postId,
          parent_comment_id: 'root-comment',
          createdAt: new Date('2026-01-01T02:00:00Z'),
          updatedAt: new Date('2026-01-01T02:00:00Z'),
          deletedAt: null,
          user: userSelectFields,
        },
      ];

      prisma.comment.findMany.mockResolvedValue(flatComments);

      const result = await service.getCommentsTreeByPost(postId, currentUserId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('root-comment');
      expect(result[0].replies).toHaveLength(2);
      expect(result[0].replies[0].id).toBe('reply-1');
      expect(result[0].replies[1].id).toBe('reply-2');
    });

    it('should build deeply nested replies', async () => {
      const flatComments = [
        {
          id: 'root',
          content: 'Root',
          anonymous: false,
          user_id: currentUserId,
          post_id: postId,
          parent_comment_id: null,
          createdAt: baseMockDate,
          updatedAt: baseMockDate,
          deletedAt: null,
          user: userSelectFields,
        },
        {
          id: 'level-1',
          content: 'Level 1',
          anonymous: false,
          user_id: 'user-2',
          post_id: postId,
          parent_comment_id: 'root',
          createdAt: new Date('2026-01-01T01:00:00Z'),
          updatedAt: new Date('2026-01-01T01:00:00Z'),
          deletedAt: null,
          user: userSelectFields,
        },
        {
          id: 'level-2',
          content: 'Level 2',
          anonymous: false,
          user_id: currentUserId,
          post_id: postId,
          parent_comment_id: 'level-1',
          createdAt: new Date('2026-01-01T02:00:00Z'),
          updatedAt: new Date('2026-01-01T02:00:00Z'),
          deletedAt: null,
          user: userSelectFields,
        },
      ];

      prisma.comment.findMany.mockResolvedValue(flatComments);

      const result = await service.getCommentsTreeByPost(postId, currentUserId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('root');
      expect(result[0].replies).toHaveLength(1);
      expect(result[0].replies[0].id).toBe('level-1');
      expect(result[0].replies[0].replies).toHaveLength(1);
      expect(result[0].replies[0].replies[0].id).toBe('level-2');
    });

    it('should correctly set isOwner based on currentUserId', async () => {
      const flatComments = [
        {
          id: 'comment-own',
          content: 'My comment',
          anonymous: false,
          user_id: currentUserId,
          post_id: postId,
          parent_comment_id: null,
          createdAt: baseMockDate,
          updatedAt: baseMockDate,
          deletedAt: null,
          user: userSelectFields,
        },
        {
          id: 'comment-other',
          content: "Someone else's comment",
          anonymous: false,
          user_id: 'different-user-id',
          post_id: postId,
          parent_comment_id: null,
          createdAt: baseMockDate,
          updatedAt: baseMockDate,
          deletedAt: null,
          user: userSelectFields,
        },
      ];

      prisma.comment.findMany.mockResolvedValue(flatComments);

      const result = await service.getCommentsTreeByPost(postId, currentUserId);

      expect(result[0].isOwner).toBe(true);
      expect(result[1].isOwner).toBe(false);
    });

    it('should set isOwner to false for all comments when currentUserId is not provided', async () => {
      const flatComments = [
        {
          id: 'comment-1',
          content: 'A comment',
          anonymous: false,
          user_id: 'some-user-id',
          post_id: postId,
          parent_comment_id: null,
          createdAt: baseMockDate,
          updatedAt: baseMockDate,
          deletedAt: null,
          user: userSelectFields,
        },
      ];

      prisma.comment.findMany.mockResolvedValue(flatComments);

      const result = await service.getCommentsTreeByPost(postId);

      expect(result[0].isOwner).toBe(false);
    });

    it('should map deletedAt correctly for soft-deleted comments', async () => {
      const deletedDate = new Date('2026-01-02T00:00:00Z');
      const flatComments = [
        {
          id: 'deleted-comment',
          content: 'Deleted comment',
          anonymous: false,
          user_id: currentUserId,
          post_id: postId,
          parent_comment_id: null,
          createdAt: baseMockDate,
          updatedAt: baseMockDate,
          deletedAt: deletedDate,
          user: userSelectFields,
        },
      ];

      prisma.comment.findMany.mockResolvedValue(flatComments);

      const result = await service.getCommentsTreeByPost(postId, currentUserId);

      expect(result[0].deletedAt).toEqual(deletedDate);
    });
  });

  describe('deleteComment', () => {
    const commentId = 'comment-id-mock';
    const userId = 'user-id-mock';

    const existingComment = {
      id: commentId,
      content: 'Comment to delete',
      anonymous: false,
      user_id: userId,
      post_id: 'post-id-mock',
      parent_comment_id: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should soft-delete a comment successfully', async () => {
      prisma.comment.findUnique.mockResolvedValue(existingComment);
      prisma.comment.update.mockResolvedValue({
        ...existingComment,
        deletedAt: new Date(),
      });

      const result = await service.deleteComment(commentId, userId);

      expect(result).toEqual({ message: 'Comentário excluído com sucesso.' });
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw CommentNotFoundException when comment does not exist', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.deleteComment(commentId, userId)).rejects.toThrow(
        CommentNotFoundException,
      );

      await expect(
        service.deleteComment(commentId, userId),
      ).rejects.toMatchObject({
        code: CommentErrorCode.COMMENT_NOT_FOUND,
        message: CommentErrorMessages.COMMENT_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });

      expect(prisma.comment.update).not.toHaveBeenCalled();
    });

    it('should throw CommentNotOwnerException when user is not the comment owner', async () => {
      const differentUserId = 'different-user-id';

      prisma.comment.findUnique.mockResolvedValue(existingComment);

      await expect(
        service.deleteComment(commentId, differentUserId),
      ).rejects.toThrow(CommentNotOwnerException);

      await expect(
        service.deleteComment(commentId, differentUserId),
      ).rejects.toMatchObject({
        code: CommentErrorCode.COMMENT_NOT_OWNER,
        message: CommentErrorMessages.COMMENT_NOT_OWNER,
        status: HttpStatus.FORBIDDEN,
      });

      expect(prisma.comment.update).not.toHaveBeenCalled();
    });

    it('should throw CommentAlreadyDeletedException when comment is already deleted', async () => {
      const alreadyDeletedComment = {
        ...existingComment,
        deletedAt: new Date('2026-01-01T00:00:00Z'),
      };

      prisma.comment.findUnique.mockResolvedValue(alreadyDeletedComment);

      await expect(service.deleteComment(commentId, userId)).rejects.toThrow(
        CommentAlreadyDeletedException,
      );

      await expect(
        service.deleteComment(commentId, userId),
      ).rejects.toMatchObject({
        code: CommentErrorCode.COMMENT_ALREADY_DELETED,
        message: CommentErrorMessages.COMMENT_ALREADY_DELETED,
        status: HttpStatus.BAD_REQUEST,
      });

      expect(prisma.comment.update).not.toHaveBeenCalled();
    });
  });
});
