import * as React from "react";
// Update the import path if needed, for example:
import { cn } from "../../lib/utils";
// Or create the file at src/lib/utils.ts and export 'cn' from it.

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-black",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card as default };
