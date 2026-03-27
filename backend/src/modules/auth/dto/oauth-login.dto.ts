import { ProviderType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class OAuthLoginDto {
  @IsString()
  @IsNotEmpty()
  readonly providerId: string;

  @IsEmail()
  @IsOptional()
  readonly providerEmail?: string;

  @IsString()
  @IsOptional()
  readonly providerUsername?: string;

  @IsString()
  @IsOptional()
  readonly providerAvatar?: string;

  @IsEnum(ProviderType)
  @IsNotEmpty()
  readonly providerType: ProviderType;
}
