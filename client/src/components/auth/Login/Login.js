import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

import { API_URI } from "../../../common/constants";
import {
  ERROR_CODE_AUTH_LOGIN_1,
  ERROR_CODE_AUTH_LOGIN_2,
  ERROR_CODE_AUTH_LOGIN_3,
} from "../../../common/errors";
import LogoWithType from "../../assets/LogoWithType";
import Button from "../../lib/Button";
import Input, { Password } from "../../lib/Input";
import { loginUser } from "../duck/actions";
import WelcomeScreen from "../WelcomeScreen";

const loginSchema = yup
  .object({
    emailOrPhone: yup
      .string()
      .required("Please enter a valid email or phone number")
      .test(
        "isValidEmailOrPhone",
        "Please enter a valid email or phone number (make sure you include country code, for instance, +91)",
        async function (value) {
          if (!value) {
            return false;
          }

          const isValidEmail = await yup.string().email().isValid(value);
          const isValidPhone = isValidPhoneNumber(value);

          return isValidEmail || isValidPhone;
        }
      ),
    password: yup.string().min(8, "Please enter a valid password"),
  })
  .required();

export function Login() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  const handleOnSubmit = (payload) => {
    setIsApiLoading(true);

    axios
      .post(`${API_URI}/auth/login`, payload)
      .then((res) => res.data)
      .then((data) => {
        dispatch(loginUser(data));
        navigate("/");
      })
      .catch((error) => {
        const code = error.response.data.code;

        if (code && code === ERROR_CODE_AUTH_LOGIN_1) {
          setError("emailOrPhone", {
            type: "API",
            message: "Sorry! The email is not registered.",
          });
        } else if (code && code === ERROR_CODE_AUTH_LOGIN_2) {
          setError("emailOrPhone", {
            type: "API",
            message: "Sorry! The mobile number is not registered.",
          });
        } else if (code && code === ERROR_CODE_AUTH_LOGIN_3) {
          setError("password", {
            type: "API",
            message: "Sorry! Password entered is incorrect.",
          });
        } else {
          setApiError(
            "An unexpected error has occurred. Please try again later."
          );
          // Hide the error automatically.
          setTimeout(() => setApiError(null), 3000);
        }
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
                  Sign In to WisdomCircle
                </h1>
                <h2 className="text-neutral-grey text-sm md:text-base">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-accent-royal-blue-4 font-semibold"
                  >
                    Sign Up
                  </Link>
                </h2>
              </div>
            </header>
            <form onSubmit={handleSubmit(handleOnSubmit)} id="login-form">
              <div className="space-y-4">
                <Input
                  {...register("emailOrPhone")}
                  error={errors?.emailOrPhone}
                  placeholder="Email or Mobile Number"
                />
                <Password
                  {...register("password")}
                  error={errors?.password}
                  placeholder="Password"
                />
              </div>
              {apiError && (
                <p className="text-system-danger-4 my-4 text-xs md:text-sm">
                  {apiError}
                </p>
              )}
            </form>
          </div>
          <div className="mt-6">
            <Button type="submit" form="login-form" isLoading={isApiLoading}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
