
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
      className="font-code text-5xl md:text-6xl font-bold text-center text-primary tabular-nums py-8 subpixel-antialiased"
      style={{
        lineHeight: '1',
        letterSpacing: '0.1em', // Increased for a more "blocky" feel
        fontVariantLigatures: 'none', // Disable ligatures to keep characters distinct
        imageRendering: 'pixelated', // Hint for sharper, pixel-like rendering
        // The following are for broader compatibility for crisp rendering, React handles vendor prefixes if needed for standard properties
        // For non-standard ones, direct CSS or specific class might be better, but 'pixelated' is standard.
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
