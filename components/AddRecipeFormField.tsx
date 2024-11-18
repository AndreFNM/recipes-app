"use client";

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

interface FormFieldProps {
  label: string;
  type?: "text" | "number" | "textarea";
}

export default function FormField({
  label,
  type = "text",
  ...props
}: FormFieldProps & (InputProps | TextareaProps)): JSX.Element {
  return (
    <div className="space-y-2">
      <label className="block text-gray-600">{label}</label>
      {type === "textarea" ? (
        <textarea
          className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...(props as TextareaProps)}
        />
      ) : (
        <input
          type={type}
          className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...(props as InputProps)}
        />
      )}
    </div>
  );
}