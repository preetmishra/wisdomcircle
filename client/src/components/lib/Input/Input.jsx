import { forwardRef } from "react";

export const Input = forwardRef((props, ref) => {
  const { className = "", error = null } = props;

  return (
    <div>
      <input
        ref={ref}
        {...props}
        className={`appearance-none rounded px-4 py-3 placeholder:text-neutral-charcoal border focus:border-2 focus:outline-none h-10 md:h-12 text-sm md:text-base w-full ${className} ${
          error
            ? "text-system-danger-4 border-system-danger-4 focus:border-system-danger-4"
            : "focus:border-neutral-grey text-neutral-black border-neutral-divider"
        }`}
      />
      {error && (
        <p className="text-xs md:text-sm mt-1 text-system-danger-4">
          {error.message}
        </p>
      )}
    </div>
  );
});
