export type AuthUserPayload = {
  _id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  token?: string;
};

export type AccessTokenResponse = {
  accessToken: string;
  user: AuthUserPayload;
};

export type LoginRegisterResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
};

export type VerificationNotificationResponse = {
  success: boolean;
};
