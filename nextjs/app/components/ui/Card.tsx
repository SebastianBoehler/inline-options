"use client";

import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`border border-gray-300 bg-white ${className}`}
      {...props}
    />
  );
}

