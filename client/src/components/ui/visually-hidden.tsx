import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
}

/**
 * VisuallyHidden component
 * 
 * This component hides content visually but keeps it accessible to screen readers.
 * Use it to provide additional context for screen reader users without affecting the visual layout.
 * 
 * Example usage:
 * <button>
 *   <span aria-hidden="true">×</span>
 *   <VisuallyHidden>Close</VisuallyHidden>
 * </button>
 */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return (
    <span
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)',
      }}
    >
      {children}
    </span>
  );
}