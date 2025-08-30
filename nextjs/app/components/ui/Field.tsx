"use client";

import * as React from "react";
import Label from "./Label";

interface FieldProps {
  label?: string;
  htmlFor?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Field({ label, htmlFor, description, className = "", children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {description ? (
        <p className="text-xs text-gray-500">{description}</p>
      ) : null}
    </div>
  );
}

