import { forwardRef } from "react";

export const Button = forwardRef(({ isLoading, ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className="w-full bg-primary-4 rounded h-12 text-base md:text-lg text-neutral-black font-semibold hover:bg-primary-5"
    >
      {isLoading ? (
        <div className="animate-pulse text-neutral-grey flex items-center justify-center">
          Loading...
        </div>
      ) : (
        props.children
      )}
    </button>
  );
});
