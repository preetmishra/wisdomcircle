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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOnSubmit = (payload) => {
    axios
      .post(`${API_URI}/auth/register`, payload)
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
              Create an account
            </h1>
            <h2 className="text-neutral-grey">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-accent-royal-blue-4 font-semibold"
              >
                Sign In
              </Link>
            </h2>
          </header>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
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
              <span className="text-accent-royal-blue-4">Terms of Service</span>{" "}
              and{" "}
              <span className="text-accent-royal-blue-4">Privacy Notice</span>
            </p>
            <Button type="submit">Sign Up</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
