import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import WelcomeScreen from "../WelcomeScreen";
import Input, { Phone, Password } from "../../lib/Input";
import Button from "../../lib/Button";
import { API_URI } from "../../../common/constants";
import { loginUser } from "../duck/actions";
import { useState } from "react";
import {
  ERROR_CODE_AUTH_REG_1,
  ERROR_CODE_AUTH_REG_2,
  ERROR_CODE_AUTH_REG_3,
} from "../../../common/errors";
import LogoWithType from "../../assets/LogoWithType";

const registerSchema = yup
  .object({
    firstName: yup.string().required("Please enter your first name"),
    lastName: yup.string().required("Please enter your last name"),
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter an email"),
    password: yup.string().min(8, "Please enter a valid password"),
    phone: yup
      .string()
      .test(
        "isValidPhoneNumber",
        "Please enter a valid phone number",
        (value) => value && isValidPhoneNumber(value)
      ),
  })
  .required();

export function Register() {
  const {
    register,
    setError,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const handleOnSubmit = (payload) => {
    axios
      .post(`${API_URI}/auth/register`, payload)
      .then((res) => res.data)
      .then((data) => {
        dispatch(loginUser(data));
        navigate("/");
      })
      .catch((error) => {
        const code = error.response.data.code;

        if (code && code === ERROR_CODE_AUTH_REG_1) {
          setError("email", {
            type: "API",
            message: "Sorry! The email is already registered.",
          });
        } else if (code && code === ERROR_CODE_AUTH_REG_2) {
          setError("phone", {
            type: "API",
            message: "Sorry! The mobile number is already registered.",
          });
        } else if (code && code === ERROR_CODE_AUTH_REG_3) {
          setError("email", {
            type: "API",
            message: "Sorry! The email is already registered.",
          });
          setError("phone", {
            type: "API",
            message: "Sorry! The mobile number is already registered.",
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
                  Create an account
                </h1>
                <h2 className="text-neutral-grey text-sm md:text-base">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-accent-royal-blue-4 font-semibold"
                  >
                    Sign In
                  </Link>
                </h2>
              </div>
            </header>
            <form onSubmit={handleSubmit(handleOnSubmit)} id="register-form">
              <div className="space-y-4">
                <Input
                  {...register("firstName")}
                  error={errors?.firstName}
                  placeholder="First Name"
                />
                <Input
                  {...register("lastName")}
                  error={errors?.lastName}
                  placeholder="Last Name"
                />
                <Input
                  {...register("email")}
                  error={errors?.email}
                  placeholder="Email Address"
                />
                <Phone name="phone" control={control} error={errors?.phone} />
                <Password
                  {...register("password")}
                  error={errors?.password}
                  placeholder="Password"
                  showHelpText={true}
                />
              </div>
              <p className="text-xs mt-4 mb-6">
                By clicking Sign Up you are indicating that you have read and
                acknowledged the{" "}
                <span className="text-accent-royal-blue-4">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-accent-royal-blue-4">Privacy Notice</span>
              </p>
              {apiError && (
                <p className="text-system-danger-4 my-4 text-sm">{apiError}</p>
              )}
            </form>
          </div>
          <div className="pb-8">
            <Button type="submit" form="register-form">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
