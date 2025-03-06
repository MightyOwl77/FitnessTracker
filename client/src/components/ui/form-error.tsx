import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  id?: string;
  message?: string;
}

// Accessible form error component that works with screen readers
export function FormError({ id, message }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <div 
      className="flex items-center gap-2 text-destructive text-sm mt-1" 
      id={id}
      role="alert"
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}

// Component for form field descriptions/hints
export function FormDescription({ id, children }: { id?: string, children: React.ReactNode }) {
  return (
    <p 
      className="text-sm text-muted-foreground mt-1" 
      id={id}
    >
      {children}
    </p>
  );
}