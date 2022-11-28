export function isLoggedIn(state) {
  const auth = state.auth;

  if (auth.accessToken && auth.refreshToken) {
    return true;
  }

  return false;
}

export function isVerified(state) {
  const user = state.auth.user;

  if (!user) {
    return false;
  }

  return user.isEmailVerified && user.isPhoneVerified;
}
