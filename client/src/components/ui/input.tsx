import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [isIOS, setIsIOS] = React.useState(false);
    
    // Check if running on iOS device
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));
      }
    }, []);
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // iOS specific modifications
          isIOS && "appearance-none rounded-lg text-base min-h-[44px] py-3 px-4",
          className
        )}
        // iOS specific properties
        style={isIOS ? {
          // Prevent zoom on iOS
          fontSize: '16px',
          // Remove iOS input shadows
          WebkitAppearance: 'none',
        } : undefined}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
