
"use client";

import type { FC } from 'react';

interface PixelClockDisplayProps {
  timeString: string;
}

const PixelClockDisplay: FC<PixelClockDisplayProps> = ({ timeString }) => {
  if (!timeString || timeString === "Loading...") {
    // Match the digital clock's loading state style
    return (
      <div className="font-code text-5xl md:text-6xl font-bold text-center text-primary tabular-nums py-8">
        Loading...
      </div>
    );
  }
  return (
    <div 
      className="font-code text-5xl md:text-6xl font-bold text-center text-primary tabular-nums py-8"
      style={{
        lineHeight: '1',
        letterSpacing: '0.05em', // Adjust for pixelated feel
      }}
    >
      {timeString.split('').map((char, index) => (
        <span key={index} className="inline-block">
          {char}
        </span>
      ))}
    </div>
  );
};

export default PixelClockDisplay;
