import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-[var(--transition-duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#457b9d] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-md)]",
  {
    variants: {
      variant: {
        default:
          "bg-[#457b9d] text-white hover:bg-[#3d6d8a] shadow-[var(--shadow-sm)] hover:shadow-md active:translate-y-px",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#dc2626] shadow-md active:scale-95",
        outline:
          "border border-[#a8dadc] bg-white text-[#1d3557] hover:bg-[#f1faee] hover:border-[#a8dadc] active:scale-[0.99]",
        secondary:
          "bg-[#e8f4f2] text-[#1d3557] hover:bg-[#a8dadc]/30 active:scale-[0.99]",
        ghost: "hover:bg-[#f1faee] hover:text-[#1d3557] text-[#457b9d]",
        link: "text-[#457b9d] underline-offset-4 hover:underline",
        subtle: "bg-[#f1faee] text-[#1d3557] hover:bg-[#e8f4f2] active:scale-[0.99]",
      },
      size: {
        default: "h-11 px-5 py-3",
        sm: "h-9 rounded-[var(--radius-md)] px-3 text-sm",
        lg: "h-11 rounded-[var(--radius-md)] px-5 py-3 text-base",
        icon: "h-11 w-11",
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
