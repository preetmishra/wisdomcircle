export default (): {
  port: number;
  mongoDBUri: string;
  jwtSecret: string;
  twilio: {
    authToken: string;
    accountSID: string;
    phoneNumber: string;
  };
  sendGrid: {
    apiKey: string;
    email: string;
  };
} => ({
  port: parseInt(process.env.API_SERVER_PORT, 10) || 3000,
  mongoDBUri: process.env.API_MONGODB_URI,
  jwtSecret: process.env.API_JWT_SECRET,
  twilio: {
    authToken: process.env.API_TWILIO_AUTH_TOKEN,
    accountSID: process.env.API_TWILIO_ACCOUNT_SID,
    phoneNumber: process.env.API_TWILIO_PHONE_NUMBER,
  },
  sendGrid: {
    apiKey: process.env.API_SENDGRID_API_KEY,
    email: process.env.API_SENDGRID_SENDER_EMAIL,
  },
});
