import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  UseGuards,
  HttpCode,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import {
  EmailAlreadyExists,
  EmailAndPhoneAlreadyExists,
  EmailIsNotRegistered,
  PasswordIsIncorrect,
  PhoneAlreadyExists,
  PhoneIsNotRegistered,
} from "./errors";
import { UnverifiedJWTAuth, VerifiedJWTAuth } from "./guards";
import { LoginRegisterResponse } from "./types";

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
