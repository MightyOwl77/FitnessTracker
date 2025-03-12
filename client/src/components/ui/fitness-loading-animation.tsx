import React, { useState, useEffect } from 'react';
import { Dumbbell, Heart, FlameIcon, Zap, BarChart, ActivitySquare } from 'lucide-react';

interface FitnessLoadingAnimationProps {
  type?: 'lifting' | 'cardio' | 'progress' | 'weight' | 'random';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

export function FitnessLoadingAnimation({
  type = 'random',
  message = 'Loading your fitness journey...',
  size = 'md',
  showMessage = true
}: FitnessLoadingAnimationProps) {
  const [animationType, setAnimationType] = useState<string>(type);
  
  // Use a random animation type if set to random
  useEffect(() => {
    if (type === 'random') {
      const types = ['lifting', 'cardio', 'progress', 'weight'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setAnimationType(randomType);
    } else {
      setAnimationType(type);
    }
  }, [type]);

  // Get size classes
  const sizeClasses = {
    sm: {
      container: 'h-20 w-20',
      icon: 'h-8 w-8',
      text: 'text-sm'
    },
    md: {
      container: 'h-28 w-28',
      icon: 'h-12 w-12',
      text: 'text-base'
    },
    lg: {
      container: 'h-36 w-36',
      icon: 'h-16 w-16',
      text: 'text-lg'
    }
  }[size];
  
  // Set of motivational messages for each type
  const messages = {
    lifting: [
      "Building strength...",
      "Gaining muscle power...",
      "Preparing your workout..."
    ],
    cardio: [
      "Getting your heartrate up...",
      "Warming up...",
      "Activating endurance mode..."
    ],
    progress: [
      "Calculating your progress...",
      "Analyzing your fitness journey...",
      "Tracking transformations..."
    ],
    weight: [
      "Measuring results...", 
      "Calculating body composition...",
      "Processing your health data..."
    ]
  };

  // Get a randomized message based on type
  const getRandomizedMessage = () => {
    const typeMessages = messages[animationType as keyof typeof messages] || messages.lifting;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  // State for the current message
  const [currentMessage, setCurrentMessage] = useState<string>(message);

  // Update message every few seconds if using default messages
  useEffect(() => {
    if (message === 'Loading your fitness journey...') {
      const interval = setInterval(() => {
        setCurrentMessage(getRandomizedMessage());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [animationType, message]);

  // Render different animations based on type
  const renderAnimation = () => {
    switch (animationType) {
      case 'lifting':
        return <WeightLiftingAnimation size={sizeClasses.icon} />;
      case 'cardio':
        return <CardioAnimation size={sizeClasses.icon} />;
      case 'progress':
        return <ProgressAnimation size={sizeClasses.icon} />;
      case 'weight':
        return <WeightAnimation size={sizeClasses.icon} />;
      default:
        return <WeightLiftingAnimation size={sizeClasses.icon} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses.container} relative flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/30 rounded-full`}>
        {renderAnimation()}
      </div>
      {showMessage && (
        <p className={`text-center text-primary ${sizeClasses.text} font-medium`}>
          {currentMessage}
        </p>
      )}
    </div>
  );
}

// Animation components
function WeightLiftingAnimation({ size }: { size: string }) {
  const [position, setPosition] = useState<'down' | 'up'>('down');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => prev === 'down' ? 'up' : 'down');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <Dumbbell 
        className={`${size} text-primary transition-transform duration-700 transform ${position === 'up' ? '-translate-y-2' : 'translate-y-2'}`} 
      />
      <span 
        className={`absolute bottom-[-10px] w-8 h-2 bg-primary/10 rounded-full transition-all duration-700 ${position === 'up' ? 'scale-75 opacity-50' : 'scale-100 opacity-80'}`}
      />
    </div>
  );
}

function CardioAnimation({ size }: { size: string }) {
  const [heartSize, setHeartSize] = useState<'normal' | 'big'>('normal');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartSize(prev => prev === 'normal' ? 'big' : 'normal');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-2">
      <ActivitySquare className={`${size} text-green-500 animate-pulse`} />
      <Heart 
        className={`${size} text-red-500 transition-transform duration-500 ${heartSize === 'big' ? 'scale-125' : 'scale-100'}`} 
        fill={heartSize === 'big' ? 'currentColor' : 'none'}
      />
    </div>
  );
}

function ProgressAnimation({ size }: { size: string }) {
  const [chartHeight, setChartHeight] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setChartHeight(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end justify-center space-x-1">
      <BarChart className={`${size} text-primary animate-pulse`} />
      <div className="flex items-end space-x-1">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-1.5 bg-primary rounded-t transition-all duration-300 ${
              i <= chartHeight ? 'h-6' : 'h-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function WeightAnimation({ size }: { size: string }) {
  const [flameSize, setFlameSize] = useState<'small' | 'big'>('small');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFlameSize(prev => prev === 'small' ? 'big' : 'small');
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center relative">
      <FlameIcon 
        className={`${size} text-orange-500 absolute transition-all duration-700 ${flameSize === 'big' ? 'opacity-80 scale-110' : 'opacity-50 scale-90'}`} 
      />
      <Zap 
        className={`${size} text-yellow-500 animate-pulse`} 
      />
    </div>
  );
}

// Loading component that combines the animation with a container
export function FitnessLoading({
  message,
  type = 'random',
  size = 'md',
  className = '',
  fullScreen = false
}: {
  message?: string;
  type?: 'lifting' | 'cardio' | 'progress' | 'weight' | 'random';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <div className={`${className} text-center`}>
          <FitnessLoadingAnimation 
            type={type}
            message={message}
            size={size}
            showMessage={!!message}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <FitnessLoadingAnimation 
        type={type}
        message={message}
        size={size}
        showMessage={!!message}
      />
    </div>
  );
}