"use client";

import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export default function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      className={`text-xs font-medium text-gray-600 ${className}`}
      {...props}
    />
  );
}

