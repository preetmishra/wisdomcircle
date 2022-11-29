import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

import { API_URI } from "../../../common/constants";
import {
  ERROR_CODE_AUTH_VERIFY_1,
  ERROR_CODE_AUTH_VERIFY_2,
} from "../../../common/errors";
import LogoWithType from "../../assets/LogoWithType";
import Button from "../../lib/Button";
import Input from "../../lib/Input";
import { loginUser, logoutUser } from "../duck/actions";
import { isLoggedIn, isVerified } from "../duck/functions";
import VerificationNotificationModal from "../VerificationNotificationModal";
import WelcomeScreen from "../WelcomeScreen";

const getGreeting = (state) => {
  const firstName = state.auth.user?.firstName;

  if (firstName) {
    return `Hi, ${firstName}`;
  }

  return "Hi";
};

const verificationSchema = yup
  .object({
    emailVerificationCode: yup.string().required("Please enter a valid code"),
    phoneVerificationCode: yup.string().required("Please enter a valid code"),
  })
  .required();

export function VerificationContext({ children }) {
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(verificationSchema),
  });

  const dispatch = useDispatch();
  const greeting = useSelector(getGreeting);
  const _isLoggedIn = useSelector(isLoggedIn);
  const _isVerified = useSelector(isVerified);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [showVerificationNotification, setVerificationNotification] =
    useState(true);
  const [hasSentVerification, setHasSentVerification] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const navigate = useNavigate();

  // If not logged in or already verified, let them access the application.
  if (!_isLoggedIn || _isVerified) {
    return children;
  }

  const handleOnSubmit = (payload) => {
    setApiError(true);

    axios
      .post(`${API_URI}/auth/verify`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => res.data)
      .then((data) => {
        dispatch(loginUser(data));
        navigate("/");
      })
      .catch((error) => {
        const code = error.response.data.code;

        if (code && code === ERROR_CODE_AUTH_VERIFY_1) {
          setError("emailVerificationCode", {
            type: "API",
            message:
              "Sorry! The email verification code is either invalid or expired.",
          });
        } else if (code && code === ERROR_CODE_AUTH_VERIFY_2) {
          setError("phoneVerificationCode", {
            type: "API",
            message:
              "Sorry! The phone verification code is either invalid or expired.",
          });
        } else {
          setApiError(
            "An unexpected error has occurred. Please try again later."
          );
          // Hide the error automatically.
          setTimeout(() => setApiError(null), 3000);
        }
      });
  };

  const handleResendVerificationNotification = () => {
    axios
      .get(`${API_URI}/auth/verify/notify`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => res.data)
      .then((data) => {
        if (data.success) {
          setHasSentVerification(true);
          // Allow re-sending after 60 seconds.
          setTimeout(() => {
            setHasSentVerification(false);
          }, 60000);
        } else {
          throw new Error("Couldn't send verification notifications");
        }
      })
      .catch((error) => {
        console.error(error);
        setApiError(
          "Could not send verification email and SMS. An unexpected error has occurred. Please try again later."
        );
        // Hide the error automatically.
        setTimeout(() => setApiError(null), 3000);
      })
      .finally(() => {
        setIsApiLoading(false);
      });
  };

  return (
    <div className="h-full flex flex-row w-full">
      <WelcomeScreen />
      <div className="h-full bg-white basis-full md:basis-3/5 flex flex-col items-center justify-between md:justify-center">
        <div className="w-full h-full md:w-4/5 lg:w-3/5 xl:w-1/2 px-5 py-8 md:py-0 sm:px-8 md:px-0 flex flex-col justify-between md:justify-center">
          <div className="space-y-6">
            <header className="space-y-10">
              <div className="w-full flex md:hidden items-center justify-center">
                <LogoWithType className="w-1/2" />
              </div>
              <div className="space-y-1">
                <h1 className="font-bold text-xl md:text-2xl text-neutral-black">
                  {greeting}. Verify your account
                </h1>
                <h2 className="text-neutral-grey text-sm md:text-base">
                  Not you?{" "}
                  <button
                    className="text-accent-royal-blue-4 font-semibold"
                    onClick={() => dispatch(logoutUser())}
                  >
                    Logout
                  </button>
                </h2>
              </div>
            </header>
            <form
              onSubmit={handleSubmit(handleOnSubmit)}
              id="verification-form"
            >
              <div className="space-y-4">
                <Input
                  {...register("emailVerificationCode")}
                  error={errors?.emailVerificationCode}
                  placeholder="Email Verification Code"
                />
                <Input
                  {...register("phoneVerificationCode")}
                  error={errors?.phoneVerificationCode}
                  placeholder="Phone Verification Code"
                />
              </div>
              <p className="text-xs mt-4 mb-6">
                <span>Didn't receive the verification code? </span>
                <button
                  type="button"
                  className={`inline ${
                    hasSentVerification
                      ? "text-neutral-charcoal cursor-not-allowed"
                      : "text-accent-royal-blue-4 cursor-pointer"
                  }`}
                  onClick={handleResendVerificationNotification}
                  disabled={hasSentVerification}
                >
                  {hasSentVerification
                    ? "Sent (wait for 60 seconds to resend)"
                    : "Resend"}
                </button>
              </p>
              {apiError && (
                <p className="text-system-danger-4 my-4 text-sm">{apiError}</p>
              )}
            </form>
          </div>
          <div className="mt-6">
            <Button
              type="submit"
              form="verification-form"
              isLoading={isApiLoading}
            >
              Verify
            </Button>
          </div>
        </div>
      </div>
      <VerificationNotificationModal
        {...{
          shouldShow: showVerificationNotification,
          onClose: () => {
            setVerificationNotification(false);
          },
        }}
      />
    </div>
  );
}
