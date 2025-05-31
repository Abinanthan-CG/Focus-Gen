"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CoffeeIcon, Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SessionType = 'work' | 'shortBreak' | 'longBreak';

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
  }, [isRunning, timeLeft]);

  const handleSessionEnd = () => {
    setIsRunning(false);
    let nextSession: SessionType;
    let cycles = completedCycles;

    if (currentSession === 'work') {
      cycles++;
      setCompletedCycles(cycles);
      if (cycles % cyclesBeforeLongBreak === 0) {
        nextSession = 'longBreak';
      } else {
        nextSession = 'shortBreak';
      }
      toast({ title: "Work Session Over!", description: `Time for a ${nextSession === 'longBreak' ? 'long' : 'short'} break.`});
    } else { // currentSession is 'shortBreak' or 'longBreak'
      nextSession = 'work';
      toast({ title: "Break Over!", description: "Time to get back to work."});
    }
    
    setCurrentSession(nextSession);
    // TimeLeft will be updated by the useEffect watching currentSession and durations
  };
  
  // Effect to update timeLeft when session changes and not running
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
    //setIsRunning(true); // Optionally auto-start next session
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

  const getSessionName = (session: SessionType) => {
    if (session === 'work') return 'Work';
    if (session === 'shortBreak') return 'Short Break';
    return 'Long Break';
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Pomodoro Timer</CardTitle>
        <CoffeeIcon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="timer">
            <div className="text-center mb-4">
              <p className="text-xl font-semibold text-accent font-headline">{getSessionName(currentSession)}</p>
              <p className="text-sm text-muted-foreground">Completed Cycles: {completedCycles}</p>
            </div>
            <div className="text-7xl font-bold text-center py-8 text-primary tabular-nums font-headline">
              {formatTime(timeLeft)}
            </div>
            <Progress value={isRunning ? 100 - progress : 100} className="mb-6 h-3 [&>div]:bg-accent" />
            <div className="flex justify-center space-x-2">
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
                <Input id="workDuration" type="number" min="1" value={workDuration / 60} onChange={e => setWorkDuration(parseInt(e.target.value) * 60)} disabled={isRunning} />
              </div>
              <div>
                <Label htmlFor="shortBreakDuration">Short Break (minutes)</Label>
                <Input id="shortBreakDuration" type="number" min="1" value={shortBreakDuration / 60} onChange={e => setShortBreakDuration(parseInt(e.target.value) * 60)} disabled={isRunning} />
              </div>
              <div>
                <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                <Input id="longBreakDuration" type="number" min="1" value={longBreakDuration / 60} onChange={e => setLongBreakDuration(parseInt(e.target.value) * 60)} disabled={isRunning} />
              </div>
              <div>
                <Label htmlFor="cycles">Cycles before Long Break</Label>
                <Input id="cycles" type="number" min="1" value={cyclesBeforeLongBreak} onChange={e => setCyclesBeforeLongBreak(parseInt(e.target.value))} disabled={isRunning} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
       <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          Boost your productivity with focused work intervals.
        </p>
      </CardFooter>
    </Card>
  );
}
