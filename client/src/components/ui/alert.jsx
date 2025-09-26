import React from "react";
import clsx from "clsx";

export function Alert({ children, variant = "default", className, ...props }) {
  const variants = {
    default: "bg-blue-50 border-blue-300 text-blue-800",
    success: "bg-green-50 border-green-300 text-green-800",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    error: "bg-red-50 border-red-300 text-red-800",
  };

  return (
    <div
      className={clsx(
        "w-full rounded-md border px-4 py-3 text-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
