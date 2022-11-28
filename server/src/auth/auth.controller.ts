import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  UseGuards,
  HttpCode,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { User } from "./decorators";
import { GetAccessTokenFromRefreshTokenDto } from "./dto/get-access-token-from-refresh-token.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyDto } from "./dto/verify.dto";
import {
  EmailAlreadyExists,
  EmailAndPhoneAlreadyExists,
  EmailIsNotRegistered,
  InvalidEmailVerificationCode,
  InvalidPhoneVerificationCode,
  InvalidRefreshToken,
  PasswordIsIncorrect,
  PhoneAlreadyExists,
  PhoneIsNotRegistered,
} from "./errors";
import { UnverifiedJWTAuth, VerifiedJWTAuth } from "./guards";
import {
  AccessTokenResponse,
  AuthUserPayload,
  LoginRegisterResponse,
} from "./types";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  async register(@Body() payload: RegisterDto): Promise<LoginRegisterResponse> {
    try {
      return await this.authService.register(payload);
    } catch (error) {
      if (
        error instanceof EmailAlreadyExists ||
        error instanceof PhoneAlreadyExists ||
        error instanceof EmailAndPhoneAlreadyExists
      ) {
        throw new BadRequestException(error.message);
      } else {
        throw error;
      }
    }
  }

  @Post("/login")
  @HttpCode(200)
  async login(@Body() payload: LoginDto): Promise<LoginRegisterResponse> {
    try {
      return await this.authService.login(payload);
    } catch (error) {
      if (
        error instanceof EmailIsNotRegistered ||
        error instanceof PhoneIsNotRegistered ||
        error instanceof PasswordIsIncorrect
      ) {
        throw new BadRequestException(error.message);
      } else {
        throw error;
      }
    }
  }

  @Post("/refresh")
  @HttpCode(200)
  async getAccessTokenFromRefreshToken(
    @Body() payload: GetAccessTokenFromRefreshTokenDto
  ): Promise<AccessTokenResponse> {
    try {
      return await this.authService.getAccessTokenFromRefreshToken(payload);
    } catch (error) {
      if (error instanceof InvalidRefreshToken) {
        throw new UnauthorizedException(error.message);
      } else {
        throw error;
      }
    }
  }

  @UseGuards(UnverifiedJWTAuth)
  @Post("/verify")
  @HttpCode(200)
  async verify(
    @Body() payload: VerifyDto,
    @User() user: AuthUserPayload
  ): Promise<LoginRegisterResponse> {
    try {
      return await this.authService.verify(payload, user._id);
    } catch (error) {
      if (
        error instanceof InvalidEmailVerificationCode ||
        error instanceof InvalidPhoneVerificationCode
      ) {
        throw new BadRequestException(error.message);
      } else {
        throw error;
      }
    }
  }

  @UseGuards(VerifiedJWTAuth)
  @Get("/verified")
  isVerified() {
    return { success: true };
  }

  @UseGuards(UnverifiedJWTAuth)
  @Get("/unverified")
  isUnverified() {
    return { success: true };
  }
}
