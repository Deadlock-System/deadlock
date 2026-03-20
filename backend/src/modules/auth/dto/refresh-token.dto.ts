import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {

    @IsString()
    @IsNotEmpty()
    readonly userId: string

    @IsString()
    @IsNotEmpty()
    readonly refreshToken: string
}