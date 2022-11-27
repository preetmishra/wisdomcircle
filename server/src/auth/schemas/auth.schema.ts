import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AuthDocument = HydratedDocument<Auth>;

@Schema({ collection: "auth", timestamps: true })
export class Auth {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    index: true,
  })
  email: string;

  // Do not select password by default.
  @Prop({
    required: true,
    trim: true,
    select: false,
  })
  password: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
    index: true,
  })
  phone: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
