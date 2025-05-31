
"use client";

import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface PixelTomatoDisplayProps {
  timeLeft: number;
  initialDuration: number;
  sessionType: 'work' | 'shortBreak' | 'longBreak';
}

const GRID_SIZE = 10; // 10x10 grid

// Simple representation of a tomato shape
const TOMATO_SHAPE = [
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
];

const totalActivePixels = TOMATO_SHAPE.flat().reduce((sum, pixel) => sum + pixel, 0);

const PixelTomatoDisplay: FC<PixelTomatoDisplayProps> = ({ timeLeft, initialDuration, sessionType }) => {
  const progress = initialDuration > 0 ? timeLeft / initialDuration : 0;
  const pixelsToShow = Math.ceil(progress * totalActivePixels);

  let currentShownPixelCount = 0;

  const pixelColorClass = sessionType === 'work' ? 'bg-primary' : 'bg-accent';
  const erasedPixelColorClass = 'bg-muted/20';

  return (
    <div className="flex flex-col items-center my-4">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {TOMATO_SHAPE.map((row, rowIndex) =>
          row.map((isPixelActive, colIndex) => {
            let showThisPixel = false;
            if (isPixelActive) {
              currentShownPixelCount++;
              if (currentShownPixelCount <= pixelsToShow) {
                showThisPixel = true;
              }
            }
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-colors duration-300",
                  isPixelActive && showThisPixel ? pixelColorClass : (isPixelActive ? erasedPixelColorClass : 'bg-transparent')
                )}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default PixelTomatoDisplay;
