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
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <AuthenticationContext>
        <Router>
          <Routes>
            <Route
              path="*"
              element={
                <VerificationContext>
                  <App />
                </VerificationContext>
              }
            ></Route>
          </Routes>
        </Router>
      </AuthenticationContext>
    </React.StrictMode>
  </Provider>
);
