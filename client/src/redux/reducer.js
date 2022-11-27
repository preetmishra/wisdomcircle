import { combineReducers } from "redux";
import authReducer from "../components/auth/duck/reducer";

const reducer = combineReducers({
  auth: authReducer,
});

export default reducer;
