
import { Loader2, AlertCircle } from "lucide-react";
import { FitnessLoading } from "./fitness-loading-animation";

interface LoadingStateProps {
  message?: string;
  type?: 'lifting' | 'cardio' | 'progress' | 'weight' | 'random' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  message = "Loading...", 
  type = 'random',
  size = 'md'
}: LoadingStateProps) {
  // Use default loading spinner if specifically requested
  if (type === 'default') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-neutral-500">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p className="mt-2">{message}</p>
      </div>
    );
  }

  // Use our fancy fitness-themed loading animations
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <FitnessLoading 
        message={message}
        type={type !== 'default' ? type as 'lifting' | 'cardio' | 'progress' | 'weight' | 'random' : 'random'}
        size={size}
      />
    </div>
  );
}

export function ErrorState({ message = "Something went wrong. Please try again." }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex flex-col items-center text-center">
      <AlertCircle className="h-6 w-6 mb-2" />
      <p>{message}</p>
    </div>
  );
}
