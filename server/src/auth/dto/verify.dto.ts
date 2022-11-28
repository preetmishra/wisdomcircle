import { IsNotEmpty, IsString } from "class-validator";

export class VerifyDto {
  @IsString()
  @IsNotEmpty()
  emailVerificationCode: string;

  @IsString()
  @IsNotEmpty()
  phoneVerificationCode: string;
}
