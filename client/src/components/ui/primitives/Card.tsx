import type { HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export default function Card({
  className,
  elevated = true,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "theme-card",
        elevated
          ? "shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          : "shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-3", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base md:text-lg font-semibold text-[var(--foreground)] tracking-tight",
        className
      )}
      {...props}
    />
  );
}
