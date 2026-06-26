import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-sm)] border border-[#E0D9CD] bg-white px-3 py-2 text-sm text-[#1B1815] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#A39A8C] focus-visible:outline-none focus-visible:border-[#DB4B2E] focus-visible:ring-2 focus-visible:ring-[#DB4B2E]/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#FBF8F3] transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
