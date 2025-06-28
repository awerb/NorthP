import React from 'react';

interface LogoProps {
  className?: string;
}

const NorthpointLogo: React.FC<LogoProps> = ({ className = "h-10 w-auto" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Northpoint logo mark - precise recreation of actual design */}
      <svg
        viewBox="0 0 100 100"
        className="h-12 w-12 mr-4"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main geometric shape - more angular and pointing upward */}
        <path
          d="M50 10 L75 40 L62 40 L62 60 L52 60 L52 40 L38 40 L38 60 L28 60 L28 40 L15 40 L40 15 L50 10 Z"
          fill="#4F46E5"
        />
        {/* Secondary geometric elements */}
        <path
          d="M38 60 L52 60 L52 75 L45 82 L38 75 L38 60 Z"
          fill="#6366F1"
        />
        <path
          d="M28 40 L38 40 L38 60 L28 60 L28 40 Z"
          fill="#3B82F6"
        />
        <path
          d="M52 40 L62 40 L62 60 L52 60 L52 40 Z"
          fill="#3B82F6"
        />
      </svg>
      
      {/* Text logo with exact Northpoint typography */}
      <div className="flex items-center">
        <span className="text-3xl font-black text-black tracking-tight leading-none font-brand">
          Northpoint
        </span>
        <div className="mx-4 h-10 w-px bg-gray-400"></div>
        <span className="text-xl font-normal text-gray-700 tracking-wide font-brand">
          Trial Law
        </span>
      </div>
    </div>
  );
};

export default NorthpointLogo;
