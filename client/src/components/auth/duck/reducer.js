import {
  GET_ACCESS_TOKEN_FROM_REFRESH_TOKEN,
  LOGIN_USER,
  LOGOUT_USER,
} from "./types";

const INITIAL_STATE = {
  refreshToken: localStorage.getItem("refreshToken"),
  accessToken: null,
  user: null,
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOGIN_USER:
      return {
        ...action.payload,
      };

    case GET_ACCESS_TOKEN_FROM_REFRESH_TOKEN:
      return {
        ...state,
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
