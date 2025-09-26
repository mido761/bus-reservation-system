import React from "react";
import clsx from "clsx";

// Base table container
export function Table({ className, ...props }) {
  return (
    <table
      className={clsx("w-full border-collapse text-sm", className)}
      {...props}
    />
  );
}

export function TableHeader({ className, ...props }) {
  return (
    <thead
      className={clsx("bg-gray-100 text-gray-700", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }) {
  return <tbody className={clsx(className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={clsx(
        "border-b last:border-0 hover:bg-gray-50 transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={clsx("px-3 py-2 text-left font-semibold", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return <td className={clsx("px-3 py-2", className)} {...props} />;
}
