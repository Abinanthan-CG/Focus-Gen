
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TimerIcon, Play, Pause, RotateCcw, Flag } from 'lucide-react';

const RADIUS = 90; // Radius of the progress circle
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StopwatchFeature() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      timerRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10); // Update every 10ms for smoother display
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
  };
  
  const handleLap = () => {
    if (isRunning) {
      setLaps(prevLaps => [...prevLaps, time]);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const currentSecondsInMinute = (time / 1000) % 60; // Seconds part of the current minute (0-59.99...)
  const secondsProgress = currentSecondsInMinute / 60; // Progress of the current minute (0 to 1)
  const strokeDashoffset = CIRCUMFERENCE * (1 - secondsProgress);

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Stopwatch</CardTitle>
        <TimerIcon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="relative flex justify-center items-center w-56 h-56 mx-auto my-4">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            {/* Background track for the circle */}
            <circle
              className="stroke-muted/30"
              strokeWidth="8"
              fill="transparent"
              r={RADIUS}
              cx="100"
              cy="100"
            />
            {/* Progress arc */}
            <circle
              className="stroke-accent"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r={RADIUS}
              cx="100"
              cy="100"
              style={{
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: strokeDashoffset,
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                transition: 'stroke-dashoffset 0.01s linear' 
              }}
            />
          </svg>
          <div className="text-5xl font-bold text-primary tabular-nums font-headline z-10">
            {formatTime(time)}
          </div>
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
                  <li key={index} className="flex justify-between text-sm p-1 bg-muted/50 rounded">
                    <span>Lap {index + 1}</span>
                    <span className="font-mono">{formatTime(lapTime)}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </>
        )}
      </CardContent>
      <CardFooter>
         <p className="text-xs text-center text-muted-foreground w-full">
          Track your time with precision.
        </p>
      </CardFooter>
    </Card>
  );
}
