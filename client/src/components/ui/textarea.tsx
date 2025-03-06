
import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsIOS } from "@/hooks/use-mobile";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const isIOS = useIsIOS();
    
    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // iOS specific modifications
          isIOS && "appearance-none rounded-lg text-base px-4 py-3 min-h-[120px] ios-no-zoom resize-none momentum-scroll",
          className
        )}
        // iOS specific properties
        style={isIOS ? {
          // Prevent zoom on iOS
          fontSize: '16px',
          // Improve iOS scrolling
          WebkitOverflowScrolling: 'touch',
          ...props.style
        } : props.style}
        // Add data attributes for iOS
        data-ios={isIOS ? "true" : undefined}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
