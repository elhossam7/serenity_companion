import React from 'react';

const CulturalPatternBackground = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Islamic Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="islamic-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              {/* Star Pattern */}
              <g fill="currentColor" className="text-primary">
                <path d="M20 5 L25 15 L35 15 L27.5 22.5 L30 32.5 L20 27.5 L10 32.5 L12.5 22.5 L5 15 L15 15 Z" />
                <circle cx="20" cy="20" r="2" />
              </g>
              
              {/* Connecting Lines */}
              <g stroke="currentColor" strokeWidth="0.5" fill="none" className="text-secondary">
                <path d="M0 20 L40 20" />
                <path d="M20 0 L20 40" />
                <path d="M5 5 L35 35" />
                <path d="M35 5 L5 35" />
              </g>
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      {/* Subtle Border Pattern */}
      <div className="absolute inset-0 border border-border rounded-xl opacity-30 pointer-events-none">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
        <div className="absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
        <div className="absolute right-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default CulturalPatternBackground;