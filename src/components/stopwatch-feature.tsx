
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TimerIcon, Play, Pause, RotateCcw, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const RADIUS = 98;
const VIEWBOX_SIZE = 210;
const CENTER_XY = VIEWBOX_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const VISUAL_STYLES = ['arc60s', 'minimal'] as const;
type VisualStyle = typeof VISUAL_STYLES[number];

// LapEntryDisplay Component for individual lap item with animation and highlight
const LapEntryDisplay = ({ lapTime, lapNumber, isHighlighted, formatTime }: { lapTime: number, lapNumber: number, isHighlighted: boolean, formatTime: (ms: number) => string }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setIsVisible(true), 10); // Small delay for CSS transition
    return () => clearTimeout(timer);
  }, []); // Empty dependency array, runs once on mount

  return (
    <li
      className={cn(
        "flex justify-between text-sm p-1 rounded transition-all duration-300 ease-out",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4", // Slide from left and fade in
        isHighlighted ? "bg-accent/30 scale-105 shadow-md" : "bg-muted/50 shadow-sm"
      )}
    >
      <span>Lap {lapNumber}</span>
      <span className="font-mono">{formatTime(lapTime)}</span>
    </li>
  );
};


export default function StopwatchFeature() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const [currentVisualStyleIndex, setCurrentVisualStyleIndex] = useState(0);
  const currentVisualStyle = VISUAL_STYLES[currentVisualStyleIndex];
  
  const [newestLapIndex, setNewestLapIndex] = useState<number | null>(null);


  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      timerRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, time]);

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);
  
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    setNewestLapIndex(null);
  };
  
  const handleLap = () => {
    if (isRunning) {
      setLaps(prevLaps => {
        const newLaps = [...prevLaps, time];
        setNewestLapIndex(newLaps.length - 1); // Index of the just added lap
        
        // Automatically remove highlight after a short duration
        setTimeout(() => {
          setNewestLapIndex(null);
        }, 1000); // Highlight duration: 1 second
        
        return newLaps;
      });
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const calculateStrokeDashoffset = () => {
    if (currentVisualStyle === 'arc60s') {
      const currentSecondsInMinute = (time / 1000) % 60;
      const secondsProgress = currentSecondsInMinute / 60; 
      return CIRCUMFERENCE * (1 - secondsProgress);
    }
    return CIRCUMFERENCE; 
  };

  const strokeDashoffset = calculateStrokeDashoffset();

  const nextStyle = () => {
    setCurrentVisualStyleIndex((prevIndex) => (prevIndex + 1) % VISUAL_STYLES.length);
  };

  const prevStyle = () => {
    setCurrentVisualStyleIndex((prevIndex) => (prevIndex - 1 + VISUAL_STYLES.length) % VISUAL_STYLES.length);
  };
  
  const getVisualStyleName = (style: VisualStyle) => {
    switch(style) {
      case 'arc60s': return '60s Arc';
      case 'minimal': return 'Minimal';
      default: 
        const _exhaustiveCheck: never = style;
        return '';
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Stopwatch</CardTitle>
        <div className="flex items-center gap-2">
           <span className="text-sm text-muted-foreground">{getVisualStyleName(currentVisualStyle)}</span>
           <TimerIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center space-x-1 sm:space-x-2 my-4">
          <Button variant="ghost" size="icon" onClick={prevStyle} aria-label="Previous visual style">
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          
          <div className="relative flex justify-center items-center w-48 h-48 sm:w-60 sm:h-60">
            {currentVisualStyle === 'arc60s' && (
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
                <circle
                  className="stroke-muted/30"
                  strokeWidth="8"
                  fill="transparent"
                  r={RADIUS}
                  cx={CENTER_XY}
                  cy={CENTER_XY}
                />
                <circle
                  className="stroke-accent"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r={RADIUS}
                  cx={CENTER_XY}
                  cy={CENTER_XY}
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: strokeDashoffset,
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center',
                    transition: 'stroke-dashoffset 0.1s linear' // Smoother transition for arc
                  }}
                />
              </svg>
            )}
            <div className={cn(
              "text-4xl sm:text-5xl font-bold tabular-nums font-headline z-10 text-primary"
            )}>
              {formatTime(time)}
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={nextStyle} aria-label="Next visual style">
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
        
        <div className="flex justify-center space-x-2 mb-6">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Play className="mr-2 h-5 w-5" /> Start
            </Button>
          ) : (
            <Button onClick={handleStop} variant="outline" size="lg">
              <Pause className="mr-2 h-5 w-5" /> Stop
            </Button>
          )}
          <Button onClick={handleLap} variant="secondary" size="lg" disabled={!isRunning && time === 0}>
            <Flag className="mr-2 h-5 w-5" /> Lap
          </Button>
          <Button onClick={handleReset} variant="destructive" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
        </div>
        {laps.length > 0 && (
          <>
            <Separator className="my-4" />
            <h3 className="text-lg font-medium mb-2 text-center font-headline">Laps</h3>
            <ScrollArea className="h-40 w-full rounded-md border p-2">
              <ul className="space-y-1">
                {laps.map((lapTime, index) => (
                  <LapEntryDisplay
                    key={`${lapTime}-${index}`} // Using index for key as laps are append-only here
                    lapTime={lapTime}
                    lapNumber={index + 1}
                    isHighlighted={index === newestLapIndex}
                    formatTime={formatTime}
                  />
                ))}
              </ul>
            </ScrollArea>
          </>
        )}
      </CardContent>
      <CardFooter>
         <p className="text-xs text-center text-muted-foreground w-full">
          Track your time with precision. Use arrows to change visual style.
        </p>
      </CardFooter>
    </Card>
  );
}

