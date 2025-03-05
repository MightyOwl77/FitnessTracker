interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const percentage = Math.round((step / totalSteps) * 100);

  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-neutral-500 mb-2">
        <span id="progressLabel" className="font-medium">Step {step} of {totalSteps}</span>
        <span id="progressPercentage">{percentage}%</span>
      </div>
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          id="progressBar" 
          className="h-full bg-primary-500 rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
