import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";

import { API_URI } from "../../../common/constants";
import Button from "../../lib/Button";
import Input from "../../lib/Input";
import { loginUser, logoutUser } from "../duck/actions";
import { isLoggedIn, isVerified } from "../duck/functions";
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

  // If not logged in or already verified, let them access the application.
  if (!_isLoggedIn || _isVerified) {
    return children;
  }

  const handleOnSubmit = (payload) => {
    axios
      .post(`${API_URI}/auth/verify`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => res.data)
      .then((data) => {
        dispatch(loginUser(data));
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
              {greeting}. Verify your account
            </h1>
            <h2 className="text-neutral-grey">
              Not you?{" "}
              <button
                className="text-accent-royal-blue-4 font-semibold"
                onClick={() => dispatch(logoutUser())}
              >
                Logout
              </button>
            </h2>
          </header>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
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
            <div className="mt-6">
              <Button type="submit">Verify</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
