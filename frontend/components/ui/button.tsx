import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-[var(--transition-duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB4B2E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-md)]",
  {
    variants: {
      variant: {
        default:
          "bg-[#DB4B2E] text-white hover:bg-[#C03E22] shadow-[var(--shadow-sm)] hover:shadow-md active:translate-y-px",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#dc2626] shadow-md active:scale-95",
        outline:
          "border border-[#E0D9CD] bg-white text-[#1B1815] hover:bg-[#FBF8F3] hover:border-[#E0D9CD] active:scale-[0.99]",
        secondary:
          "bg-[#F1ECE4] text-[#1B1815] hover:bg-[#E0D9CD]/30 active:scale-[0.99]",
        ghost: "hover:bg-[#FBF8F3] hover:text-[#1B1815] text-[#DB4B2E]",
        link: "text-[#DB4B2E] underline-offset-4 hover:underline",
        subtle: "bg-[#FBF8F3] text-[#1B1815] hover:bg-[#F1ECE4] active:scale-[0.99]",
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
