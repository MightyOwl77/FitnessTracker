import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bolt } from "lucide-react";
import { useLocation } from "wouter";

export default function Header() {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all your progress and start over?")) {
      setIsResetting(true);
      try {
        await apiRequest("POST", "/api/reset", {});
        toast({
          title: "Reset successful",
          description: "All your data has been reset",
        });
        setLocation("/user-data");
      } catch (error) {
        toast({
          title: "Reset failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="rounded-full bg-primary-500 h-8 w-8 flex items-center justify-center">
            <Bolt className="text-white text-lg" />
          </div>
          <h1 className="font-heading font-bold text-xl ml-2 text-neutral-800">FitTransform</h1>
        </div>
        <button 
          id="resetBtn" 
          className="text-sm text-neutral-500 hover:text-primary-600 flex items-center"
          onClick={handleReset}
          disabled={isResetting}
        >
          {isResetting ? (
            <span className="animate-spin mr-1">↻</span>
          ) : (
            <span className="mr-1">↻</span>
          )}
          Reset
        </button>
      </div>
    </header>
  );
}
