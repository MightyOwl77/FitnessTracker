import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormErrorProps {
  id?: string;
  message?: string;
}

/**
 * Form Error component
 * 
 * Displays form validation errors with a warning icon and appropriate styling.
 */
export function FormError({ id, message }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <div 
      className="flex items-center gap-1.5 text-destructive text-sm mt-1.5" 
      id={id}
    >
      <AlertTriangle size={14} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Form Description component
 * 
 * Displays additional information about a form field.
 */
export function FormDescription({ id, children }: { id?: string, children: React.ReactNode }) {
  if (!children) return null;
  
  return (
    <div className="text-xs text-muted-foreground mt-1">
      {children}
    </div>
  );
}