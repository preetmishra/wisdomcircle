import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import App from "./App";
import store from "./redux/store";
import {
  AuthenticationContext,
  VerificationContext,
} from "./components/auth/contexts";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <AuthenticationContext>
        <VerificationContext>
          <App />
        </VerificationContext>
      </AuthenticationContext>
    </React.StrictMode>
  </Provider>
);
