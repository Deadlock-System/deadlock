import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto extends PickType(CreateUserDto, [
  'password',
  'confirmPassword',
] as const) {
  @IsString()
  @IsNotEmpty({ message: 'A senha atual não pode estar vazia' })
  readonly currentPassword: string;
}
