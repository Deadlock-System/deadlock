import { ApiPropertyOptions } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { UpdatePasswordDto } from './update-password.dto';
import { UserResponseDto } from './user-response.dto';
import { Seniority } from '../entities/enums/seniority.enum';

export const CreateUserDocs: Record<keyof CreateUserDto, ApiPropertyOptions> = {
  email: {
    description: 'E-mail do usuário.',
    example: 'user@example.com',
  },
  username: {
    description: 'Nome de usuário único.',
    example: 'userABC',
  },
  userPhoto: {
    description: 'URL da foto de perfil.',
    example: 'https://blobBucket.com/user_photo/id.jpg',
    required: false,
  },
  seniorityId: {
    description: 'Nível de senioridade do usuário.',
    example: 'JUNIOR',
    enum: Seniority,
    required: false,
  },
  password: {
    description:
      'Senha do usuário. Deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.',
    example: 'SenhaForte@123',
  },
  confirmPassword: {
    description: 'Confirmação da senha. Deve ser igual ao campo password.',
    example: 'SenhaForte@123',
  },
};

export const UpdatePasswordDocs: Record<
  Exclude<keyof UpdatePasswordDto, keyof CreateUserDto>,
  ApiPropertyOptions
> = {
  currentPassword: {
    description: 'Senha atual do usuário.',
    example: 'SenhaAntiga@123',
  },
};

export const UserResponseDocs: Record<
  keyof UserResponseDto,
  ApiPropertyOptions
> = {
  id: { example: '123e4567-e89b-12d3-a456-426614174000' },
  email: {
    description: 'E-mail do usuário.',
    example: 'user@example.com',
    nullable: true,
  },
  username: { example: 'userABC' },
  userPhoto: {
    example: 'https://blobBucket.com/user_photo/id.jpg',
    nullable: true,
  },
  seniorityId: { example: 'JUNIOR', enum: Seniority },
  createdAt: { example: '2026-04-02T10:00:00Z' },
};
