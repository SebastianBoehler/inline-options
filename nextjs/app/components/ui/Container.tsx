"use client";

import * as React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Container({ className = "", ...props }: ContainerProps) {
  return (
    <div className={`mx-auto px-6 ${className}`} {...props} />
  );
}

