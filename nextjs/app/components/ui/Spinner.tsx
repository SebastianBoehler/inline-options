"use client";

import * as React from "react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export default function Spinner({ size = 20, className = "", ...props }: SpinnerProps) {
  const s = `${size}px`;
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 ${className}`}
      style={{ width: s, height: s }}
      {...props}
    />
  );
}

