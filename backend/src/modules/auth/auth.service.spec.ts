import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignInUseCase } from './useCases/sign-in.usecase';
import { TokenService } from './services/token-service';
import { AuthRepository } from './repository/auth.repository';
import { hash } from 'bcrypt';
import {
  mockSignInDto,
  mockSignInResponse,
  mockRefreshDto,
  mockAuthRepository,
  mockSignInUseCase, 
  mockTokenService,
} from './mocks/auth.mocks';
import { UserRepository } from '../user/repository/user.repository';
import { AuthErrorCode } from 'src/common/exceptions/error-codes/auth-error-codes';
import { AuthErrorMessages } from 'src/common/exceptions/error-messages/auth-error-messages';

//! Mock User
const mockUserRepository = {
  findByUserId: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let repository: AuthRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SignInUseCase, useValue: mockSignInUseCase },
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: TokenService, useValue: mockTokenService },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<AuthRepository>(AuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    it('should be execute signInUseCase with SignInDto', async () => {
      mockSignInUseCase.execute.mockResolvedValue(mockSignInResponse);

      const result = await service.authenticate(mockSignInDto);

      expect(mockSignInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
      expect(result).toEqual(mockSignInResponse);
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      const invalidTokenHash = await hash('asdlkaoskdpoaskd', 10);
      mockAuthRepository.findByUserId.mockResolvedValue({
        id: 'token-id',
        userId: mockRefreshDto.userId,
        token: invalidTokenHash,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 9999 * 60 * 60),
      });

      await expect(service.refreshToken(mockRefreshDto)).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
        message: AuthErrorMessages.INVALID_REFRESH_TOKEN,
        status: 401,
      });
    });

    it('should return new tokens if valid', async () => {
      const token = 'asdlkaoskdpoaskd'
      const hashedToken = await hash(token, 10);

      const refreshData = {
        id: 'token-id',
        userId: mockRefreshDto.userId,
        token: hashedToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 9999 * 60 * 60),
      };

      mockAuthRepository.findByUserId.mockResolvedValue(refreshData);
      mockUserRepository.findByUserId.mockResolvedValue({
        id: mockRefreshDto.userId,
        username: 'nameExample',
      });
      mockTokenService.generateAccessToken.mockReturnValue('accessToken');
      mockTokenService.generateRefreshToken.mockReturnValue('newRefreshToken');

      const refreshDto = { ...mockRefreshDto, refreshToken: token };
      const result = await service.refreshToken(refreshDto);

      expect(result).toEqual({
        accessToken: 'accessToken',
        newRefreshToken: 'newRefreshToken',
      });

      expect(mockAuthRepository.findByUserId).toHaveBeenCalledWith(
        mockRefreshDto.userId,
      );
      expect(mockUserRepository.findByUserId).toHaveBeenCalledWith(
        mockRefreshDto.userId,
      );
      expect(mockTokenService.generateAccessToken).toHaveBeenCalled();
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalled();
    });
  });
});