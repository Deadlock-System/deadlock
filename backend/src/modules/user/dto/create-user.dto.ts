import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';
import { Seniority } from '../entities/enums/seniority.enum';
import { CreateUserDocs } from './user.swagger';

export class CreateUserDto {
  @ApiProperty(CreateUserDocs.email)
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty(CreateUserDocs.username)
  @IsString({ message: 'O nome de usuário deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome de usuário não pode estar vazio' })
  username: string;

  @ApiProperty(CreateUserDocs.userPhoto)
  @IsUrl({}, { message: 'A URL da foto de perfil deve ser válida' })
  @IsOptional()
  userPhoto?: string;

  @ApiProperty(CreateUserDocs.seniorityId)
  @IsEnum(Seniority, { message: 'Senioridade inválida' })
  @IsOptional()
  seniorityId?: Seniority;

  @ApiProperty(CreateUserDocs.password)
  @IsStrongPassword(
    {},
    {
      message:
        'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    },
  )
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  password: string;

  @ApiProperty(CreateUserDocs.confirmPassword)
  @IsStrongPassword(
    {},
    {
      message:
        'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    },
  )
  @IsNotEmpty({ message: 'A confirmação de senha não pode estar vazia' })
  confirmPassword: string;
}
