import React from 'react';

interface LogoProps {
  className?: string;
}

const NorthpointLogo: React.FC<LogoProps> = ({ className = "h-10 w-auto" }) => {
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stylized "N" for Northpoint */}
      <path
        d="M10 10 L10 50 L20 50 L20 25 L35 50 L45 50 L45 10 L35 10 L35 35 L20 10 L10 10 Z"
        fill="#2355FF"
        stroke="#2355FF"
        strokeWidth="1"
      />
      
      {/* Legal scale/balance icon */}
      <g transform="translate(55, 15)">
        <circle cx="15" cy="15" r="3" fill="#2355FF" />
        <line x1="15" y1="18" x2="15" y2="30" stroke="#2355FF" strokeWidth="2" />
        <line x1="5" y1="25" x2="25" y2="25" stroke="#2355FF" strokeWidth="2" />
        <path d="M3 23 L3 27 L7 27 L7 23 Z" fill="none" stroke="#2355FF" strokeWidth="1.5" />
        <path d="M23 23 L23 27 L27 27 L27 23 Z" fill="none" stroke="#2355FF" strokeWidth="1.5" />
      </g>
      
      {/* Company name text */}
      <text x="90" y="25" fontFamily="Instrument Sans, sans-serif" fontSize="16" fontWeight="600" fill="#000000">
        NORTHPOINT
      </text>
      <text x="90" y="42" fontFamily="Instrument Sans, sans-serif" fontSize="12" fontWeight="400" fill="#666666">
        TRIAL LAW
      </text>
    </svg>
  );
};

export default NorthpointLogo;
