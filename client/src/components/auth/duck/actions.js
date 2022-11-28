import {
  GET_ACCESS_TOKEN_FROM_REFRESH_TOKEN,
  LOGIN_USER,
  LOGOUT_USER,
} from "./types";

export function loginUser(payload) {
  localStorage.setItem("refreshToken", payload.refreshToken);
  return { type: LOGIN_USER, payload };
}

export function logoutUser() {
  localStorage.removeItem("refreshToken");
  return { type: LOGOUT_USER };
}

export function getAccessTokenFromRefreshToken(payload) {
  return { type: GET_ACCESS_TOKEN_FROM_REFRESH_TOKEN, payload };
}
