import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { InviteNamespace } from "../constants";

export type InviteDocument = HydratedDocument<Invite>;

@Schema({ timestamps: true })
export class Invite {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: Object.values(InviteNamespace) })
  namespace: number;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
InviteSchema.index(
  { code: 1, namespace: 1, entityId: 1, expiresAt: 1 },
  { unique: true }
);
InviteSchema.index(
  { namespace: 1, entityId: 1, expiresAt: 1 },
  { unique: true }
);
