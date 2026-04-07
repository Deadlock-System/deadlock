import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { UpdatePasswordDocs } from './user.swagger';

export class UpdatePasswordDto extends PickType(CreateUserDto, [
  'password',
  'confirmPassword',
] as const) {
  @ApiProperty(UpdatePasswordDocs.currentPassword)
  @IsString()
  @IsNotEmpty({ message: 'A senha atual não pode estar vazia' })
  readonly currentPassword: string;
}
