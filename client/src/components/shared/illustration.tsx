import React from "react";

export type IllustrationName = "welcome" | "bodyComposition" | "workoutPlan" | "progress";

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  name: IllustrationName;
}

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
    </svg>
  ),

  bodyComposition: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="120" cy="120" r="120" fill="#E8F5E9" />
      <rect x="80" y="40" width="80" height="160" rx="40" fill="#F5F5F5" />
      <circle cx="120" cy="120" r="50" fill="#4CAF50" opacity="0.2" />
      <path d="M120 70 L120 170" stroke="#9E9E9E" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M70 120 L170 120" stroke="#9E9E9E" strokeWidth="2" strokeDasharray="5 5" />
      <g transform="translate(120, 20)">
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
      <rect x="40" y="60" width="160" height="120" rx="10" fill="#F5F5F5" />
      <g transform="translate(70, 90)">
        <circle cx="0" cy="0" r="20" fill="#4CAF50" opacity="0.3" />
        <text x="0" y="5" fontFamily="Arial, sans-serif" fontSize="14" fill="#424242" textAnchor="middle" fontWeight="bold">M</text>
      </g>
      <g transform="translate(120, 90)">
        <circle cx="0" cy="0" r="20" fill="#4CAF50" opacity="0.6" />
        <text x="0" y="5" fontFamily="Arial, sans-serif" fontSize="14" fill="#424242" textAnchor="middle" fontWeight="bold">T</text>
      </g>
      <g transform="translate(170, 90)">
        <circle cx="0" cy="0" r="20" fill="#4CAF50" opacity="0.3" />
        <text x="0" y="5" fontFamily="Arial, sans-serif" fontSize="14" fill="#424242" textAnchor="middle" fontWeight="bold">W</text>
      </g>
      <g transform="translate(70, 140)">
        <circle cx="0" cy="0" r="20" fill="#4CAF50" opacity="0.3" />
        <text x="0" y="5" fontFamily="Arial, sans-serif" fontSize="14" fill="#424242" textAnchor="middle" fontWeight="bold">T</text>
      </g>
      <g transform="translate(120, 140)">
        <circle cx="0" cy="0" r="20" fill="#4CAF50" opacity="0.6" />
        <text x="0" y="5" fontFamily="Arial, sans-serif" fontSize="14" fill="#424242" textAnchor="middle" fontWeight="bold">F</text>
      </g>
      <g transform="translate(170, 140)">
        <circle cx="0" cy="0" r="20" fill="#4CAF50" opacity="0.3" />
        <text x="0" y="5" fontFamily="Arial, sans-serif" fontSize="14" fill="#424242" textAnchor="middle" fontWeight="bold">S</text>
      </g>
      <path d="M40 50 L40 190" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M200 50 L200 190" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  ),

  progress: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="120" cy="120" r="120" fill="#E8F5E9" />
      <path d="M40 180 L200 180" stroke="#9E9E9E" strokeWidth="2" />
      <path d="M40 180 L40 60" stroke="#9E9E9E" strokeWidth="2" />
      <path d="M40 180 L60 160 L80 150 L100 160 L120 130 L140 110 L160 90 L180 85 L200 60" 
            stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 180 L60 170 L80 165 L100 170 L120 150 L140 145 L160 135 L180 130 L200 120" 
            stroke="#FF9800" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="160" r="4" fill="#4CAF50" />
      <circle cx="120" cy="130" r="4" fill="#4CAF50" />
      <circle cx="180" cy="85" r="4" fill="#4CAF50" />
      <circle cx="60" cy="170" r="4" fill="#FF9800" />
      <circle cx="120" cy="150" r="4" fill="#FF9800" />
      <circle cx="180" cy="130" r="4" fill="#FF9800" />
      <text x="30" y="60" fontFamily="Arial, sans-serif" fontSize="10" fill="#9E9E9E" textAnchor="end">80kg</text>
      <text x="30" y="120" fontFamily="Arial, sans-serif" fontSize="10" fill="#9E9E9E" textAnchor="end">70kg</text>
      <text x="30" y="180" fontFamily="Arial, sans-serif" fontSize="10" fill="#9E9E9E" textAnchor="end">60kg</text>
      <text x="60" y="195" fontFamily="Arial, sans-serif" fontSize="10" fill="#9E9E9E" textAnchor="middle">Jan</text>
      <text x="120" y="195" fontFamily="Arial, sans-serif" fontSize="10" fill="#9E9E9E" textAnchor="middle">Mar</text>
      <text x="180" y="195" fontFamily="Arial, sans-serif" fontSize="10" fill="#9E9E9E" textAnchor="middle">May</text>
    </svg>
  )
};

export const Illustration: React.FC<IllustrationProps> = ({ name, ...props }) => {
  const IllustrationComponent = illustrationComponents[name];
  if (!IllustrationComponent) {
    console.error(`Illustration "${name}" not found`);
    return null;
  }
  return <IllustrationComponent {...props} />;
};