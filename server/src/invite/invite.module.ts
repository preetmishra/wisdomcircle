import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { InviteService } from "./invite.service";
import { Invite, InviteSchema } from "./schemas/invite.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]),
  ],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
