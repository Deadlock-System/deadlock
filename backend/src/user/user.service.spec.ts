import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let userEntityMock: User;
  let createUserDtoMock: CreateUserDto;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();

    userEntityMock = new User({
      email: 'email@email.com',
      username: 'usernameMock',
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
        ConflictException,
      );

      await expect(service.create(createUserDtoMock)).rejects.toThrow(
        'Esse e-mail já está em uso',
      );

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
        ConflictException,
      );

      await expect(service.create(createUserDtoMock)).rejects.toThrow(
        'Esse nome de usuário já está em uso',
      );

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
        BadRequestException,
      );

      await expect(service.create(createUserDtoMock)).rejects.toThrow(
        'As senhas não conferem',
      );

      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
