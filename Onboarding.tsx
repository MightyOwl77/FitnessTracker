import { useState } from 'react';

interface Step {
  title: string;
  description: string;
}

const steps: Step[] = [
  { title: "Welcome", description: "Transform Your Body. Transform Your Life." },
  { title: "User Data", description: "Enter your personal details to calculate your BMR." },
  { title: "Set Goals", description: "Define realistic weight loss targets and time frames." },
  { title: "View Plan", description: "Review your personalized nutrition and training plan." },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Implement what happens after onboarding is complete, e.g., routing to the main app.
    console.log("Onboarding complete");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h2>
        <p className="mb-6">{steps[currentStep].description}</p>
        <div className="flex justify-between">
          {currentStep > 0 && (
            <button onClick={prevStep} className="px-4 py-2 bg-gray-200 rounded">
              Back
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button onClick={nextStep} className="ml-auto px-4 py-2 bg-green-500 text-white rounded">
              Next
            </button>
          ) : (
            <button onClick={completeOnboarding} className="ml-auto px-4 py-2 bg-green-500 text-white rounded">
              Finish
            </button>
          )}
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              className="bg-green-500 h-2 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
