import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormErrorProps {
  id?: string;
  message?: string;
}

/**
 * Form Error component
 * 
 * Displays form validation errors with proper accessibility attributes.
 * Displays the error message with a warning icon and appropriate styling.
 */
export function FormError({ id, message }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <div 
      className="flex items-center gap-1.5 text-destructive text-sm mt-1.5" 
      id={id}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Form Description component
 * 
 * Displays additional information about a form field.
 * Provides context and guidance to users without being distracting.
 */
export function FormDescription({ id, children }: { id?: string, children: React.ReactNode }) {
  if (!children) return null;
  
  return (
    <div 
      className="text-xs text-muted-foreground mt-1" 
      id={id}
    >
      {children}
    </div>
  );
}