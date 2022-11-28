import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TwilioModule } from "nestjs-twilio";
import { NotificationService } from "./notification.service";

@Module({
  imports: [
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const twilio = configService.get("twilio");
        return {
          accountSid: twilio.accountSID,
          authToken: twilio.authToken,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
