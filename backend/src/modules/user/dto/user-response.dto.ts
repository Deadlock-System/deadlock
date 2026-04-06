import { ApiProperty } from '@nestjs/swagger';
import { Seniority } from '../entities/enums/seniority.enum';
import { UserResponseDocs } from './user.swagger';

export class UserResponseDto {
  @ApiProperty(UserResponseDocs.id)
  id: string;

  @ApiProperty(UserResponseDocs.email)
  email: string | null;

  @ApiProperty(UserResponseDocs.username)
  username: string;

  @ApiProperty(UserResponseDocs.userPhoto)
  userPhoto: string | null;

  @ApiProperty(UserResponseDocs.seniorityId)
  seniorityId: Seniority;

  @ApiProperty(UserResponseDocs.createdAt)
  createdAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
