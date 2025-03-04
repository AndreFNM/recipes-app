"use client";

import { ChangeEvent } from "react";

interface LoginRegisterInputProps {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function LoginRegisterInput({
  name,
  type,
  placeholder,
  value,
  onChange,
}: LoginRegisterInputProps) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="border-b border-gray-900 p-2 w-full text-lg bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-sky-500 rounded-md"
    />
  );
}
