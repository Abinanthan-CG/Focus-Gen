"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { HourglassIcon, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const PRESETS = [
  { label: "5 Min", seconds: 5 * 60 },
  { label: "10 Min", seconds: 10 * 60 },
  { label: "15 Min", seconds: 15 * 60 },
  { label: "30 Min", seconds: 30 * 60 },
];

export default function CountdownFeature() {
  const [initialTime, setInitialTime] = useState(5 * 60); // seconds
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [hoursInput, setHoursInput] = useState("0");
  const [minutesInput, setMinutesInput] = useState("5");
  const [secondsInput, setSecondsInput] = useState("0");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const calculateTotalSeconds = useCallback(() => {
    const h = parseInt(hoursInput, 10) || 0;
    const m = parseInt(minutesInput, 10) || 0;
    const s = parseInt(secondsInput, 10) || 0;
    return h * 3600 + m * 60 + s;
  }, [hoursInput, minutesInput, secondsInput]);

  useEffect(() => {
    const totalSeconds = calculateTotalSeconds();
    if (!isRunning) {
      setInitialTime(totalSeconds);
      setTimeLeft(totalSeconds);
    }
  }, [hoursInput, minutesInput, secondsInput, isRunning, calculateTotalSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      toast({
        title: "Countdown Finished!",
        description: "Your timer has reached zero.",
        variant: "default", 
      });
      // Here you could add an audible alert if desired
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, toast]);

  const handleStart = () => {
    const totalSeconds = calculateTotalSeconds();
    if (totalSeconds <= 0) {
      toast({ title: "Invalid Time", description: "Please set a duration greater than 0.", variant: "destructive" });
      return;
    }
    setInitialTime(totalSeconds);
    setTimeLeft(totalSeconds);
    setIsRunning(true);
    setIsFinished(false);
  };
  
  const handlePause = () => setIsRunning(false);
  
  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    const totalSeconds = calculateTotalSeconds();
    setInitialTime(totalSeconds);
    setTimeLeft(totalSeconds);
  };

  const setPreset = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    setHoursInput(h.toString());
    setMinutesInput(m.toString());
    setSecondsInput(s.toString());
    if (!isRunning) {
      setInitialTime(seconds);
      setTimeLeft(seconds);
    }
    setIsFinished(false);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Countdown Timer</CardTitle>
        <HourglassIcon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-6xl font-bold text-center py-8 text-primary tabular-nums font-headline">
          {formatTime(timeLeft)}
        </div>
        <Progress value={isRunning || isFinished ? 100 - progress : 100} className="mb-6 h-3 [&>div]:bg-accent" />
        
        {!isRunning && !isFinished && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input id="hours" type="number" min="0" value={hoursInput} onChange={e => setHoursInput(e.target.value)} placeholder="HH" />
            </div>
            <div>
              <Label htmlFor="minutes">Minutes</Label>
              <Input id="minutes" type="number" min="0" max="59" value={minutesInput} onChange={e => setMinutesInput(e.target.value)} placeholder="MM" />
            </div>
            <div>
              <Label htmlFor="seconds">Seconds</Label>
              <Input id="seconds" type="number" min="0" max="59" value={secondsInput} onChange={e => setSecondsInput(e.target.value)} placeholder="SS" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {PRESETS.map(preset => (
            <Button key={preset.label} variant="outline" onClick={() => setPreset(preset.seconds)} disabled={isRunning}>
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={timeLeft <=0 && !isFinished}>
              <Play className="mr-2 h-5 w-5" /> Start
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline" size="lg">
              <Pause className="mr-2 h-5 w-5" /> Pause
            </Button>
          )}
          <Button onClick={handleReset} variant="destructive" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
        </div>
        {isFinished && (
          <p className="mt-4 text-center text-lg font-semibold text-destructive">Time's up!</p>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          Set a timer for focused work sessions or breaks.
        </p>
      </CardFooter>
    </Card>
  );
}
