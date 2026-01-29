import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  variant?: 'outline' | 'fill';
}

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 32, className = "", variant = 'outline' }) => {
  // Default to brand-violet if no text color class is provided, but allow overrides
  const defaultColorClass = className.includes('text-') ? '' : 'text-brand-violet';
  const combinedClassName = `${defaultColorClass} ${className}`.trim();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={combinedClassName}
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={variant === 'fill' ? "currentColor" : "none"}
        stroke={variant === 'outline' ? "currentColor" : "none"}
        strokeWidth={variant === 'outline' ? "2" : "0"} 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BrandLogo;
