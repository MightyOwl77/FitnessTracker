import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface CustomToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  onClose?: () => void;
}

const CustomToast = React.forwardRef<HTMLDivElement, CustomToastProps>(
  ({ className, title, description, variant = "default", onClose, ...props }, ref) => {
    const variantStyles = {
      default: "bg-white border-neutral-200",
      success: "bg-green-50 border-green-200",
      error: "bg-red-50 border-red-200",
      warning: "bg-yellow-50 border-yellow-200",
    };
    
    const titleColors = {
      default: "text-neutral-900",
      success: "text-green-800",
      error: "text-red-800",
      warning: "text-yellow-800",
    };
    
    const descriptionColors = {
      default: "text-neutral-500",
      success: "text-green-600",
      error: "text-red-600",
      warning: "text-yellow-600",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex max-w-md rounded-lg border p-4 shadow-lg",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {title && <h3 className={`font-medium ${titleColors[variant]}`}>{title}</h3>}
          {description && <p className={`text-sm ${descriptionColors[variant]}`}>{description}</p>}
        </div>
        
        {onClose && (
          <button onClick={onClose} className="ml-4 text-neutral-400 hover:text-neutral-500">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

CustomToast.displayName = "CustomToast";

const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none max-w-md">
      {children}
    </div>
  );
};

export { CustomToast, ToastContainer };