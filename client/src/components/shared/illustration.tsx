import React from 'react';
import { cn } from '@/lib/utils';

// Inline SVG content instead of using imports
const illustrationComponents = {
  welcome: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="120" cy="120" r="120" fill="#E8F5E9" />
      <g opacity="0.8">
        <path d="M100 60C92 60 85 67 85 75C85 83 92 90 100 90C108 90 115 83 115 75C115 67 108 60 100 60Z" fill="#9E9E9E"/>
        <path d="M85 95C85 95 80 100 80 105V135C80 135 83 140 90 140H95V155C95 155 95 160 100 160C105 160 105 155 105 155V140H110C117 140 120 135 120 135V105C120 100 115 95 115 95H85Z" fill="#9E9E9E"/>
        <path d="M160 60C152 60 145 67 145 75C145 83 152 90 160 90C168 90 175 83 175 75C175 67 168 60 160 60Z" fill="#4CAF50"/>
        <path d="M145 95C145 95 140 100 140 105V135C140 135 142 140 148 140H150V155C150 155 150 160 155 160C160 160 160 155 160 155V140H165C173 140 175 135 175 135V105C175 100 170 95 170 95H145Z" fill="#4CAF50"/>
      </g>
      <path d="M120 120 H140" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round"/>
      <path d="M135 115 L140 120 L135 125" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 180 C60 170 80 165 100 160 C120 155 140 145 160 130 C180 115 200 90 220 80" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <circle cx="40" cy="180" r="5" fill="#4CAF50"/>
      <circle cx="100" cy="160" r="5" fill="#4CAF50"/>
      <circle cx="160" cy="130" r="5" fill="#4CAF50"/>
      <circle cx="220" cy="80" r="5" fill="#4CAF50"/>
      <path d="M70 60 L70 70 L80 70 L80 80 L70 80 L70 90 L60 90 L60 80 L50 80 L50 70 L60 70 L60 60 L70 60Z" fill="#FFC107"/>
      <path d="M200 160 L200 170 L210 170 L210 180 L200 180 L200 190 L190 190 L190 180 L180 180 L180 170 L190 170 L190 160 L200 160Z" fill="#FFC107"/>
      <g transform="translate(50, 120) scale(0.6)">
        <rect x="-10" y="-5" width="40" height="10" rx="5" fill="#4CAF50"/>
        <circle cx="-15" cy="0" r="8" fill="#4CAF50"/>
        <circle cx="35" cy="0" r="8" fill="#4CAF50"/>
      </g>
      <g transform="translate(200, 130) scale(0.6)">
        <circle cx="0" cy="0" r="10" fill="#F44336"/>
        <path d="M0 -10 C5 -15 10 -5 0 0" stroke="#4CAF50" strokeWidth="2" fill="none"/>
      </g>
      <circle cx="120" cy="120" r="110" stroke="#4CAF50" strokeWidth="2" strokeDasharray="10 5" fill="none">
        <animate attributeName="r" values="108;112;108" dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  ),
  
  progress: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="120" cy="120" r="120" fill="#E8F5E9" />
      <path d="M20 180 C40 170 60 160 80 140 C100 120 120 110 140 90 C160 70 180 60 200 40" 
            stroke="#4CAF50" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none"
            strokeDasharray="300"
            strokeDashoffset="300">
        <animate attributeName="stroke-dashoffset" 
                 from="300" 
                 to="0" 
                 dur="2s" 
                 fill="freeze" 
                 repeatCount="1" />
      </path>
      <g>
        <circle cx="20" cy="180" r="6" fill="#4CAF50" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.2s" fill="freeze" />
        </circle>
        <circle cx="80" cy="140" r="6" fill="#4CAF50" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="0.6s" fill="freeze" />
        </circle>
        <circle cx="140" cy="90" r="6" fill="#4CAF50" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1s" fill="freeze" />
        </circle>
        <circle cx="200" cy="40" r="6" fill="#4CAF50" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.4s" fill="freeze" />
        </circle>
      </g>
      <g>
        <circle cx="200" cy="40" r="14" stroke="#FFC107" strokeWidth="2" fill="none" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.6s" fill="freeze" />
        </circle>
        <circle cx="200" cy="40" r="10" stroke="#FFC107" strokeWidth="2" fill="none" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.7s" fill="freeze" />
        </circle>
      </g>
      <g transform="translate(30, 50) scale(0.8)">
        <rect x="0" y="0" width="60" height="60" rx="4" fill="white" stroke="#9E9E9E" strokeWidth="2" />
        <rect x="0" y="0" width="60" height="15" rx="4" fill="#4CAF50" />
        <line x1="15" y1="15" x2="15" y2="60" stroke="#EEEEEE" strokeWidth="1" />
        <line x1="30" y1="15" x2="30" y2="60" stroke="#EEEEEE" strokeWidth="1" />
        <line x1="45" y1="15" x2="45" y2="60" stroke="#EEEEEE" strokeWidth="1" />
        <line x1="0" y1="30" x2="60" y2="30" stroke="#EEEEEE" strokeWidth="1" />
        <line x1="0" y1="45" x2="60" y2="45" stroke="#EEEEEE" strokeWidth="1" />
        <path d="M7 25 L12 30 L18 20" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 25 L27 30 L33 20" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M37 25 L42 30 L48 20" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 40 L12 45 L18 35" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 40 L27 45 L33 35" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="42" cy="40" r="5" fill="#FFC107" />
      </g>
      <g transform="translate(170, 80)">
        <rect x="0" y="0" width="20" height="15" fill="#F44336" />
        <rect x="0" y="15" width="3" height="25" fill="#444444" />
      </g>
      <g transform="translate(120, 160)">
        <circle cx="0" cy="0" r="18" fill="#FFC107" />
        <circle cx="0" cy="0" r="14" fill="#FFD54F" />
        <path d="M-8 -2 L0 8 L8 -5" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="-2" y="18" width="4" height="12" fill="#FFC107" />
      </g>
      <g transform="translate(60, 160)">
        <rect x="-25" y="-15" width="50" height="30" rx="15" fill="#4CAF50" />
        <text x="0" y="5" fontFamily="Arial, sans-serif" fontSize="18" fill="white" textAnchor="middle" fontWeight="bold">14</text>
        <text x="0" y="22" fontFamily="Arial, sans-serif" fontSize="10" fill="#4CAF50" textAnchor="middle">DAY STREAK</text>
      </g>
    </svg>
  ),
  
  bodyComposition: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="120" cy="120" r="120" fill="#E8F5E9" />
      <g transform="translate(120, 120)">
        <circle cx="0" cy="0" r="90" fill="#2196F3" opacity="0.2" />
        <path d="M0 -90 A90 90 0 0 1 90 0 L0 0 Z" fill="#2196F3" opacity="0.6" />
        <text x="45" y="-45" fontFamily="Arial, sans-serif" fontSize="12" fill="#0D47A1" textAnchor="middle">Water</text>
        <text x="45" y="-30" fontFamily="Arial, sans-serif" fontSize="14" fill="#0D47A1" textAnchor="middle" fontWeight="bold">60%</text>
        <circle cx="0" cy="0" r="70" fill="#4CAF50" opacity="0.2" />
        <path d="M0 0 L-70 0 A70 70 0 0 0 0 70 Z" fill="#4CAF50" opacity="0.6" />
        <text x="-40" y="40" fontFamily="Arial, sans-serif" fontSize="12" fill="#1B5E20" textAnchor="middle">Muscle</text>
        <text x="-40" y="55" fontFamily="Arial, sans-serif" fontSize="14" fill="#1B5E20" textAnchor="middle" fontWeight="bold">25%</text>
        <circle cx="0" cy="0" r="60" fill="#FF9800" opacity="0.2" />
        <path d="M0 0 L0 70 A70 70 0 0 1 -70 0 Z" fill="#FF9800" opacity="0.6" />
        <text x="-25" y="-40" fontFamily="Arial, sans-serif" fontSize="12" fill="#E65100" textAnchor="middle">Fat</text>
        <text x="-25" y="-25" fontFamily="Arial, sans-serif" fontSize="14" fill="#E65100" textAnchor="middle" fontWeight="bold">15%</text>
        <circle cx="0" cy="0" r="40" fill="#9E9E9E" opacity="0.4" />
        <text x="0" y="5" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Bone &amp; Organs</text>
        <line x1="0" y1="-90" x2="0" y2="-110" stroke="#2196F3" strokeWidth="2" strokeDasharray="4 2" />
        <line x1="-70" y1="0" x2="-90" y2="0" stroke="#4CAF50" strokeWidth="2" strokeDasharray="4 2" />
        <line x1="0" y1="70" x2="0" y2="90" stroke="#FF9800" strokeWidth="2" strokeDasharray="4 2" />
      </g>
      <g transform="translate(40, 40)">
        <rect x="0" y="0" width="140" height="16" rx="8" fill="#EEEEEE" />
        <rect x="0" y="0" width="35" height="16" rx="8" fill="#2196F3" />
        <rect x="35" y="0" width="35" height="16" fill="#4CAF50" />
        <rect x="70" y="0" width="35" height="16" fill="#FFC107" />
        <rect x="105" y="0" width="35" height="16" rx="8" fill="#F44336" />
        <circle cx="60" cy="8" r="10" fill="white" stroke="#4CAF50" strokeWidth="2" />
        <text x="60" y="12" fontFamily="Arial, sans-serif" fontSize="10" fill="#4CAF50" textAnchor="middle" fontWeight="bold">22</text>
        <text x="15" y="30" fontFamily="Arial, sans-serif" fontSize="8" fill="#2196F3" textAnchor="middle">Under</text>
        <text x="50" y="30" fontFamily="Arial, sans-serif" fontSize="8" fill="#4CAF50" textAnchor="middle">Normal</text>
        <text x="85" y="30" fontFamily="Arial, sans-serif" fontSize="8" fill="#FFC107" textAnchor="middle">Over</text>
        <text x="120" y="30" fontFamily="Arial, sans-serif" fontSize="8" fill="#F44336" textAnchor="middle">Obese</text>
      </g>
      <g transform="translate(200, 70)">
        <path d="M-40 -10 C-30 -20, -10 -20, 0 -10" stroke="#F44336" strokeWidth="3" fill="none" />
        <path d="M-40 -10 C-50 0, -50 20, -40 30" stroke="#F44336" strokeWidth="3" fill="none" />
        <path d="M-40 30 C-30 40, -10 40, 0 30" stroke="#F44336" strokeWidth="3" fill="none" />
        <path d="M0 30 C10 20, 10 0, 0 -10" stroke="#F44336" strokeWidth="3" fill="none" />
        <line x1="-40" y1="10" x2="-35" y2="10" stroke="#F44336" strokeWidth="2" />
        <line x1="-30" y1="10" x2="-25" y2="10" stroke="#F44336" strokeWidth="2" />
        <line x1="-20" y1="10" x2="-15" y2="10" stroke="#F44336" strokeWidth="2" />
        <line x1="-10" y1="10" x2="-5" y2="10" stroke="#F44336" strokeWidth="2" />
        <line x1="0" y1="10" x2="5" y2="10" stroke="#F44336" strokeWidth="2" />
      </g>
      <g transform="translate(40, 180)">
        <line x1="0" y1="-60" x2="0" y2="0" stroke="#9E9E9E" strokeWidth="2" />
        <line x1="-5" y1="-60" x2="5" y2="-60" stroke="#9E9E9E" strokeWidth="2" />
        <line x1="-5" y1="0" x2="5" y2="0" stroke="#9E9E9E" strokeWidth="2" />
        <text x="10" y="-30" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242">Height</text>
        <text x="10" y="-15" fontFamily="Arial, sans-serif" fontSize="14" fill="#424242" fontWeight="bold">180 cm</text>
      </g>
      <g transform="translate(140, 180)">
        <circle cx="0" cy="-20" r="20" fill="#9E9E9E" opacity="0.2" />
        <text x="0" y="-18" fontFamily="Arial, sans-serif" fontSize="14" fill="#424242" textAnchor="middle" fontWeight="bold">75</text>
        <text x="0" y="-5" fontFamily="Arial, sans-serif" fontSize="8" fill="#424242" textAnchor="middle">kg</text>
        <text x="0" y="15" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Weight</text>
      </g>
      <circle cx="40" cy="120" r="6" fill="#4CAF50">
        <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="200" cy="120" r="6" fill="#4CAF50">
        <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  ),
  
  workoutPlan: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="120" cy="120" r="120" fill="#E8F5E9" />
      <circle cx="120" cy="120" r="90" fill="white" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="120" y1="30" x2="120" y2="60" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="210" y1="120" x2="180" y2="120" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="120" y1="210" x2="120" y2="180" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="30" y1="120" x2="60" y2="120" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="165" y1="75" x2="145" y2="95" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="165" y1="165" x2="145" y2="145" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="75" y1="165" x2="95" y2="145" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="75" y1="75" x2="95" y2="95" stroke="#E0E0E0" strokeWidth="2" />
      <text x="120" y="25" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Mon</text>
      <text x="170" y="45" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Tue</text>
      <text x="215" y="120" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Wed</text>
      <text x="170" y="195" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Thu</text>
      <text x="120" y="215" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Fri</text>
      <text x="70" y="195" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Sat</text>
      <text x="25" y="120" fontFamily="Arial, sans-serif" fontSize="12" fill="#424242" textAnchor="middle">Sun</text>
      <g transform="translate(120, 80)">
        <circle cx="0" cy="0" r="15" fill="#4CAF50" opacity="0.8" />
        <rect x="-10" y="-3" width="20" height="6" rx="2" fill="white" />
        <circle cx="-12" cy="0" r="4" fill="white" />
        <circle cx="12" cy="0" r="4" fill="white" />
      </g>
      <g transform="translate(150, 110)">
        <circle cx="0" cy="0" r="15" fill="#2196F3" opacity="0.8" />
        <path d="M-5 -5 C0 -10, 5 -8, 5 -2 C5 2, 0 5, -5 5" stroke="white" strokeWidth="2" fill="none" />
        <path d="M-5 5 L-2 2 L2 8" stroke="white" strokeWidth="2" fill="none" />
      </g>
      <g transform="translate(120, 140)">
        <circle cx="0" cy="0" r="15" fill="#9E9E9E" opacity="0.8" />
        <text x="0" y="4" fontFamily="Arial, sans-serif" fontSize="16" fill="white" textAnchor="middle" fontWeight="bold">R</text>
      </g>
      <g transform="translate(90, 110)">
        <circle cx="0" cy="0" r="15" fill="#F44336" opacity="0.8" />
        <path d="M0 5 C-5 0, -10 -8, 0 -8 C10 -8, 5 0, 0 5" stroke="white" strokeWidth="2" fill="none" />
        <line x1="-5" y1="0" x2="5" y2="0" stroke="white" strokeWidth="2" />
      </g>
      <g transform="translate(40, 40)">
        <rect x="0" y="0" width="60" height="20" rx="10" fill="#4CAF50" opacity="0.9" />
        <text x="30" y="14" fontFamily="Arial, sans-serif" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">GOAL</text>
        <g transform="translate(30, 40)">
          <circle cx="0" cy="0" r="14" fill="white" stroke="#4CAF50" strokeWidth="2" />
          <circle cx="0" cy="0" r="10" fill="#4CAF50" opacity="0.4" />
          <text x="0" y="4" fontFamily="Arial, sans-serif" fontSize="10" fill="#1B5E20" textAnchor="middle" fontWeight="bold">4x</text>
        </g>
        <text x="30" y="65" fontFamily="Arial, sans-serif" fontSize="10" fill="#424242" textAnchor="middle">Weekly Target</text>
      </g>
      <g transform="translate(180, 40)">
        <rect x="0" y="0" width="30" height="10" rx="5" fill="#4CAF50" />
        <text x="35" y="8" fontFamily="Arial, sans-serif" fontSize="8" fill="#1B5E20">Strength</text>
        <rect x="0" y="15" width="30" height="10" rx="5" fill="#2196F3" />
        <text x="35" y="23" fontFamily="Arial, sans-serif" fontSize="8" fill="#0D47A1">Cardio</text>
        <rect x="0" y="30" width="30" height="10" rx="5" fill="#F44336" />
        <text x="35" y="38" fontFamily="Arial, sans-serif" fontSize="8" fill="#B71C1C">HIIT</text>
        <rect x="0" y="45" width="30" height="10" rx="5" fill="#9E9E9E" />
        <text x="35" y="53" fontFamily="Arial, sans-serif" fontSize="8" fill="#424242">Rest</text>
      </g>
      <g transform="translate(40, 180)">
        <rect x="0" y="0" width="12" height="30" fill="#E0E0E0" />
        <rect x="0" y="10" width="12" height="20" fill="#4CAF50" />
        <text x="6" y="40" fontFamily="Arial, sans-serif" fontSize="8" fill="#424242" textAnchor="middle">W1</text>
        <rect x="17" y="0" width="12" height="30" fill="#E0E0E0" />
        <rect x="17" y="5" width="12" height="25" fill="#4CAF50" />
        <text x="23" y="40" fontFamily="Arial, sans-serif" fontSize="8" fill="#424242" textAnchor="middle">W2</text>
        <rect x="34" y="0" width="12" height="30" fill="#E0E0E0" />
        <rect x="34" y="0" width="12" height="30" fill="#4CAF50" />
        <text x="40" y="40" fontFamily="Arial, sans-serif" fontSize="8" fill="#424242" textAnchor="middle">W3</text>
        <rect x="51" y="0" width="12" height="30" fill="#E0E0E0" />
        <rect x="51" y="0" width="12" height="30" fill="#4CAF50" />
        <text x="57" y="40" fontFamily="Arial, sans-serif" fontSize="8" fill="#424242" textAnchor="middle">W4</text>
        <text x="30" y="55" fontFamily="Arial, sans-serif" fontSize="10" fill="#424242" textAnchor="middle">Progress</text>
      </g>
      <circle cx="120" cy="120" r="70" stroke="#FFC107" strokeWidth="3" strokeDasharray="8 4" fill="none" opacity="0.7">
        <animateTransform 
          attributeName="transform" 
          type="rotate" 
          from="0 120 120" 
          to="360 120 120" 
          dur="60s" 
          repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="120" r="25" fill="#4CAF50" />
      <path d="M110 115 L118 123 L130 111" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="120" y="135" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle">WORKOUT</text>
    </svg>
  )
};

export type IllustrationName = keyof typeof illustrationComponents;

interface IllustrationProps {
  name: IllustrationName;
  className?: string;
  altText?: string;
  width?: number | string;
  height?: number | string;
}

/**
 * Illustration Component
 * 
 * Displays SVG illustrations with consistent styling throughout the app.
 * 
 * @param name - The name of the illustration to display
 * @param className - Additional CSS classes
 * @param altText - Alternative text for accessibility
 * @param width - Optional width override
 * @param height - Optional height override
 */
export function Illustration({ 
  name, 
  className, 
  altText,
  width = 240,
  height = 240
}: IllustrationProps) {
  const IllustrationComponent = illustrationComponents[name];
  
  if (!IllustrationComponent) {
    console.warn(`Illustration "${name}" not found.`);
    return null;
  }
  
  return (
    <div 
      className={cn("flex items-center justify-center", className)}
      role="img"
      aria-label={altText || `${name} illustration`}
    >
      <IllustrationComponent width={width} height={height} />
    </div>
  );
}