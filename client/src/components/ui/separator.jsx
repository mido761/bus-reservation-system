import * as React from "react";
import { cn } from "@/lib/utils"; // same helper we used earlier

const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <div
    ref={ref}
    role={decorative ? "none" : "separator"}
    aria-orientation={orientation === "vertical" ? "vertical" : "horizontal"}
    className={cn(
      "shrink-0 bg-border",
      orientation === "vertical" ? "w-px h-full" : "h-px w-full",
      className
    )}
    {...props}
  />
));

Separator.displayName = "Separator";

export { Separator };
