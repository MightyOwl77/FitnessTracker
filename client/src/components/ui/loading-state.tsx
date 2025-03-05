
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-neutral-500">
      <Loader2 className="h-8 w-8 animate-spin mr-2" />
      <p className="mt-2">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong. Please try again." }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex flex-col items-center text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p>{message}</p>
    </div>
  );
}
