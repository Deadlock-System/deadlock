import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'E-mail do usuário.',
    example: 'user@example.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'Senha do usuário.',
    example: 'minhaSenhaSegura123',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
