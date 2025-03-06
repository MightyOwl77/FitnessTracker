import * as React from "react"

import { cn } from "@/lib/utils"
import { useIsIOS } from "@/hooks/use-mobile"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const isIOS = useIsIOS();
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // iOS specific modifications
          isIOS && "appearance-none rounded-lg text-base min-h-[44px] py-3 px-4 ios-element ios-no-zoom",
          className
        )}
        // iOS specific properties
        style={isIOS ? {
          // Prevent zoom on iOS
          fontSize: '16px',
          // Remove iOS input shadows
          WebkitAppearance: 'none',
          ...props.style
        } : props.style}
        // Add data attributes for iOS
        data-ios={isIOS ? "true" : undefined}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
