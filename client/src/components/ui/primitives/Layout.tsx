import type { HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export function PageShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("theme-page-shell min-h-screen", className)} {...props} />;
}

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("w-full max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-10", className)}
      {...props}
    />
  );
}

export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "theme-panel rounded-[calc(var(--radius)+8px)] p-4 md:p-5",
        className
      )}
      {...props}
    />
  );
}
