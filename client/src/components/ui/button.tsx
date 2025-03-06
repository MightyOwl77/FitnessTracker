import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useIsIOS } from "@/hooks/use-mobile"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] touch-action-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline",
        ios: "bg-primary text-primary-foreground rounded-full shadow-sm active:opacity-80 transition-opacity",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // iOS-specific sizes with better touch targets (44px minimum)
        ios: "h-11 px-6 py-2.5 min-h-[44px] text-base",
        "ios-lg": "h-12 px-8 py-3 min-h-[44px] text-base font-semibold"
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
    const isIOS = useIsIOS();
    
    // Apply iOS optimized styling if on iOS device
    const effectiveVariant = isIOS && !variant ? "ios" : variant;
    const effectiveSize = isIOS && !size ? "ios" : size;
    
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ variant: effectiveVariant, size: effectiveSize, className }),
          isIOS && "ios-element ios-no-callout ios-no-zoom"
        )}
        ref={ref}
        // Add iOS-specific attributes
        {...(isIOS ? { 
          "data-ios": "true",
          "aria-haspopup": props["aria-haspopup"] || undefined,
        } : {})}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
