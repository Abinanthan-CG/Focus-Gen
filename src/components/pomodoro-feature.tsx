
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CoffeeIcon, Play, Pause, RotateCcw, SkipForward, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import PixelTomatoDisplay from './pixel-tomato-display';

type SessionType = 'work' | 'shortBreak' | 'longBreak';
const VISUAL_STYLES_POMODORO = ['classic', 'pixel-tomato'] as const;
type VisualStylePomodoro = typeof VISUAL_STYLES_POMODORO[number];

export default function PomodoroFeature() {
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [shortBreakDuration, setShortBreakDuration] = useState(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionType>('work');
  const [completedCycles, setCompletedCycles] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const [currentVisualStyleIndex, setCurrentVisualStyleIndex] = useState(0);
  const currentVisualStyle = VISUAL_STYLES_POMODORO[currentVisualStyleIndex];

  const getSessionName = useCallback((session: SessionType) => {
    if (session === 'work') return 'Work Focus';
    if (session === 'shortBreak') return 'Short Break';
    return 'Long Break';
  }, []);

  const [displayedSessionTitle, setDisplayedSessionTitle] = useState(getSessionName(currentSession));
  const [titleOpacity, setTitleOpacity] = useState(1);

  useEffect(() => {
    setTitleOpacity(0);
    const timeoutId = setTimeout(() => {
      setDisplayedSessionTitle(getSessionName(currentSession));
      setTitleOpacity(1);
    }, 300); 
    return () => clearTimeout(timeoutId);
  }, [currentSession, getSessionName]);

  const updateTimerSettings = useCallback(() => {
    if (currentSession === 'work') setTimeLeft(workDuration);
    else if (currentSession === 'shortBreak') setTimeLeft(shortBreakDuration);
    else if (currentSession === 'longBreak') setTimeLeft(longBreakDuration);
  }, [currentSession, workDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if (!isRunning) {
      updateTimerSettings();
    }
  }, [workDuration, shortBreakDuration, longBreakDuration, cyclesBeforeLongBreak, currentSession, isRunning, updateTimerSettings]);

  const handleSessionEnd = useCallback(() => {
    setIsRunning(false);
    let nextSession: SessionType;
    let cycles = completedCycles;

    if (currentSession === 'work') {
      cycles++;
      setCompletedCycles(cycles);
      if (cycles > 0 && cycles % cyclesBeforeLongBreak === 0) {
        nextSession = 'longBreak';
      } else {
        nextSession = 'shortBreak';
      }
      toast({ title: "Work Session Over!", description: `Time for a ${getSessionName(nextSession)}.`});
    } else { 
      nextSession = 'work';
      toast({ title: "Break Over!", description: "Time to get back to work."});
    }
    
    setCurrentSession(nextSession);
  }, [currentSession, completedCycles, cyclesBeforeLongBreak, toast, getSessionName]);
  
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleSessionEnd();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, handleSessionEnd]);
  
  useEffect(() => {
    if (!isRunning) {
      if (currentSession === 'work') setTimeLeft(workDuration);
      else if (currentSession === 'shortBreak') setTimeLeft(shortBreakDuration);
      else if (currentSession === 'longBreak') setTimeLeft(longBreakDuration);
    }
  }, [currentSession, workDuration, shortBreakDuration, longBreakDuration, isRunning]);

  const handleStartPause = () => setIsRunning(prev => !prev);
  
  const handleReset = () => {
    setIsRunning(false);
    setCurrentSession('work');
    setCompletedCycles(0);
    setTimeLeft(workDuration);
  };

  const handleSkip = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleSessionEnd();
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getInitialDuration = () => {
    if (currentSession === 'work') return workDuration;
    if (currentSession === 'shortBreak') return shortBreakDuration;
    return longBreakDuration;
  };

  const progress = (timeLeft / getInitialDuration()) * 100;

  const timeDisplayColor = currentSession === 'work' ? 'text-primary' : 'text-accent';
  const progressBarColorClass = currentSession === 'work' ? '[&>div]:bg-primary' : '[&>div]:bg-accent';

  const renderCycleIndicators = () => {
    const indicators = [];
    let filledCount = 0;

    if (currentSession === 'work') {
      filledCount = completedCycles % cyclesBeforeLongBreak;
    } else if (currentSession === 'shortBreak') {
      filledCount = completedCycles % cyclesBeforeLongBreak;
    } else if (currentSession === 'longBreak') {
      filledCount = cyclesBeforeLongBreak; // All filled during/after long break
    }

    for (let i = 0; i < cyclesBeforeLongBreak; i++) {
      indicators.push(
        <Circle
          key={i}
          className={cn(
            "h-3 w-3 transition-colors duration-300",
            i < filledCount ? (currentSession === 'work' || currentSession === 'longBreak' ? "fill-primary text-primary" : "fill-accent text-accent") : "fill-muted text-muted"
          )}
        />
      );
    }
    return <div className="flex flex-col space-y-1.5">{indicators}</div>;
  };

  const nextStyle = () => {
    setCurrentVisualStyleIndex((prevIndex) => (prevIndex + 1) % VISUAL_STYLES_POMODORO.length);
  };

  const prevStyle = () => {
    setCurrentVisualStyleIndex((prevIndex) => (prevIndex - 1 + VISUAL_STYLES_POMODORO.length) % VISUAL_STYLES_POMODORO.length);
  };

  const getVisualStyleNamePomodoro = (style: VisualStylePomodoro) => {
    switch(style) {
      case 'classic': return 'Classic';
      case 'pixel-tomato': return 'Pixel Tomato';
      default: 
        const _exhaustiveCheck: never = style;
        return '';
    }
  };

  const initialDurationForCurrentSession = getInitialDuration();

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Pomodoro Timer</CardTitle>
        <div className="flex items-center gap-2">
           <span className="text-sm text-muted-foreground">{getVisualStyleNamePomodoro(currentVisualStyle)}</span>
           <CoffeeIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="timer">
            <div className="text-center mb-4">
                <p 
                    className="text-xl font-semibold font-headline transition-opacity duration-300 ease-in-out"
                    style={{ opacity: titleOpacity }}
                >
                    {displayedSessionTitle}
                </p>
            </div>

            <div className="flex items-center justify-center gap-2 my-4">
                <Button variant="ghost" size="icon" onClick={prevStyle} aria-label="Previous visual style">
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                
                <div className="flex flex-col items-center">
                    {currentVisualStyle === 'classic' && (
                        <div className="w-full flex flex-col items-center">
                            <div 
                            key={currentSession + "-time-classic"} 
                            className={cn(
                                "text-7xl font-bold text-center py-8 tabular-nums font-headline",
                                timeDisplayColor
                            )}
                            >
                            {formatTime(timeLeft)}
                            </div>
                            <Progress 
                            value={isRunning ? 100 - progress : 100} 
                            className={cn("mb-6 h-3 w-56", progressBarColorClass)} 
                            />
                        </div>
                    )}

                    {currentVisualStyle === 'pixel-tomato' && (
                        <div className="flex flex-col items-center">
                            <div 
                                key={currentSession + "-time-pixel"} 
                                className={cn(
                                    "text-5xl font-bold text-center py-2 tabular-nums font-headline",
                                    timeDisplayColor
                                )}
                                >
                                {formatTime(timeLeft)}
                            </div>
                            <PixelTomatoDisplay 
                                timeLeft={timeLeft} 
                                initialDuration={initialDurationForCurrentSession} 
                                sessionType={currentSession} 
                            />
                        </div>
                    )}
                </div>
                
                <Button variant="ghost" size="icon" onClick={nextStyle} aria-label="Next visual style">
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>

                {currentVisualStyle === 'classic' && (
                  <div className="pl-4"> 
                    {renderCycleIndicators()}
                  </div>
                )}
            </div>

            <div className="flex justify-center space-x-2 mt-6">
              <Button onClick={handleStartPause} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={handleSkip} variant="secondary" size="lg" title="Skip to next session">
                <SkipForward className="mr-2 h-5 w-5" /> Skip
              </Button>
              <Button onClick={handleReset} variant="destructive" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" /> Reset
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <Label htmlFor="workDuration">Work Duration (minutes)</Label>
                <Input id="workDuration" type="number" min="1" value={workDuration / 60} onChange={e => setWorkDuration(Math.max(1, parseInt(e.target.value) || 1) * 60)} disabled={isRunning} />
              </div>
              <div>
                <Label htmlFor="shortBreakDuration">Short Break (minutes)</Label>
                <Input id="shortBreakDuration" type="number" min="1" value={shortBreakDuration / 60} onChange={e => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1) * 60)} disabled={isRunning} />
              </div>
              <div>
                <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                <Input id="longBreakDuration" type="number" min="1" value={longBreakDuration / 60} onChange={e => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 1) * 60)} disabled={isRunning} />
              </div>
              <div>
                <Label htmlFor="cycles">Cycles before Long Break</Label>
                <Input id="cycles" type="number" min="1" value={cyclesBeforeLongBreak} onChange={e => setCyclesBeforeLongBreak(Math.max(1, parseInt(e.target.value) || 1))} disabled={isRunning} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
       <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          {currentVisualStyle === 'pixel-tomato' ? "Watch the tomato! " : ""}
          Boost productivity with focused intervals. Use arrows to change style.
        </p>
      </CardFooter>
    </Card>
  );
}
