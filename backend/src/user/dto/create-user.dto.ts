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

export class CreateUserDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString({ message: 'O nome de usuário deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome de usuário não pode estar vazio' })
  username: string;

  @IsUrl({}, { message: 'A URL da foto de perfil deve ser válida' })
  @IsOptional()
  userPhoto?: string;

  @IsEnum(Seniority, { message: 'Senioridade inválida' })
  @IsOptional()
  seniorityId?: Seniority;

  @IsStrongPassword(
    {},
    {
      message:
        'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    },
  )
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  password: string;

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
