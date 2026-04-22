import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "theme-btn",
  secondary: "theme-btn-secondary",
  ghost:
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[calc(var(--radius)+6px)] text-sm font-medium text-[var(--foreground)] border border-[color-mix(in_oklab,var(--border)_85%,transparent)] hover:bg-[var(--muted)]/75 hover:border-[color-mix(in_oklab,var(--primary)_40%,transparent)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}
