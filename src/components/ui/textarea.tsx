
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea"

export { Textarea }
