import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

import { API_URI } from "../../../common/constants";
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOnSubmit = (payload) => {
    axios
      .post(`${API_URI}/auth/login`, payload)
      .then((res) => res.data)
      .then((data) => {
        dispatch(loginUser(data));
        navigate("/");
      })
      .catch(console.error); // TODO: Handle all error states.
  };

  return (
    <div className="h-full flex flex-row w-full">
      <WelcomeScreen />
      <div className="h-full bg-white basis-full md:basis-3/5 flex flex-col items-center justify-center">
        <div className="w-full md:w-4/5 lg:w-3/5 xl:w-1/2 px-6 sm:px-8 md:px-0 space-y-6">
          <header className="space-y-1">
            <h1 className="font-bold text-2xl text-neutral-black">
              Sign In to WisdomCircle
            </h1>
            <h2 className="text-neutral-grey">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-accent-royal-blue-4 font-semibold"
              >
                Sign Up
              </Link>
            </h2>
          </header>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
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
            <div className="mt-6">
              <Button type="submit">Sign In</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}