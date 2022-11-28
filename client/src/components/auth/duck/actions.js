import { LOGIN_USER, LOGOUT_USER } from "./types";

export function loginUser(payload) {
  localStorage.setItem("accessToken", payload.accessToken);
  localStorage.setItem("refreshToken", payload.refreshToken);
  localStorage.setItem("user", JSON.stringify(payload.user));

  return { type: LOGIN_USER, payload };
}

export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  return { type: LOGOUT_USER };
}
