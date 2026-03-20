import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';
import { hash } from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto';
import { EmailAlreadyExistsException, InvalidPasswordException, UsernameAlreadyExistsException } from './exceptions/user.exceptions';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {}

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

    return new UserResponseDto({
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      userPhoto: createdUser.userPhoto,
      seniorityId: createdUser.seniorityId,
      createdAt: createdUser.createdAt,
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
