
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { HourglassIcon, Play, Pause, RotateCcw, Save, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULT_PRESETS = [
  { label: "Quick Break", seconds: 5 * 60 },
  { label: "Workout", seconds: 30 * 60 },
  { label: "Focus Session", seconds: 1 * 60 * 60 },
];

interface Preset {
  label: string;
  seconds: number;
}

const VISUAL_STYLES_COUNTDOWN = ['circular', 'linear-intensity', 'minimal'] as const;
type VisualStyleCountdown = typeof VISUAL_STYLES_COUNTDOWN[number];

// SVG Constants for Circular Progress
const RADIUS_CD = 90; // Countdown Radius
const VIEWBOX_SIZE_CD = 200;
const CENTER_XY_CD = VIEWBOX_SIZE_CD / 2;
const CIRCUMFERENCE_CD = 2 * Math.PI * RADIUS_CD;

export default function CountdownFeature() {
  const [initialTime, setInitialTime] = useState(DEFAULT_PRESETS[0].seconds); 
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [hoursInput, setHoursInput] = useState(Math.floor(DEFAULT_PRESETS[0].seconds / 3600).toString());
  const [minutesInput, setMinutesInput] = useState(Math.floor((DEFAULT_PRESETS[0].seconds % 3600) / 60).toString());
  const [secondsInput, setSecondsInput] = useState((DEFAULT_PRESETS[0].seconds % 60).toString());

  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const [currentVisualStyleIndex, setCurrentVisualStyleIndex] = useState(0);
  const currentVisualStyle = VISUAL_STYLES_COUNTDOWN[currentVisualStyleIndex];
  const [triggerFinishAnimation, setTriggerFinishAnimation] = useState(false);

  const calculateTotalSeconds = useCallback(() => {
    const h = parseInt(hoursInput, 10) || 0;
    const m = parseInt(minutesInput, 10) || 0;
    const s = parseInt(secondsInput, 10) || 0;
    return h * 3600 + m * 60 + s;
  }, [hoursInput, minutesInput, secondsInput]);

  useEffect(() => {
    const storedCustomPresets = localStorage.getItem('countdownCustomPresets');
    if (storedCustomPresets) {
      try {
        const parsedPresets = JSON.parse(storedCustomPresets);
        if (Array.isArray(parsedPresets)) {
          setCustomPresets(parsedPresets.filter(p => typeof p.label === 'string' && typeof p.seconds === 'number'));
        }
      } catch (error) {
        console.error("Failed to parse custom presets from localStorage", error);
        setCustomPresets([]); 
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('countdownCustomPresets', JSON.stringify(customPresets));
  }, [customPresets]);

  useEffect(() => {
    const totalSeconds = calculateTotalSeconds();
    if (!isRunning) {
      setInitialTime(totalSeconds);
      setTimeLeft(totalSeconds);
      setIsFinished(false); 
    }
  }, [hoursInput, minutesInput, secondsInput, calculateTotalSeconds, isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      setTriggerFinishAnimation(true);
      if (timerRef.current) clearInterval(timerRef.current);
      toast({
        title: "Countdown Finished!",
        description: "Your timer has reached zero.",
      });
      const animationTimer = setTimeout(() => setTriggerFinishAnimation(false), 1000); // Match animation duration
      return () => clearTimeout(animationTimer);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, toast]);

  const handleStart = () => {
    if (timeLeft <= 0) { 
      const totalSecondsFromInput = calculateTotalSeconds();
      if (totalSecondsFromInput <= 0) {
        toast({ title: "Invalid Time", description: "Please set a duration greater than 0.", variant: "destructive" });
        return;
      }
      setInitialTime(totalSecondsFromInput);
      setTimeLeft(totalSecondsFromInput);
      setIsFinished(false);
      setIsRunning(true);
    } else { 
      setIsRunning(true);
      if (isFinished) setIsFinished(false); 
    }
    setTriggerFinishAnimation(false); // Reset flash on start
  };
  
  const handlePause = () => setIsRunning(false);
  
  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTriggerFinishAnimation(false);
    const totalSeconds = calculateTotalSeconds();
    setInitialTime(totalSeconds);
    setTimeLeft(totalSeconds);
  };

  const applyPreset = (seconds: number, presetLabel?: string) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    setHoursInput(h.toString());
    setMinutesInput(m.toString());
    setSecondsInput(s.toString());
    setIsFinished(false); 
    setTriggerFinishAnimation(false);
    if (presetLabel) {
        toast({ title: "Preset Applied", description: `Timer set to ${presetLabel} (${formatTime(seconds)}).` });
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({ title: "Invalid Name", description: "Please enter a name for your preset.", variant: "destructive" });
      return;
    }
    const totalSeconds = calculateTotalSeconds();
    if (totalSeconds <= 0) {
      toast({ title: "Invalid Time", description: "Preset duration must be greater than 0.", variant: "destructive" });
      return;
    }
    const existingPreset = [...DEFAULT_PRESETS, ...customPresets].find(
        (p) => p.label.toLowerCase() === newPresetName.trim().toLowerCase()
    );
    if (existingPreset) {
        toast({ title: "Duplicate Name", description: `A preset named "${newPresetName.trim()}" already exists.`, variant: "destructive" });
        return;
    }

    const newPreset = { label: newPresetName.trim(), seconds: totalSeconds };
    setCustomPresets(prev => [...prev, newPreset]);
    setNewPresetName("");
    toast({ title: "Preset Saved!", description: `"${newPreset.label}" (${formatTime(newPreset.seconds)}) saved.` });
  };

  const handleDeleteCustomPreset = (presetLabel: string) => {
    setCustomPresets(prev => prev.filter(p => p.label !== presetLabel));
    toast({ title: "Preset Deleted", description: `"${presetLabel}" deleted.`, variant: "destructive" });
  };

  const handleAddTime = (secondsToAdd: number) => {
    setTimeLeft(prevTimeLeft => {
      const newTimeLeft = prevTimeLeft + secondsToAdd;
      if (isFinished && newTimeLeft > 0) {
        setIsFinished(false);
        setTriggerFinishAnimation(false);
      }
      return newTimeLeft;
    });
    setInitialTime(prevInitial => Math.max(prevInitial, timeLeft + secondsToAdd)); // Adjust initialTime if adding beyond current
  
    toast({
      title: "Time Added",
      description: `${secondsToAdd / 60} minute(s) added to the timer.`,
    });
  };

  const nextStyle = () => {
    setCurrentVisualStyleIndex((prevIndex) => (prevIndex + 1) % VISUAL_STYLES_COUNTDOWN.length);
  };

  const prevStyle = () => {
    setCurrentVisualStyleIndex((prevIndex) => (prevIndex - 1 + VISUAL_STYLES_COUNTDOWN.length) % VISUAL_STYLES_COUNTDOWN.length);
  };

  const getVisualStyleNameCountdown = (style: VisualStyleCountdown) => {
    switch(style) {
      case 'circular': return 'Circular';
      case 'linear-intensity': return 'Intensity';
      case 'minimal': return 'Minimal';
      default: 
        const _exhaustiveCheck: never = style;
        return '';
    }
  };

  const progressRatio = initialTime > 0 ? timeLeft / initialTime : 0;
  const circularStrokeDashoffset = CIRCUMFERENCE_CD * (1 - progressRatio); // 0 is full, CIRCUMFERENCE_CD is empty

  const allPresets = [...DEFAULT_PRESETS, ...customPresets];
  
  const linearProgressPercentRemaining = initialTime > 0 ? (timeLeft / initialTime) * 100 : (isFinished ? 0 : 100);
  const showAddTimeSection = isRunning || (timeLeft > 0 && timeLeft < initialTime && !isFinished && initialTime > 0);

  const timeDisplayClasses = cn(
    "font-bold tabular-nums font-headline",
    currentVisualStyle === 'circular' ? "text-5xl" : "text-6xl",
    currentVisualStyle === 'linear-intensity' && isRunning && timeLeft > 0 && timeLeft <= 20 ? "text-destructive transition-colors duration-500" : "text-primary",
  );

  return (
    <Card className={cn(
        "w-full max-w-lg mx-auto shadow-lg",
        triggerFinishAnimation && "animate-brief-flash"
      )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Countdown Timer</CardTitle>
        <div className="flex items-center gap-2">
           <span className="text-sm text-muted-foreground">{getVisualStyleNameCountdown(currentVisualStyle)}</span>
           <HourglassIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center space-x-1 sm:space-x-2 my-4">
            <Button variant="ghost" size="icon" onClick={prevStyle} aria-label="Previous visual style">
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            <div className={cn(
              "flex justify-center items-center",
              currentVisualStyle === 'circular' ? "relative w-48 h-48 sm:w-52 sm:h-52" : "py-8" // Adjust padding for non-circular
            )}>
              {currentVisualStyle === 'circular' && (
                <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${VIEWBOX_SIZE_CD} ${VIEWBOX_SIZE_CD}`}>
                  <circle
                    className="stroke-muted/30"
                    strokeWidth="10"
                    fill="transparent"
                    r={RADIUS_CD}
                    cx={CENTER_XY_CD}
                    cy={CENTER_XY_CD}
                  />
                  <circle
                    className="stroke-accent"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="transparent"
                    r={RADIUS_CD}
                    cx={CENTER_XY_CD}
                    cy={CENTER_XY_CD}
                    style={{
                      strokeDasharray: CIRCUMFERENCE_CD,
                      strokeDashoffset: circularStrokeDashoffset,
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                      transition: 'stroke-dashoffset 0.25s linear'
                    }}
                  />
                </svg>
              )}
              <div className={timeDisplayClasses}>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={nextStyle} aria-label="Next visual style">
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
        </div>

        {currentVisualStyle !== 'circular' && (
           <Progress value={linearProgressPercentRemaining} className="mb-6 h-3 [&>div]:bg-accent" />
        )}
        
        {(!isRunning && (!isFinished || timeLeft <=0) ) && (
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

        {showAddTimeSection ? (
          <div className="my-6">
            <h3 className="text-lg font-medium mb-3 text-center font-headline">Add Time</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => handleAddTime(60)} className="flex items-center justify-center">
                <PlusCircle className="mr-2 h-4 w-4" /> +1 min
              </Button>
              <Button variant="outline" onClick={() => handleAddTime(300)} className="flex items-center justify-center">
                <PlusCircle className="mr-2 h-4 w-4" /> +5 min
              </Button>
              <Button variant="outline" onClick={() => handleAddTime(600)} className="flex items-center justify-center">
                <PlusCircle className="mr-2 h-4 w-4" /> +10 min
              </Button>
            </div>
          </div>
        ) : (
          (!isRunning && !isFinished || timeLeft <=0) && // Only show presets/save if timer is settable
          <div className="my-6">
            <h3 className="text-lg font-medium mb-3 text-center font-headline">Presets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {allPresets.map(preset => (
                <div
                  key={preset.label}
                  role="button"
                  tabIndex={isRunning ? -1 : 0}
                  aria-disabled={isRunning}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "flex-col h-auto p-3 items-center justify-center relative group text-center",
                    isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  )}
                  onClick={() => {
                    if (!isRunning) {
                      applyPreset(preset.seconds, preset.label);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (!isRunning) {
                        applyPreset(preset.seconds, preset.label);
                      }
                    }
                  }}
                >
                  <span className="font-semibold">{preset.label}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(preset.seconds)}</span>
                  {!DEFAULT_PRESETS.find(dp => dp.label === preset.label) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDeleteCustomPreset(preset.label);
                      }}
                      aria-label={`Delete preset ${preset.label}`}
                      disabled={isRunning}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {allPresets.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full text-center">No presets available. Save one below!</p>
              )}
            </div>

            {(!isRunning && !showAddTimeSection) && (
              <div className="mt-6 border-t pt-4">
                <Label htmlFor="presetName" className="mb-1 block font-medium">Preset name to save</Label>
                <div className="flex gap-2">
                  <Input
                    id="presetName"
                    type="text"
                    placeholder="Enter preset name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    disabled={isRunning}
                  />
                  <Button 
                    onClick={handleSavePreset} 
                    disabled={isRunning || !newPresetName.trim() || calculateTotalSeconds() <=0} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isFinished && timeLeft <=0 && !calculateTotalSeconds()}>
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
        {isFinished && timeLeft <=0 && (
          <p className="mt-4 text-center text-lg font-semibold text-destructive">Time's up!</p>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center text-muted-foreground w-full">
          Set a timer for focused work sessions or breaks. Use arrows to change visual style.
        </p>
      </CardFooter>
    </Card>
  );
}
