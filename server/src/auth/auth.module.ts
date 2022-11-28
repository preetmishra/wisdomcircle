import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Auth, AuthSchema } from "./schemas/auth.schema";
import { NotificationModule } from "src/notification/notification.module";
import { InviteModule } from "src/invite/invite.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("jwtSecret"),
      }),
      inject: [ConfigService],
    }),
    NotificationModule,
    InviteModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
