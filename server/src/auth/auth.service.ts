import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare, hash } from "bcrypt";
import { Model } from "mongoose";
import { NotificationService } from "src/notification/notification.service";
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
import { Auth, AuthDocument } from "./schemas/auth.schema";
import { AuthUserPayload, LoginRegisterResponse } from "./types";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  ACCESS_TOKEN_EXPIRATION_TIME = "120s";
  REFRESH_TOKEN_EXPIRATION_TIME = "7d";

  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private readonly notificationService: NotificationService,
    private readonly jwtService: JwtService
  ) {}

  private async findOne(
    filter: Record<string, any>,
    select: string | null = null
  ): Promise<AuthDocument> {
    if (select) {
      return await this.authModel.findOne(filter).select(select);
    }

    return await this.authModel.findOne(filter);
  }

  private async create(payload: RegisterDto): Promise<AuthDocument> {
    return await this.authModel.create(payload);
  }

  /**
   * Generates the hash for a given plain text using bcrypt.
   */
  private async generateHash(plainText: string, saltRounds = 10) {
    return await hash(plainText, saltRounds);
  }

  /**
   * Verifies whether the hash matches with the given plain text.
   */
  private async verifyHash(plainText: string, hash: string) {
    return await compare(plainText, hash);
  }

  private getAuthUserPayload(authDocument: AuthDocument): AuthUserPayload {
    return {
      _id: authDocument._id.toString(),
      email: authDocument.email,
      phone: authDocument.phone,
      firstName: authDocument.firstName,
      lastName: authDocument.lastName,
      isPhoneVerified: authDocument.isPhoneVerified,
      isEmailVerified: authDocument.isEmailVerified,
    };
  }

  private generateAccessToken(authDocument: AuthDocument): string {
    const payload = {
      ...this.getAuthUserPayload(authDocument),
      token: "access",
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRATION_TIME,
    });
  }

  private generateRefreshToken(authDocument: AuthDocument): string {
    return this.jwtService.sign(
      { _id: authDocument._id, token: "refresh" },
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRATION_TIME,
      }
    );
  }

  /**
   * Checks if email or phone already exists. If not, returns null.
   * Otherwise, throws an error.
   */
  private async checkIfEmailOrPhoneAlreadyRegistered(
    email: string,
    phone: string
  ): Promise<null> {
    const exists = await this.findOne({
      $or: [{ email }, { phone }],
    });

    if (!exists) {
      return null;
    }

    if (exists.email === email && exists.phone === phone) {
      this.logger.error("Email and phone already exists");
      throw new EmailAndPhoneAlreadyExists("Email and phone already exists");
    } else if (exists.email === email) {
      this.logger.error("Email already exists");
      throw new EmailAlreadyExists("Email already exists");
    } else {
      this.logger.error("Phone already exists");
      throw new PhoneAlreadyExists("Phone already exists");
    }
  }

  private checkIfEmailOrPhone(emailOrPhone: string) {
    const hasAnyLetter = (emailOrPhone: string): boolean => {
      const regEx = /[a-zA-Z]/g;
      return regEx.test(emailOrPhone);
    };

    const response = {
      isEmail: false,
      isPhone: false,
    };

    if (hasAnyLetter(emailOrPhone)) {
      this.logger.verbose(
        "emailOrPhone has an alphabet. Considering it as an email"
      );

      response.isEmail = true;
    } else {
      this.logger.verbose(
        "emailOrPhone does not have an alphabet. Falling back to considering it as a phone"
      );

      response.isPhone = true;
    }

    return response;
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  async register(payload: RegisterDto): Promise<LoginRegisterResponse> {
    const { email, phone, password, firstName, lastName } = payload;

    this.logger.verbose(
      `Attempting to register the user <email: ${email}, phone: ${phone}>`
    );

    this.logger.verbose("Checking whether email or phone already exists");
    await this.checkIfEmailOrPhoneAlreadyRegistered(email, phone);
    this.logger.verbose("Email and phone doesn't exist. Registering the user");

    this.logger.verbose("Hashing the password");
    const hashedPassword = await this.generateHash(password);

    const authDocument = await this.create({
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
    });

    this.logger.verbose(
      `Registered the user <_id: ${authDocument._id}> successfully with phone and email in an unverified state`
    );

    return {
      accessToken: this.generateAccessToken(authDocument),
      refreshToken: this.generateRefreshToken(authDocument),
      user: this.getAuthUserPayload(authDocument),
    };
  }

  async login(payload: LoginDto): Promise<LoginRegisterResponse> {
    const { emailOrPhone, password } = payload;

    this.logger.verbose(
      `Attempting to login the user <emailOrPhone: ${emailOrPhone}, password: ${password}>`
    );

    this.logger.verbose("Checking whether we have an email or a phone");
    const isEmailOrPhone = this.checkIfEmailOrPhone(emailOrPhone);

    this.logger.verbose("Attempting to find an existing user");

    const authDocument = await this.findOne(
      {
        ...(isEmailOrPhone.isEmail && { email: emailOrPhone }),
        ...(isEmailOrPhone.isPhone && { phone: emailOrPhone }),
      },
      "+password"
    );

    if (!authDocument) {
      this.logger.error(
        `Could not find a user with <emailOrPhone: ${emailOrPhone}>`
      );

      if (isEmailOrPhone.isEmail) {
        throw new EmailIsNotRegistered(
          "Could not login. Email is not registered"
        );
      } else {
        throw new PhoneIsNotRegistered(
          "Could not login. Phone is not registered"
        );
      }
    }

    this.logger.verbose(
      `Found an association between <emailOrPhone: ${emailOrPhone}> and a user <_id: ${authDocument._id}>`
    );

    this.logger.verbose("Verifying whether the password is correct");
    const isPasswordCorrect = await this.verifyHash(
      password,
      authDocument.password
    );

    if (!isPasswordCorrect) {
      this.logger.error("Password is incorrect");
      throw new PasswordIsIncorrect("Could not login. Password is incorrect");
    }
    this.logger.verbose("Password is correct");

    this.logger.verbose(
      `Logged the user <_id: ${authDocument._id} in successfully`
    );

    return {
      accessToken: this.generateAccessToken(authDocument),
      refreshToken: this.generateRefreshToken(authDocument),
      user: this.getAuthUserPayload(authDocument),
    };
  }
}
