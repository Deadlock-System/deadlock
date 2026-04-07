import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignInUseCase } from './useCases/sign-in.usecase';
import { TokenService } from './services/token-service';
import { hash } from 'bcrypt';
import {
  mockSignInDto,
  mockSignInResponse,
  mockAuthRepository,
  mockSignInUseCase,
  mockTokenService,
} from './mocks/auth.mocks';
import { AuthErrorCode } from 'src/common/exceptions/error-codes/auth-error-codes';
import { AuthErrorMessages } from 'src/common/exceptions/error-messages/auth-error-messages';
import { AuthRepository } from './repositories/auth.repository';
import { UserRepository } from '../user/repositories/user.repository';

const mockUserRepository = {
  findByUserId: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticate', () => {
    it('should execute signInUseCase with SignInDto', async () => {
      mockSignInUseCase.execute.mockResolvedValue(mockSignInResponse);

      const result = await service.authenticate(mockSignInDto);

      expect(mockSignInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
      expect(result).toEqual(mockSignInResponse);
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'qweqweqwe';
      const userId = '10936e59-8c04-458a-9439-d27f04a51eb8';

      mockTokenService.verifyRefreshToken = jest.fn().mockReturnValue({
        sub: userId,
      });

      const invalidTokenHash = await hash('asdasdasdasd', 10);

      mockAuthRepository.findByUserId.mockResolvedValue({
        userId,
        token: invalidTokenHash,
      });

      await expect(service.refreshToken(token)).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
        message: AuthErrorMessages.INVALID_REFRESH_TOKEN,
        status: 401,
      });
    });

    it('should return new tokens if valid', async () => {
      const token = 'asdlkaoskdpoaskd';
      const userId = '10936e598c04';
      const hashedToken = await hash(token, 10);

      mockTokenService.verifyRefreshToken = jest.fn().mockReturnValue({
        sub: userId,
      });

      mockAuthRepository.findByUserId.mockResolvedValue({
        userId,
        token: hashedToken,
      });

      mockUserRepository.findByUserId.mockResolvedValue({
        id: userId,
        username: 'nameExample',
      });

      mockTokenService.generateAccessToken.mockReturnValue('accessToken');
      mockTokenService.generateRefreshToken.mockReturnValue('newRefreshToken');

      const result = await service.refreshToken(token);

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'newRefreshToken',
      });

      expect(mockAuthRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockTokenService.generateAccessToken).toHaveBeenCalled();
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalled();
    });
  });
});
