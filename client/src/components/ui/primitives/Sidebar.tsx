import type { HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

export default function SidebarShell({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        "theme-sidebar-shell theme-glass relative flex h-screen flex-col overflow-x-hidden scrollbar-sm transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}
