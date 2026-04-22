import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn("theme-input text-sm md:text-[0.95rem]", className)}
      {...props}
    />
  );
});

export default Input;
