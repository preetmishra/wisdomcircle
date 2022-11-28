import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare, hash } from "bcrypt";
import { Model } from "mongoose";
import { InviteNamespace } from "src/invite/constants";
import { InviteService } from "src/invite/invite.service";
import { NotificationService } from "src/notification/notification.service";
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
import { Auth, AuthDocument } from "./schemas/auth.schema";
import {
  AccessTokenResponse,
  AuthUserPayload,
  LoginRegisterResponse,
} from "./types";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  ACCESS_TOKEN_EXPIRATION_TIME = "1d";
  REFRESH_TOKEN_EXPIRATION_TIME = "7d";

  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private readonly notificationService: NotificationService,
    private readonly inviteService: InviteService,
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

  private async update(
    filter = {},
    payload: Record<string, any>
  ): Promise<AuthDocument> {
    return await this.authModel.findOneAndUpdate(filter, payload, {
      new: true,
    });
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

  private getExpiryTime(): Date {
    const expiryDays = 3;
    const aDayInMs = 24 * 60 * 60 * 1000;
    return new Date(new Date().getTime() + expiryDays * aDayInMs);
  }

  private async sendVerificationSMS(authDocument: AuthDocument) {
    const invite = await this.inviteService.getOrCreate({
      namespace: InviteNamespace.VERIFY_PHONE,
      entityId: authDocument._id.toString(),
      expiresAt: this.getExpiryTime(),
    });

    this.logger.verbose(
      `Generated a verification SMS invitation <_id: ${invite._id}> for user <_id: ${authDocument._id}>`
    );
  }

  private async sendVerificationEmail(authDocument: AuthDocument) {
    const invite = await this.inviteService.getOrCreate({
      namespace: InviteNamespace.VERIFY_EMAIL,
      entityId: authDocument._id.toString(),
      expiresAt: this.getExpiryTime(),
    });

    this.logger.verbose(
      `Generated a verification email invitation <_id: ${invite._id}> for user <_id: ${authDocument._id}>`
    );
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  async postRegistrationHook(authDocument: AuthDocument) {
    await this.sendVerificationEmail(authDocument);
    await this.sendVerificationSMS(authDocument);
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

    const response = {
      accessToken: this.generateAccessToken(authDocument),
      refreshToken: this.generateRefreshToken(authDocument),
      user: this.getAuthUserPayload(authDocument),
    };

    await this.postRegistrationHook(authDocument);

    return response;
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

  async getAccessTokenFromRefreshToken(
    payload: GetAccessTokenFromRefreshTokenDto
  ): Promise<AccessTokenResponse> {
    try {
      this.logger.verbose(
        `Attempting to get accessToken from <token: ${payload.refreshToken}>`
      );

      this.logger.verbose("Verifying refreshToken with the secret");

      const tokenPayload = await this.verifyToken(payload.refreshToken);

      if (tokenPayload.token !== "refresh") {
        this.logger.error("Refresh token is invalid");
        throw new InvalidRefreshToken("Refresh token is invalid");
      }

      this.logger.verbose("Refresh token has been verified successfully");

      this.logger.verbose("Attempting to fetch associated user");
      const authDocument = await this.findOne({ _id: tokenPayload._id });

      if (!authDocument) {
        this.logger.error(
          `Could not find an associated user for the token <token: ${payload.refreshToken}>`
        );
        throw new InvalidRefreshToken(
          "Could not find an associated user for the token"
        );
      }

      this.logger.verbose(
        `Found an associated user <_id: ${authDocument._id}>`
      );
      this.logger.verbose("Provisioning an accessToken");

      return {
        accessToken: this.generateAccessToken(authDocument),
        user: this.getAuthUserPayload(authDocument),
      };
    } catch (error) {
      this.logger.error(
        `Could verify the JWT due to the following reason: ${error.message}`
      );
      throw error;
    }
  }

  async verify(
    payload: VerifyDto,
    userId: string
  ): Promise<LoginRegisterResponse> {
    const { emailVerificationCode, phoneVerificationCode } = payload;

    this.logger.verbose(`Attempting to verify user <_id: ${userId}>`);

    this.logger.verbose(
      `Verifying email with <code: ${emailVerificationCode}>`
    );

    const emailInviteDocument = await this.inviteService.validate(
      InviteNamespace.VERIFY_EMAIL,
      userId,
      emailVerificationCode
    );

    if (!emailInviteDocument) {
      this.logger.error("Email verification code is either invalid or expired");
      throw new InvalidEmailVerificationCode(
        "Email verification code is either invalid or expired"
      );
    }

    this.logger.verbose(
      `Verifying phone with <code: ${phoneVerificationCode}>`
    );

    const phoneInviteDocument = await this.inviteService.validate(
      InviteNamespace.VERIFY_PHONE,
      userId,
      phoneVerificationCode
    );

    if (!phoneInviteDocument) {
      this.logger.error("Phone verification code is either invalid or expired");
      throw new InvalidPhoneVerificationCode(
        "Phone verification code is either invalid or expired"
      );
    }

    this.logger.verbose(
      "Email and phone are valid. Marking them valid in the auth document"
    );

    const authDocument = await this.update(
      { _id: userId },
      { isEmailVerified: true, isPhoneVerified: true }
    );

    this.logger.verbose("Marked email and phone valid successfully");

    this.logger.verbose(
      "Purging email and phone verification invite documents"
    );

    await this.inviteService.purge(
      InviteNamespace.VERIFY_EMAIL,
      emailInviteDocument.entityId,
      emailInviteDocument.code,
      emailInviteDocument.expiresAt
    );
    await this.inviteService.purge(
      InviteNamespace.VERIFY_PHONE,
      phoneInviteDocument.entityId,
      phoneInviteDocument.code,
      phoneInviteDocument.expiresAt
    );

    this.logger.verbose("Purged successfully");

    return {
      accessToken: this.generateAccessToken(authDocument),
      refreshToken: this.generateRefreshToken(authDocument),
      user: this.getAuthUserPayload(authDocument),
    };
  }
}
