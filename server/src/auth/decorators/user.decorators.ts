import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUserPayload } from "../types";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
