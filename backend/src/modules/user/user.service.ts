import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  EmailAlreadyExistsException,
  InvalidPasswordException,
  UsernameAlreadyExistsException,
  UserNotFoundException,
} from './exceptions/user.exceptions';
import { UserRepository } from './repository/user.repository';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthService } from '../auth/auth.service';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const duplicatedEmail = await this.repository.findByEmail(
      createUserDto.email,
    );

    if (duplicatedEmail) {
      throw new EmailAlreadyExistsException();
    }

    const duplicatedUsername = await this.repository.findByUsername(
      createUserDto.username,
    );

    if (duplicatedUsername) {
      throw new UsernameAlreadyExistsException();
    }

    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new InvalidPasswordException();
    }

    const user = new User({
      email: createUserDto.email,
      username: createUserDto.username,
      userPhoto: createUserDto.userPhoto,
      hashedPassword: await hash(createUserDto.password, 10),
      seniorityId: createUserDto.seniorityId,
    });

    const createdUser = await this.repository.create(user);

    return UserMapper.toResponse(createdUser);
  }

  findAll() {
    return `This action returns all user`;
  }

  async findByUserId(userId: string) {
    const userData = await this.repository.findByUserId(userId);

    if (!userData) {
      throw new UserNotFoundException();
    }

    return UserMapper.toResponse(userData);
  }

  async update(updateUserDto: UpdateUserDto, userId: string) {
    const userData = await this.repository.findByUserId(userId);

    if (!userData) {
      throw new UserNotFoundException();
    }

    if (
      updateUserDto.username &&
      userData.username !== updateUserDto.username
    ) {
      const duplicatedUsername = await this.repository.findByUsername(
        updateUserDto.username,
      );

      if (duplicatedUsername) {
        throw new UsernameAlreadyExistsException();
      }
    }

    const updateUserData = {
      ...userData,
      ...updateUserDto,
    };

    const updatedUser = await this.repository.update(updateUserData);

    return UserMapper.toResponse(updatedUser);
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto, userId: string) {
    const userData = await this.repository.findByUserId(userId);

    if (!userData) {
      throw new UserNotFoundException();
    }

    const isCurrentPasswordValid = await compare(
      updatePasswordDto.currentPassword,
      userData.hashedPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new InvalidPasswordException();
    }

    if (updatePasswordDto.password !== updatePasswordDto.confirmPassword) {
      throw new InvalidPasswordException();
    }

    const hashedNewPassword = await hash(updatePasswordDto.password, 10);

    await this.repository.updatePasswordAndRevokeTokens(
      userId,
      hashedNewPassword,
    );

    const { accessToken, refreshToken } =
      await this.authService.generateAuthTokens(userId, userData.username);

    return {
      message: 'Senha redefinida com sucesso',
      accessToken,
      refreshToken,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
