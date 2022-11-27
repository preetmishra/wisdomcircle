import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import Chevron from "../../assets/icons/Chevron";

import "./phone.css";

export const Phone = (props) => {
  const { error = null } = props;

  return (
    <div>
      <Controller
        {...props}
        render={({ field }) => (
          <PhoneInput
            {...field}
            placeholder="Mobile Number"
            defaultCountry="IN"
            className={error ? "PhoneInput--error" : ""}
            countrySelectProps={{
              arrowComponent: () => (
                <Chevron className="w-6 h-6 text-neutral-charcoal ml-2" />
              ),
            }}
          />
        )}
      />
      {error && (
        <p className="text-sm mt-1 text-system-danger-4">{error.message}</p>
      )}
    </div>
  );
};
