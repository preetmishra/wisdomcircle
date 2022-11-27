import { forwardRef } from "react";

export const Button = forwardRef((props, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className="w-full bg-primary-4 rounded h-12 text-lg text-neutral-black font-semibold hover:bg-primary-5"
    >
      {props.children}
    </button>
  );
});
