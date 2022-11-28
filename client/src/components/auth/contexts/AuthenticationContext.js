import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API_URI } from "../../../common/constants";
import { getAccessTokenFromRefreshToken } from "../duck/actions";

export function AuthenticationContext({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const refreshToken = useSelector((state) => state.auth.refreshToken);
  const isInitialMount = useRef(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isInitialMount.current) {
      return;
    }

    if (!refreshToken) {
      setIsLoading(false);
      console.debug("Did not find any refresh token. Consider logged out");
      return;
    }

    axios
      .post(`${API_URI}/auth/refresh`, {
        refreshToken: refreshToken,
      })
      .then((res) => res.data)
      .then((data) => {
        dispatch(getAccessTokenFromRefreshToken(data));
        console.debug("Got accessToken from refreshToken. Logging in");
      })
      .catch((err) => {
        console.debug(
          "Could not fetch accessToken from refreshToken. Consider logged out"
        );
      })
      .finally(() => setIsLoading(false));
  }, [refreshToken, dispatch]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-4xl animate-pulse text-neutral-grey">...</p>
      </div>
    );
  }

  return children;
}
