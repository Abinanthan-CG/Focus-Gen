
"use client";

import type { FC } from 'react';

interface AnalogClockDisplayProps {
  date: Date;
}

const AnalogClockDisplay: FC<AnalogClockDisplayProps> = ({ date }) => {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours();

  const secondDeg = (seconds / 60) * 360 + 90; // +90 to offset initial 0 deg pointing right
  const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6 + 90;
  const hourDeg = (hours / 12) * 360 + (minutes / 60) * 30 + 90;

  return (
    <div className="w-56 h-56 md:w-64 md:h-64 relative">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Clock Face */}
        <circle cx="100" cy="100" r="95" className="fill-background stroke-primary" strokeWidth="4" />
        
        {/* Center Dot */}
        <circle cx="100" cy="100" r="5" className="fill-primary" />

        {/* Hour Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="50"
          className="stroke-foreground"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ transformOrigin: '100px 100px', transform: `rotate(${hourDeg}deg)` }}
        />
        
        {/* Minute Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          className="stroke-foreground"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ transformOrigin: '100px 100px', transform: `rotate(${minuteDeg}deg)` }}
        />

        {/* Second Hand */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="20"
          className="stroke-accent"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transformOrigin: '100px 100px', transform: `rotate(${secondDeg}deg)` }}
        />
         {/* Hour Markers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180); // 30 degrees per hour
          const x1 = 100 + 80 * Math.cos(angle);
          const y1 = 100 + 80 * Math.sin(angle);
          const x2 = 100 + 90 * Math.cos(angle);
          const y2 = 100 + 90 * Math.sin(angle);
          return (
            <line
              key={`hour-marker-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-muted-foreground"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default AnalogClockDisplay;
