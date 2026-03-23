import { UserResponseDto } from '../dto/user-response.dto';
import { Seniority } from '../entities/enums/seniority.enum';
import { User } from '../entities/user.entity';
import { User as UserRaw } from '@prisma/client';

export class UserMapper {
  static toDomain(userRaw: UserRaw): User {
    return new User({
      id: userRaw.id,
      email: userRaw.email,
      username: userRaw.user_name,
      userPhoto: userRaw.user_photo,
      hashedPassword: userRaw.hashed_password,
      createdAt: userRaw.createdAt,
      seniorityId: userRaw.seniority_id as Seniority,
    });
  }

  static toPrisma(user: User): UserRaw {
    return {
      id: user.id,
      email: user.email,
      user_name: user.username,
      user_photo: user.userPhoto,
      hashed_password: user.hashedPassword,
      createdAt: user.createdAt,
      seniority_id: user.seniorityId,
    };
  }

  static toResponse(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      username: user.username,
      userPhoto: user.userPhoto,
      createdAt: user.createdAt,
      seniorityId: user.seniorityId,
    });
  }
}
