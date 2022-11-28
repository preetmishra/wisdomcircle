export type AuthUserPayload = {
  _id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
};

export type LoginRegisterResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
};
