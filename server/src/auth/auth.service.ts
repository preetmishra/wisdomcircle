import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { compare, hash } from "bcrypt";
import { Model } from "mongoose";

import { RegisterDto } from "./dto/register.dto";
import {
  EmailAlreadyExists,
  EmailAndPhoneAlreadyExists,
  PhoneAlreadyExists,
} from "./errors";
import { Auth, AuthDocument } from "./schemas/auth.schema";
import { RegisterResponse, AuthPayload } from "./types";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  ACCESS_TOKEN_EXPIRATION_TIME = "120s";
  REFRESH_TOKEN_EXPIRATION_TIME = "7d";

  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private readonly jwtService: JwtService
  ) {}

  private async findOne(filter: Record<string, any>): Promise<AuthDocument> {
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

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  private getAuthPayload(authDocument: AuthDocument): AuthPayload {
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
      ...this.getAuthPayload(authDocument),
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

  async register(payload: RegisterDto): Promise<RegisterResponse> {
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
      payload: this.getAuthPayload(authDocument),
    };
  }
}
