
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        // Critical iOS PWA fixes
        style={{
          fontSize: '16px',
          WebkitAppearance: 'none',
          WebkitUserSelect: 'text',
          userSelect: 'text',
          touchAction: 'manipulation',
          pointerEvents: 'auto',
          backgroundColor: 'white',
          position: 'relative',
          zIndex: 1
        }}
        // Ensure keyboard appears on iOS
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        // Prevent readonly issues
        readOnly={false}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
