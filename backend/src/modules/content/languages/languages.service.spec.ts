import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { LanguagesService } from './languages.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Language } from '@prisma/client';

describe('LanguagesService', () => {
  let service: LanguagesService;
  let prisma: DeepMockProxy<PrismaService>;

  const mockLanguages: Language[] = [
    { id: 1, slug: 'go', name: 'Go' },
    { id: 2, slug: 'javascript', name: 'JavaScript' },
    { id: 3, slug: 'python', name: 'Python' },
    { id: 4, slug: 'typescript', name: 'TypeScript' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);
    prisma = module.get(PrismaService) as DeepMockProxy<PrismaService>;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all languages without search term', async () => {
      prisma.language.findMany.mockResolvedValue(mockLanguages);

      const result = await service.findAll();

      expect(result).toEqual(mockLanguages);
      expect(prisma.language.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { name: 'asc' },
        take: 50,
      });
    });

    it('should filter languages by search term using case-insensitive contains', async () => {
      const filteredLanguages = [mockLanguages[1], mockLanguages[3]];

      prisma.language.findMany.mockResolvedValue(filteredLanguages);

      const result = await service.findAll('script');

      expect(result).toEqual(filteredLanguages);
      expect(prisma.language.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'script',
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
        take: 50,
      });
    });

    it('should return empty array when no languages match the search term', async () => {
      prisma.language.findMany.mockResolvedValue([]);

      const result = await service.findAll('nonexistent');

      expect(result).toEqual([]);
      expect(prisma.language.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'nonexistent',
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
        take: 50,
      });
    });

    it('should return empty array when no languages exist', async () => {
      prisma.language.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should order results by name ascending', async () => {
      prisma.language.findMany.mockResolvedValue(mockLanguages);

      await service.findAll();

      expect(prisma.language.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        }),
      );
    });

    it('should limit results to 50', async () => {
      prisma.language.findMany.mockResolvedValue(mockLanguages);

      await service.findAll();

      expect(prisma.language.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });

    it('should pass undefined searchTerm as undefined where clause', async () => {
      prisma.language.findMany.mockResolvedValue(mockLanguages);

      await service.findAll(undefined);

      expect(prisma.language.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: undefined,
        }),
      );
    });
  });
});
