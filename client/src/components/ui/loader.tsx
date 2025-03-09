
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: number;
  className?: string;
  text?: string;
}

export function Loader({ size = 24, className, text }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <Loader2 className={cn("animate-spin text-primary", className)} size={size} />
      {text && <p className="text-sm text-muted-foreground mt-2">{text}</p>}
    </div>
  );
}
