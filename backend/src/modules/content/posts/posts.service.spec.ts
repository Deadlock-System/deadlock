import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { HttpStatus } from '@nestjs/common';
import {
  PostNotFoundException,
  UserIsNotOwnerException,
} from './exceptions/posts.exceptions';
import { PostErrorCode } from 'src/common/exceptions/error-codes/post-error.codes';
import { PostErrorMessage } from 'src/common/exceptions/error-messages/post-error-messages';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: DeepMockProxy<PrismaService>;

  const userSelectFields = {
    id: 'user-id-mock',
    user_name: 'usernameMock',
    user_photo: 'photo-url-mock',
    seniority_id: 'seniority-id-mock',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get(PrismaService) as DeepMockProxy<PrismaService>;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    const userId = 'user-id-mock';

    it('should create a post without languages', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test content for the post',
        anonymous: false,
      };

      const expectedPost = {
        id: 'post-id-mock',
        title: createPostDto.title,
        content: createPostDto.content,
        anonymous: createPostDto.anonymous,
        user_id: userId,
        views: 0,
        scoreVotes: 0,
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.post.create.mockResolvedValue(expectedPost);

      const result = await service.createPost(createPostDto, userId);

      expect(result).toEqual(expectedPost);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          anonymous: createPostDto.anonymous,
          user_id: userId,
          languages: undefined,
        },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: { where: { userId } },
        },
      });
    });

    it('should create a post with languages using connectOrCreate', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test content for the post',
        anonymous: false,
        languages: ['TypeScript', 'Python'],
      };

      const expectedPost = {
        id: 'post-id-mock',
        title: createPostDto.title,
        content: createPostDto.content,
        anonymous: createPostDto.anonymous,
        user_id: userId,
        views: 0,
        scoreVotes: 0,
        languages: [
          { slug: 'typescript', name: 'TypeScript' },
          { slug: 'python', name: 'Python' },
        ],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.post.create.mockResolvedValue(expectedPost);

      const result = await service.createPost(createPostDto, userId);

      expect(result).toEqual(expectedPost);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          anonymous: createPostDto.anonymous,
          user_id: userId,
          languages: {
            connectOrCreate: [
              {
                where: { slug: 'typescript' },
                create: { slug: 'typescript', name: 'TypeScript' },
              },
              {
                where: { slug: 'python' },
                create: { slug: 'python', name: 'Python' },
              },
            ],
          },
        },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: { where: { userId } },
        },
      });
    });

    it('should trim language names and slugs', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test content',
        anonymous: true,
        languages: ['  JavaScript  ', '  Go  '],
      };

      const expectedPost = {
        id: 'post-id-mock',
        title: createPostDto.title,
        content: createPostDto.content,
        anonymous: createPostDto.anonymous,
        user_id: userId,
        views: 0,
        scoreVotes: 0,
        languages: [
          { slug: 'javascript', name: 'JavaScript' },
          { slug: 'go', name: 'Go' },
        ],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.post.create.mockResolvedValue(expectedPost);

      const result = await service.createPost(createPostDto, userId);

      expect(result).toEqual(expectedPost);
      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            languages: {
              connectOrCreate: [
                {
                  where: { slug: 'javascript' },
                  create: { slug: 'javascript', name: 'JavaScript' },
                },
                {
                  where: { slug: 'go' },
                  create: { slug: 'go', name: 'Go' },
                },
              ],
            },
          }),
        }),
      );
    });

    it('should filter out empty language strings', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test content',
        anonymous: false,
        languages: ['TypeScript', '   ', ''],
      };

      const expectedPost = {
        id: 'post-id-mock',
        title: createPostDto.title,
        content: createPostDto.content,
        anonymous: createPostDto.anonymous,
        user_id: userId,
        views: 0,
        scoreVotes: 0,
        languages: [{ slug: 'typescript', name: 'TypeScript' }],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.post.create.mockResolvedValue(expectedPost);

      const result = await service.createPost(createPostDto, userId);

      expect(result).toEqual(expectedPost);
      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            languages: {
              connectOrCreate: [
                {
                  where: { slug: 'typescript' },
                  create: { slug: 'typescript', name: 'TypeScript' },
                },
              ],
            },
          }),
        }),
      );
    });

    it('should set languages as undefined when languages array is empty', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test content',
        anonymous: false,
        languages: [],
      };

      const expectedPost = {
        id: 'post-id-mock',
        title: createPostDto.title,
        content: createPostDto.content,
        anonymous: createPostDto.anonymous,
        user_id: userId,
        views: 0,
        scoreVotes: 0,
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.post.create.mockResolvedValue(expectedPost);

      await service.createPost(createPostDto, userId);

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            languages: undefined,
          }),
        }),
      );
    });

    it('should create an anonymous post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Anonymous Post',
        content: 'Secret content',
        anonymous: true,
      };

      const expectedPost = {
        id: 'post-id-mock',
        title: createPostDto.title,
        content: createPostDto.content,
        anonymous: true,
        user_id: userId,
        views: 0,
        scoreVotes: 0,
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.post.create.mockResolvedValue(expectedPost);

      const result = await service.createPost(createPostDto, userId);

      expect(result).toEqual(expectedPost);
      expect(result.anonymous).toBe(true);
    });
  });

  describe('findAll', () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: 'First Post',
        content: 'Content 1',
        anonymous: false,
        user_id: 'user-1',
        views: 0,
        scoreVotes: 0,
        languages: [{ slug: 'typescript', name: 'TypeScript' }],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'post-2',
        title: 'Second Post',
        content: 'Content 2',
        anonymous: true,
        user_id: 'user-2',
        views: 0,
        scoreVotes: 0,
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return paginated posts with total count', async () => {
      const page = 1;
      const limit = 10;

      prisma.post.findMany.mockResolvedValue(mockPosts);
      prisma.post.count.mockResolvedValue(2);

      const result = await service.findAll(page, limit);

      expect(result).toEqual({ posts: mockPosts, total: 2 });
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: false,
        },
      });
      expect(prisma.post.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should calculate skip correctly for page 2', async () => {
      const page = 2;
      const limit = 10;

      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(15);

      const result = await service.findAll(page, limit);

      expect(result).toEqual({ posts: [], total: 15 });
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 10,
          take: limit,
        }),
      );
    });

    it('should calculate skip correctly for page 3 with limit 5', async () => {
      const page = 3;
      const limit = 5;

      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(20);

      const result = await service.findAll(page, limit);

      expect(result).toEqual({ posts: [], total: 20 });
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 10,
          take: limit,
        }),
      );
    });

    it('should return empty posts array when no posts exist', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(0);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({ posts: [], total: 0 });
    });

    it('should order posts by createdAt descending', async () => {
      prisma.post.findMany.mockResolvedValue(mockPosts);
      prisma.post.count.mockResolvedValue(2);

      await service.findAll(1, 10);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should pass empty where clause when no searchKey is provided', async () => {
      prisma.post.findMany.mockResolvedValue(mockPosts);
      prisma.post.count.mockResolvedValue(2);

      await service.findAll(1, 10);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
      expect(prisma.post.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter posts by title or content when searchKey is provided', async () => {
      const searchKey = 'First';
      const filteredPosts = [mockPosts[0]];

      prisma.post.findMany.mockResolvedValue(filteredPosts);
      prisma.post.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, searchKey);

      const expectedWhere = {
        OR: [
          { title: { contains: searchKey, mode: 'insensitive' } },
          { content: { contains: searchKey, mode: 'insensitive' } },
        ],
      };

      expect(result).toEqual({ posts: filteredPosts, total: 1 });
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: false,
        },
      });
      expect(prisma.post.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it('should return empty results when searchKey matches no posts', async () => {
      const searchKey = 'nonexistent';

      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(0);

      const result = await service.findAll(1, 10, searchKey);

      const expectedWhere = {
        OR: [
          { title: { contains: searchKey, mode: 'insensitive' } },
          { content: { contains: searchKey, mode: 'insensitive' } },
        ],
      };

      expect(result).toEqual({ posts: [], total: 0 });
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );
      expect(prisma.post.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it('should apply searchKey with correct pagination', async () => {
      const searchKey = 'Post';

      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(15);

      const result = await service.findAll(2, 5, searchKey);

      const expectedWhere = {
        OR: [
          { title: { contains: searchKey, mode: 'insensitive' } },
          { content: { contains: searchKey, mode: 'insensitive' } },
        ],
      };

      expect(result).toEqual({ posts: [], total: 15 });
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
          skip: 5,
          take: 5,
        }),
      );
    });
  });

  describe('findByUserId', () => {
    const userId = 'user-id-mock';

    const mockUserPosts = [
      {
        id: 'post-1',
        title: 'First Post',
        content: 'Content 1',
        anonymous: false,
        user_id: userId,
        views: 0,
        scoreVotes: 0,
        languages: [{ slug: 'typescript', name: 'TypeScript' }],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'post-2',
        title: 'Second Post',
        content: 'Content 2',
        anonymous: true,
        user_id: userId,
        views: 0,
        scoreVotes: 0,
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all posts from a given user', async () => {
      prisma.post.findMany.mockResolvedValue(mockUserPosts);

      const result = await service.findByUserId(userId);

      expect(result).toEqual(mockUserPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: { where: { userId } },
        },
      });
    });

    it('should return an empty array when user has no posts', async () => {
      prisma.post.findMany.mockResolvedValue([]);

      const result = await service.findByUserId(userId);

      expect(result).toEqual([]);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
        }),
      );
    });

    it('should order posts by createdAt descending', async () => {
      prisma.post.findMany.mockResolvedValue(mockUserPosts);

      await service.findByUserId(userId);

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findOneById', () => {
    const postId = 'post-id-mock';

    it('should return a post when it exists', async () => {
      const expectedPost = {
        id: postId,
        title: 'Test Post',
        content: 'Test content',
        anonymous: false,
        user_id: 'user-id-mock',
        views: 5,
        scoreVotes: 0,
        languages: [{ slug: 'typescript', name: 'TypeScript' }],
        user: userSelectFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.post.findUnique.mockResolvedValue(expectedPost);

      const result = await service.findOneById(postId);

      expect(result).toEqual(expectedPost);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: false,
        },
      });
    });

    it('should throw PostNotFoundException when post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.findOneById(postId)).rejects.toThrow(
        PostNotFoundException,
      );

      await expect(service.findOneById(postId)).rejects.toMatchObject({
        code: PostErrorCode.POST_NOT_FOUND,
        message: PostErrorMessage.POST_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: false,
        },
      });
    });
  });

  describe('updatePost', () => {
    const postId = 'post-id-mock';
    const userId = 'user-id-mock';

    const existingPost = {
      id: postId,
      title: 'Original Title',
      content: 'Original content',
      anonymous: false,
      user_id: userId,
      views: 0,
      scoreVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a post without languages', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const expectedUpdatedPost = {
        ...existingPost,
        title: 'Updated Title',
        content: 'Updated content',
        languages: [],
        user: userSelectFields,
      };

      prisma.post.findUnique.mockResolvedValue(existingPost);
      prisma.post.update.mockResolvedValue(expectedUpdatedPost);

      const result = await service.updatePost(postId, updatePostDto, userId);

      expect(result).toEqual(expectedUpdatedPost);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          title: updatePostDto.title,
          content: updatePostDto.content,
          languages: undefined,
        },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: { where: { userId } },
        },
      });
    });

    it('should update a post with languages using set and connectOrCreate', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        languages: ['Rust', 'Go'],
      };

      const expectedUpdatedPost = {
        ...existingPost,
        title: 'Updated Title',
        languages: [
          { slug: 'rust', name: 'Rust' },
          { slug: 'go', name: 'Go' },
        ],
        user: userSelectFields,
      };

      prisma.post.findUnique.mockResolvedValue(existingPost);
      prisma.post.update.mockResolvedValue(expectedUpdatedPost);

      const result = await service.updatePost(postId, updatePostDto, userId);

      expect(result).toEqual(expectedUpdatedPost);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          title: updatePostDto.title,
          languages: {
            set: [],
            connectOrCreate: [
              {
                where: { slug: 'rust' },
                create: { slug: 'rust', name: 'Rust' },
              },
              {
                where: { slug: 'go' },
                create: { slug: 'go', name: 'Go' },
              },
            ],
          },
        },
        include: {
          languages: true,
          user: {
            select: {
              id: true,
              user_name: true,
              user_photo: true,
              seniority_id: true,
            },
          },
          votes: { where: { userId } },
        },
      });
    });

    it('should throw PostNotFoundException when post does not exist', async () => {
      const updatePostDto: UpdatePostDto = { title: 'Updated Title' };

      prisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePost(postId, updatePostDto, userId),
      ).rejects.toThrow(PostNotFoundException);

      await expect(
        service.updatePost(postId, updatePostDto, userId),
      ).rejects.toMatchObject({
        code: PostErrorCode.POST_NOT_FOUND,
        message: PostErrorMessage.POST_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });

      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it('should throw UserIsNotOwnerException when user is not the post owner', async () => {
      const differentUserId = 'different-user-id';
      const updatePostDto: UpdatePostDto = { title: 'Updated Title' };

      prisma.post.findUnique.mockResolvedValue(existingPost);

      await expect(
        service.updatePost(postId, updatePostDto, differentUserId),
      ).rejects.toThrow(UserIsNotOwnerException);

      await expect(
        service.updatePost(postId, updatePostDto, differentUserId),
      ).rejects.toMatchObject({
        code: PostErrorCode.USER_IS_NOT_OWNER,
        message: PostErrorMessage.USER_IS_NOT_OWNER,
        status: HttpStatus.FORBIDDEN,
      });

      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it('should trim language names and slugs on update', async () => {
      const updatePostDto: UpdatePostDto = {
        languages: ['  Python  ', '  Java  '],
      };

      const expectedUpdatedPost = {
        ...existingPost,
        languages: [
          { slug: 'python', name: 'Python' },
          { slug: 'java', name: 'Java' },
        ],
        user: userSelectFields,
      };

      prisma.post.findUnique.mockResolvedValue(existingPost);
      prisma.post.update.mockResolvedValue(expectedUpdatedPost);

      const result = await service.updatePost(postId, updatePostDto, userId);

      expect(result).toEqual(expectedUpdatedPost);
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            languages: {
              set: [],
              connectOrCreate: [
                {
                  where: { slug: 'python' },
                  create: { slug: 'python', name: 'Python' },
                },
                {
                  where: { slug: 'java' },
                  create: { slug: 'java', name: 'Java' },
                },
              ],
            },
          }),
        }),
      );
    });

    it('should filter out empty language strings on update', async () => {
      const updatePostDto: UpdatePostDto = {
        languages: ['Rust', '   ', ''],
      };

      const expectedUpdatedPost = {
        ...existingPost,
        languages: [{ slug: 'rust', name: 'Rust' }],
        user: userSelectFields,
      };

      prisma.post.findUnique.mockResolvedValue(existingPost);
      prisma.post.update.mockResolvedValue(expectedUpdatedPost);

      const result = await service.updatePost(postId, updatePostDto, userId);

      expect(result).toEqual(expectedUpdatedPost);
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            languages: {
              set: [],
              connectOrCreate: [
                {
                  where: { slug: 'rust' },
                  create: { slug: 'rust', name: 'Rust' },
                },
              ],
            },
          }),
        }),
      );
    });

    it('should set languages as undefined when update languages array is empty', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        languages: [],
      };

      const expectedUpdatedPost = {
        ...existingPost,
        title: 'Updated Title',
        languages: [],
        user: userSelectFields,
      };

      prisma.post.findUnique.mockResolvedValue(existingPost);
      prisma.post.update.mockResolvedValue(expectedUpdatedPost);

      await service.updatePost(postId, updatePostDto, userId);

      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            languages: undefined,
          }),
        }),
      );
    });
  });
});
