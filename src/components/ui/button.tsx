
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-navy-800 text-white hover:bg-navy-900 shadow-md",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-md",
        outline:
          "border-2 border-navy-800 bg-transparent text-navy-800 hover:bg-navy-800 hover:text-white",
        secondary:
          "bg-secondary text-white hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-white",
        link: "text-navy-800 underline-offset-4 font-semibold hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-md",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10 rounded-full",
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
