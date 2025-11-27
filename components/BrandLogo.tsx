import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  variant?: 'outline' | 'fill';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 32, className = "", variant = 'outline' }) => {
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
        d="M12.0002 20.5502L10.5502 19.2302C5.40019 14.5702 2.00019 11.4802 2.00019 7.69019C2.00019 4.60019 4.42019 2.18019 7.50019 2.18019C9.24019 2.18019 10.9102 2.99019 12.0002 4.27019C13.0902 2.99019 14.7602 2.18019 16.5002 2.18019C19.5802 2.18019 22.0002 4.60019 22.0002 7.69019C22.0002 11.4802 18.6002 14.5702 13.4502 19.2402L12.0002 20.5502Z"
        fill={variant === 'fill' ? "currentColor" : "none"}
        stroke={variant === 'outline' ? "currentColor" : "none"}
        strokeWidth={variant === 'outline' ? "2.5" : "0"} 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BrandLogo;