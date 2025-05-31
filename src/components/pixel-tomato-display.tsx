
"use client";

import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface PixelTomatoDisplayProps {
  timeLeft: number;
  initialDuration: number;
  sessionType: 'work' | 'shortBreak' | 'longBreak';
}

const GRID_SIZE = 10; // 10x10 grid

// 0: empty, 1: tomato body, 2: leaf
const TOMATO_SHAPE = [
  [0,0,0,0,2,2,0,0,0,0], // Leaf
  [0,0,0,1,1,1,1,0,0,0], // Top of tomato body
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,0,0,0], 
];

const totalBodyPixels = TOMATO_SHAPE.flat().filter(p => p === 1).length;

const PixelTomatoDisplay: FC<PixelTomatoDisplayProps> = ({ timeLeft, initialDuration, sessionType }) => {
  const progress = initialDuration > 0 ? timeLeft / initialDuration : 0;
  const pixelsToFillForBody = Math.ceil(progress * totalBodyPixels);
  let filledBodyPixelCount = 0;

  const erasedPixelColorClass = 'bg-muted/20';

  return (
    <div className="flex flex-col items-center my-4">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {TOMATO_SHAPE.map((row, rowIndex) =>
          row.map((pixelValue, colIndex) => {
            let cellClass = 'bg-transparent';

            if (pixelValue === 1) { // Tomato Body pixel
              filledBodyPixelCount++;
              if (filledBodyPixelCount <= pixelsToFillForBody) {
                cellClass = sessionType === 'work' ? 'bg-destructive' : 'bg-accent';
              } else {
                cellClass = erasedPixelColorClass;
              }
            } else if (pixelValue === 2) { // Leaf pixel
              cellClass = 'bg-accent'; // Leaf is always accent color
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-colors duration-300",
                  cellClass
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
