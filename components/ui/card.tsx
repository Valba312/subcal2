import * as React from "react";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-white/20 bg-white/70 p-6 shadow-soft backdrop-blur-lg dark:border-white/5 dark:bg-slate-900/70",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
