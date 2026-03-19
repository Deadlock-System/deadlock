import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignInUseCase } from './useCases/sign-in.usecase';
import { AuthRepository } from './repository/prisma-auth.repository';
import { TokenService } from './services/token-service';
import { UnauthorizedException } from '@nestjs/common';
import {
  mockSignInDto,
  mockSignInResponse,
  mockRefreshDto,
  mockAuthRepository,
  mockSignInUseCase, 
  mockTokenService
} from './mocks/auth.mocks';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SignInUseCase, useValue: mockSignInUseCase },
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: TokenService, useValue: mockTokenService },
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
    it('should be execute signInUseCase with SignInDto', async () => {
      mockSignInUseCase.execute.mockResolvedValue(mockSignInResponse);

      const result = await service.authenticate(mockSignInDto);

      expect(mockSignInUseCase.execute).toHaveBeenCalledWith(mockSignInDto);
      expect(result).toEqual(mockSignInResponse);
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      mockAuthRepository.validateToken.mockResolvedValue(false);

      await expect(service.refreshToken(mockRefreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new tokens if valid', async () => {
      const refreshData = { user: { user_name: 'tester' } };
      mockAuthRepository.validateToken.mockResolvedValue(true);
      mockAuthRepository.findByUserId.mockResolvedValue(refreshData);
      mockTokenService.generateAccessToken.mockReturnValue('accessToken');
      mockTokenService.generateRefreshToken.mockReturnValue('newRefreshToken');

      const result = await service.refreshToken(mockRefreshDto);

      expect(result).toEqual({
        accessToken: 'accessToken',
        newRefreshToken: 'newRefreshToken',
      });
    });
  });
});