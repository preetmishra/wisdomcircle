import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuid } from "uuid";

import { CreateInviteDto } from "./dto/create-invite.dto";
import { Invite, InviteDocument } from "./schemas/invite.schema";

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    @InjectModel(Invite.name) private inviteModel: Model<InviteDocument>
  ) {}

  async findOne(filter: Record<string, any> = {}): Promise<InviteDocument> {
    return await this.inviteModel.findOne(filter);
  }

  async deleteOne(filter: Record<string, any> = {}) {
    await this.inviteModel.deleteOne(filter);
  }

  async getOrCreate(payload: CreateInviteDto): Promise<InviteDocument> {
    payload["code"] = uuid();

    try {
      return await this.inviteModel.findOneAndUpdate(
        {
          namespace: payload.namespace,
          entityId: payload.entityId,
          expiresAt: { $gte: new Date() },
        },
        { $setOnInsert: payload },
        { upsert: true, new: true }
      );
    } catch (error) {
      this.logger.error("Could not generate an invite");
      console.error(error);
    }
  }

  async validate(namespace: number, entityId: string, code: string) {
    return await this.findOne({
      namespace,
      entityId,
      code,
      expiresAt: { $gte: new Date() },
    });
  }

  async purge(
    namespace: number,
    entityId: string,
    code: string,
    expiresAt: Date
  ) {
    await this.deleteOne({ namespace, entityId, code, expiresAt });
  }
}
