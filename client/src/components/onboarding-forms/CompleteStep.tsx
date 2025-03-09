import { ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompleteStepProps {
  onFinish: () => void;
  stepTitle: string;
  stepDescription: string;
}

export function CompleteStep({ onFinish, stepTitle, stepDescription }: CompleteStepProps) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Activity className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{stepTitle}</h2>
      <p className="text-muted-foreground mb-8">{stepDescription}</p>
      <Button onClick={onFinish} size="lg">
        View My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}