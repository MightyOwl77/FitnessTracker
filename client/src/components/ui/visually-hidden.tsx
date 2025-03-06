import React from "react";

interface VisuallyHiddenProps {
  children: React.ReactNode;
}

// This component hides content visually but keeps it accessible to screen readers
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return (
    <span
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{
        clip: "rect(0, 0, 0, 0)",
        clipPath: "inset(50%)",
      }}
    >
      {children}
    </span>
  );
}