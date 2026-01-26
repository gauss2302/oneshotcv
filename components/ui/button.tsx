import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA239] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#FFA239] to-[#FF5656] text-white hover:from-[#FF5656] hover:to-[#FFA239] shadow-md shadow-[#FFA239]/25 hover:shadow-lg hover:shadow-[#FFA239]/30 active:scale-95",
        destructive:
          "bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-md active:scale-95",
        outline:
          "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 active:scale-95",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95",
        ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
        link: "text-[#FFA239] underline-offset-4 hover:underline hover:text-[#FF5656]",
        subtle: "bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
