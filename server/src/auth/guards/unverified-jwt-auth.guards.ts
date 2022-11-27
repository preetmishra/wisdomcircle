import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UnverifiedJWTAuth implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const { authorization } = request.headers;

      if (!authorization) {
        throw new Error("Authorization header is missing");
      }

      const tokens = authorization.split(" ");

      if (tokens.length !== 2) {
        throw new Error("Token is invalid");
      }

      const [scheme, token] = tokens;

      if (scheme !== "Bearer") {
        throw new Error("Bearer token is missing");
      }

      const user = await this.authService.verifyToken(token);

      if (user["token"] !== "access") {
        throw new Error("Access token is invalid");
      }

      request.user = user;
      Logger.verbose(`Successfully authenticated <User _id: ${user._id}>`);
      return true;
    } catch (e) {
      Logger.error(
        `Could verify the JWT due to the following reason: ${e.message}`
      );
      throw new UnauthorizedException(e.message);
    }
  }
}
