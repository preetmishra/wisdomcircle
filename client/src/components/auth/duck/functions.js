export function isLoggedIn(state) {
  const auth = state.auth;

  if (auth.accessToken && auth.refreshToken) {
    return true;
  }

  return false;
}
