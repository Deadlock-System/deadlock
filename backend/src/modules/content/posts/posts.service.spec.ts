import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from '@prisma/client';

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
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
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
        languages: [
          { slug: 'typescript', name: 'TypeScript' },
          { slug: 'python', name: 'Python' },
        ],
        user: userSelectFields,
        createdAt: new Date(),
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
        languages: [
          { slug: 'javascript', name: 'JavaScript' },
          { slug: 'go', name: 'Go' },
        ],
        user: userSelectFields,
        createdAt: new Date(),
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
        languages: [{ slug: 'typescript', name: 'TypeScript' }],
        user: userSelectFields,
        createdAt: new Date(),
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
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
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
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
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
        languages: [{ slug: 'typescript', name: 'TypeScript' }],
        user: userSelectFields,
        createdAt: new Date(),
      },
      {
        id: 'post-2',
        title: 'Second Post',
        content: 'Content 2',
        anonymous: true,
        user_id: 'user-2',
        views: 0,
        languages: [],
        user: userSelectFields,
        createdAt: new Date(),
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
        },
      });
      expect(prisma.post.count).toHaveBeenCalled();
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
  });
});
