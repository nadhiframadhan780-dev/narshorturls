import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
      role="banner"
    >
      {/* Luxury Interlocking Rings / Link SVG Icon */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Background subtle luxury badge */}
          <rect width="36" height="36" rx="10" fill="#3730A3" />
          {/* First loop (Soft Gold #C9A24B) */}
          <path
            d="M13 18C13 15.2386 15.2386 13 18 13H21C23.7614 13 26 15.2386 26 18C26 20.7614 23.7614 23 21 23H18"
            stroke="#C9A24B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Second interlocking loop (Pure Cream / Crisp White) */}
          <path
            d="M23 18C23 20.7614 20.7614 23 18 23H15C12.2386 23 10 20.7614 10 18C10 15.2386 12.2386 13 15 13H18"
            stroke="#FAF8F5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Central Gold Accent Node */}
          <circle cx="18" cy="18" r="1.8" fill="#C9A24B" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className={`font-semibold tracking-tight text-[#0F172A] flex items-baseline gap-0.5 ${textSizes[size]}`}>
          <span className="font-bold tracking-tight">narshort</span>
          <span className="text-[#C9A24B] font-bold">.</span>
          <span className="text-[#3730A3] font-semibold">url</span>
        </div>
        {showTagline && (
          <span className="text-xs text-slate-500 font-medium tracking-wide -mt-0.5">
            Pendekkan link, perluas jangkauan.
          </span>
        )}
      </div>
    </div>
  );
};
