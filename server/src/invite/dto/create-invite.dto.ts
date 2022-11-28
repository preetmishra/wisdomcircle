import { InviteNamespace } from "../constants";

export class CreateInviteDto {
  namespace: InviteNamespace;
  entityId: string;
  expiresAt: Date;
}
