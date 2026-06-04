"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-samsung text-white shadow-glow hover:bg-samsung-hover hover:-translate-y-px active:translate-y-0",
  secondary:
    "bg-white text-gray-700 border border-gray-200 shadow-xs hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-px active:translate-y-0",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  danger:
    "bg-white text-danger border border-gray-200 shadow-xs hover:bg-red-50 hover:border-danger/40",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});

export default Button;
