import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { SignInResponseDto } from "../dto/sign-in-response.dto";
import { SignInDto } from "../dto/sign-in.dto";

export const mockSignInUseCase = {
  execute: jest.fn(),
};

export const mockAuthRepository = {
  validateToken: jest.fn(),
  findByUserId: jest.fn(),
  refreshTokenRegister: jest.fn(),
};

export const mockTokenService = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
};

export const mockSignInDto: SignInDto = {
  email: 'email@example.com',
  password: 'Password@123',
};

export const mockRefreshDto: RefreshTokenDto = {
  userId: '10936e59-8c04-458a-9439-d27f04a51eb8',
  refreshToken: 'token',
};

export const mockSignInResponse: SignInResponseDto = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
};