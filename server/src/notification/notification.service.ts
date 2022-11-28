import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TwilioService } from "nestjs-twilio";
import * as SendGrid from "@sendgrid/mail";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly TWILIO_PHONE_NUMBER: string;
  private readonly SENDGRID_EMAIL: string;

  constructor(
    private readonly twilioService: TwilioService,
    configService: ConfigService
  ) {
    SendGrid.setApiKey(configService.get("sendGrid")["apiKey"]);

    this.TWILIO_PHONE_NUMBER = configService.get("twilio")["phoneNumber"];
    this.SENDGRID_EMAIL = configService.get("sendGrid")["email"];
  }

  async sendSMS(body: string, to: string) {
    try {
      const response = await this.twilioService.client.messages.create({
        body: body,
        from: this.TWILIO_PHONE_NUMBER,
        to: to,
      });

      this.logger.verbose(`Sent a message <to: ${to}, body: ${body}>`);

      return response;
    } catch (error) {
      this.logger.error(`Could not send a message <to: ${to}, body: ${body}>`);
      console.error(error);
    }
  }

  async sendEmail(payload: { to: string; subject: string; text: string }) {
    const mail: SendGrid.MailDataRequired = {
      from: this.SENDGRID_EMAIL,
      ...payload,
    };

    try {
      const response = await SendGrid.send(mail);

      this.logger.verbose(
        `Sent an email <to: ${payload.to}, subject: ${payload.subject}, text: ${payload.text}>`
      );

      return response;
    } catch (error) {
      this.logger.error(
        `Could not send an email <to: ${payload.to}, subject: ${payload.subject}, text: ${payload.text}>`
      );
      console.error(error);
    }
  }
}
