import React from 'react';
import logoFull from '../assets/Northpoint Logo-01 copy.png';
import logoIcon from '../assets/Northpoint Logo-05.png';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

const NorthpointLogo: React.FC<LogoProps> = ({ 
  className = "", 
  variant = 'full', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  if (variant === 'icon') {
    return (
      <img
        src={logoIcon}
        alt="Northpoint Trial Law"
        className={`${sizeClasses[size]} w-auto ${className}`}
      />
    );
  }

  // Use the full logo with company name for the 'full' variant
  return (
    <img
      src={logoFull}
      alt="Northpoint Trial Law"
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
};

export default NorthpointLogo;
