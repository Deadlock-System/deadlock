import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserErrorCode } from 'src/common/exceptions/error-codes/user-error-codes';
import { UserErrorMessages } from 'src/common/exceptions/error-messages/user-error-messages';
import {
  EmailAlreadyExistsException,
  InvalidPasswordException,
  UsernameAlreadyExistsException,
  UserNotFoundException,
} from './exceptions/user.exceptions';
import { AuthService } from '../auth/auth.service';
import { compare, hash } from 'bcrypt';
import { HttpStatus } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let authService: AuthService;
  let userEntityMock: User;
  let createUserDtoMock: CreateUserDto;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updatePasswordAndRevokeTokens: jest.fn(),
  };

  const mockAuthService = {
    generateAuthTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
    authService = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    userEntityMock = new User({
      id: 'user-id-mock',
      email: 'email@email.com',
      username: 'usernameMock',
      hashedPassword: 'hashedPasswordMock',
    });

    createUserDtoMock = {
      email: 'email@email.com',
      username: 'usernameMock',
      password: 'password',
      confirmPassword: 'password',
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (register a new user)', () => {
    it('should register a new user with success', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(repository, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(userEntityMock);

      const result = await service.create(createUserDtoMock);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.email).toEqual(userEntityMock.email);
      expect(result.username).toEqual(userEntityMock.username);
      expect(result).not.toHaveProperty('hashedPassword');

      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw conflict when email is duplicated', async () => {
      const findByEmailMethodSpy = jest
        .spyOn(repository, 'findByEmail')
        .mockResolvedValue(userEntityMock);

      await expect(service.create(createUserDtoMock)).rejects.toThrow(
        EmailAlreadyExistsException,
      );

      await expect(service.create(createUserDtoMock)).rejects.toMatchObject({
        code: UserErrorCode.EMAIL_ALREADY_EXISTS,
        message: UserErrorMessages.EMAIL_ALREADY_EXISTS,
        status: HttpStatus.CONFLICT,
      });

      expect(findByEmailMethodSpy).toHaveBeenCalledWith(
        createUserDtoMock.email,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw conflict when username is duplicated', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      const findByUsernameMethodSpy = jest
        .spyOn(repository, 'findByUsername')
        .mockResolvedValue(userEntityMock);

      await expect(service.create(createUserDtoMock)).rejects.toThrow(
        UsernameAlreadyExistsException,
      );

      await expect(service.create(createUserDtoMock)).rejects.toMatchObject({
        code: UserErrorCode.USERNAME_ALREADY_EXISTS,
        message: UserErrorMessages.USERNAME_ALREADY_EXISTS,
        status: HttpStatus.CONFLICT,
      });

      expect(findByUsernameMethodSpy).toHaveBeenCalledWith(
        createUserDtoMock.username,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw bad request when password is different from confirmPassword', async () => {
      createUserDtoMock = {
        ...createUserDtoMock,
        password: 'password',
        confirmPassword: 'differentPassword',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(repository, 'findByUsername').mockResolvedValue(null);

      await expect(service.create(createUserDtoMock)).rejects.toThrow(
        InvalidPasswordException,
      );

      await expect(service.create(createUserDtoMock)).rejects.toMatchObject({
        code: UserErrorCode.INVALID_PASSWORD,
        message: UserErrorMessages.INVALID_PASSWORD,
        status: HttpStatus.BAD_REQUEST,
      });

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findByUserId (find user by id)', () => {
    const userId = 'user-id-mock';

    it('should return user data when user exists', async () => {
      jest.spyOn(repository, 'findByUserId').mockResolvedValue(userEntityMock);

      const result = await service.findByUserId(userId);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.email).toEqual(userEntityMock.email);
      expect(result.username).toEqual(userEntityMock.username);
      expect(result).not.toHaveProperty('hashedPassword');

      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should throw not found when user does not exist', async () => {
      jest.spyOn(repository, 'findByUserId').mockResolvedValue(null);

      await expect(service.findByUserId(userId)).rejects.toThrow(
        UserNotFoundException,
      );

      await expect(service.findByUserId(userId)).rejects.toMatchObject({
        code: UserErrorCode.USER_NOT_FOUND,
        message: UserErrorMessages.USER_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });

      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('update (update user data)', () => {
    const userId = 'user-id-mock';

    it('should update user data with success', async () => {
      const updateUserDto: UpdateUserDto = { username: 'newUsername' };
      const updatedUserEntity = new User({
        ...userEntityMock,
        username: 'newUsername',
      });

      jest.spyOn(repository, 'findByUserId').mockResolvedValue(userEntityMock);
      jest.spyOn(repository, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedUserEntity);

      const result = await service.update(updateUserDto, userId);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.username).toEqual(updateUserDto.username);
      expect(result).not.toHaveProperty('hashedPassword');

      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(repository.findByUsername).toHaveBeenCalledWith(
        updateUserDto.username,
      );
      expect(repository.update).toHaveBeenCalled();
    });

    it('should update user without checking username when username is not changed', async () => {
      const updateUserDto: UpdateUserDto = {
        username: userEntityMock.username,
      };

      jest.spyOn(repository, 'findByUserId').mockResolvedValue(userEntityMock);
      jest.spyOn(repository, 'update').mockResolvedValue(userEntityMock);

      const result = await service.update(updateUserDto, userId);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(repository.findByUsername).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw not found when user does not exist', async () => {
      const updateUserDto: UpdateUserDto = { username: 'newUsername' };

      jest.spyOn(repository, 'findByUserId').mockResolvedValue(null);

      await expect(service.update(updateUserDto, userId)).rejects.toThrow(
        UserNotFoundException,
      );

      await expect(service.update(updateUserDto, userId)).rejects.toMatchObject(
        {
          code: UserErrorCode.USER_NOT_FOUND,
          message: UserErrorMessages.USER_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        },
      );

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw conflict when new username is already taken', async () => {
      const updateUserDto: UpdateUserDto = { username: 'takenUsername' };
      const existingUser = new User({
        id: 'other-user-id',
        username: 'takenUsername',
      });

      jest.spyOn(repository, 'findByUserId').mockResolvedValue(userEntityMock);
      const findByUsernameMethodSpy = jest
        .spyOn(repository, 'findByUsername')
        .mockResolvedValue(existingUser);

      await expect(service.update(updateUserDto, userId)).rejects.toThrow(
        UsernameAlreadyExistsException,
      );

      await expect(service.update(updateUserDto, userId)).rejects.toMatchObject(
        {
          code: UserErrorCode.USERNAME_ALREADY_EXISTS,
          message: UserErrorMessages.USERNAME_ALREADY_EXISTS,
          status: HttpStatus.CONFLICT,
        },
      );

      expect(findByUsernameMethodSpy).toHaveBeenCalledWith(
        updateUserDto.username,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword (update user password)', () => {
    const userId = 'user-id-mock';

    beforeEach(() => {
      (compare as jest.Mock).mockResolvedValue(true);
      (hash as jest.Mock).mockResolvedValue('newHashedPassword');
    });

    it('should update password with success and return new tokens', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'currentPassword',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      jest.spyOn(repository, 'findByUserId').mockResolvedValue(userEntityMock);
      jest
        .spyOn(repository, 'updatePasswordAndRevokeTokens')
        .mockResolvedValue(undefined);
      jest.spyOn(authService, 'generateAuthTokens').mockResolvedValue({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });

      const result = await service.updatePassword(updatePasswordDto, userId);

      expect(result).toEqual({
        message: 'Senha redefinida com sucesso',
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });

      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(compare).toHaveBeenCalledWith(
        updatePasswordDto.currentPassword,
        userEntityMock.hashedPassword,
      );
      expect(repository.updatePasswordAndRevokeTokens).toHaveBeenCalledWith(
        userId,
        'newHashedPassword',
      );
      expect(authService.generateAuthTokens).toHaveBeenCalledWith(
        userId,
        userEntityMock.username,
      );
    });

    it('should throw not found when user does not exist', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'currentPassword',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      jest.spyOn(repository, 'findByUserId').mockResolvedValue(null);

      await expect(
        service.updatePassword(updatePasswordDto, userId),
      ).rejects.toThrow(UserNotFoundException);

      await expect(
        service.updatePassword(updatePasswordDto, userId),
      ).rejects.toMatchObject({
        code: UserErrorCode.USER_NOT_FOUND,
        message: UserErrorMessages.USER_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });

      expect(repository.updatePasswordAndRevokeTokens).not.toHaveBeenCalled();
    });

    it('should throw bad request when current password is invalid', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'wrongPassword',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      jest.spyOn(repository, 'findByUserId').mockResolvedValue(userEntityMock);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.updatePassword(updatePasswordDto, userId),
      ).rejects.toThrow(InvalidPasswordException);

      await expect(
        service.updatePassword(updatePasswordDto, userId),
      ).rejects.toMatchObject({
        code: UserErrorCode.INVALID_PASSWORD,
        message: UserErrorMessages.INVALID_PASSWORD,
        status: HttpStatus.BAD_REQUEST,
      });

      expect(repository.updatePasswordAndRevokeTokens).not.toHaveBeenCalled();
    });

    it('should throw bad request when password and confirmPassword do not match', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        currentPassword: 'currentPassword',
        password: 'newPassword',
        confirmPassword: 'differentPassword',
      };

      jest.spyOn(repository, 'findByUserId').mockResolvedValue(userEntityMock);

      await expect(
        service.updatePassword(updatePasswordDto, userId),
      ).rejects.toThrow(InvalidPasswordException);

      await expect(
        service.updatePassword(updatePasswordDto, userId),
      ).rejects.toMatchObject({
        code: UserErrorCode.INVALID_PASSWORD,
        message: UserErrorMessages.INVALID_PASSWORD,
        status: HttpStatus.BAD_REQUEST,
      });

      expect(repository.updatePasswordAndRevokeTokens).not.toHaveBeenCalled();
    });
  });
});
