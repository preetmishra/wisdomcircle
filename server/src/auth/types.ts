export type AuthPayload = {
  _id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
};

export type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
  payload: AuthPayload;
};
