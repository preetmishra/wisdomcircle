import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  UseGuards,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import {
  EmailAlreadyExists,
  EmailAndPhoneAlreadyExists,
  PhoneAlreadyExists,
} from "./errors";
import { UnverifiedJWTAuth, VerifiedJWTAuth } from "./guards";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  async register(@Body() payload: RegisterDto) {
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
