import { IsNotEmpty, IsString } from "class-validator";

export class GetAccessTokenFromRefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
