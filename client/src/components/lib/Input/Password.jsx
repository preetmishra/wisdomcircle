import { forwardRef, useState } from "react";
import Input from ".";
import Visible from "../../assets/icons/Visible";
import VisibleOff from "../../assets/icons/VisibleOff";

export const Password = forwardRef(
  ({ showHelpText = false, ...props }, ref) => {
    const [shouldShowPassword, setShouldShowPassword] = useState(false);

    return (
      <div>
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={shouldShowPassword ? "text" : "password"}
            className="pl-4 pr-12"
          />
          <button
            className="w-6 h-6 text-neutral-charcoal absolute top-2 md:top-3 right-4"
            type="button"
            onClick={() => setShouldShowPassword((state) => !state)}
          >
            {shouldShowPassword ? <VisibleOff /> : <Visible />}
          </button>
        </div>
        {showHelpText && (
          <p className="text-xs md:text-sm text-neutral-grey mt-1.5">
            Password must be at least 8 characters
          </p>
        )}
      </div>
    );
  }
);
