import { LOGIN_USER, LOGOUT_USER } from "./types";

const INITIAL_STATE = {
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: JSON.parse(localStorage.getItem("user") || null),
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOGIN_USER:
      return {
        ...action.payload,
      };

    case LOGOUT_USER:
      return {
        accessToken: null,
        refreshToken: null,
        user: null,
      };

    default:
      return state;
  }
};

export default reducer;
