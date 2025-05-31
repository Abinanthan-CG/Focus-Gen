
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, buttonVariants } from "@/components/ui/button"; // Added buttonVariants
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { HourglassIcon, Play, Pause, RotateCcw, Save, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Ensure cn is imported

const DEFAULT_PRESETS = [
  { label: "Quick Break", seconds: 5 * 60 },
  { label: "Workout", seconds: 30 * 60 },
  { label: "Focus Session", seconds: 1 * 60 * 60 },
];

interface Preset {
  label: string;
  seconds: number;
}

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
      if (timerRef.current) clearInterval(timerRef.current);
      toast({
        title: "Countdown Finished!",
        description: "Your timer has reached zero.",
        variant: "default", 
      });
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
  };
  
  const handlePause = () => setIsRunning(false);
  
  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
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
      // Update initialTime if time is added beyond the original initialTime,
      // so progress bar behaves correctly (doesn't exceed 100% visually if it can't show >100%)
      // Or, ensure progress calculation handles timeLeft > initialTime gracefully.
      // For simplicity, let's assume progress bar handles it.
      // setInitialTime(prevInitial => Math.max(prevInitial, newTimeLeft)); // Alternative: adjust initialTime
      if (isFinished && newTimeLeft > 0) {
        setIsFinished(false); // If timer was finished, adding time makes it not finished.
      }
      return newTimeLeft;
    });
  
    toast({
      title: "Time Added",
      description: `${secondsToAdd / 60} minute(s) added to the timer.`,
    });
  };

  const allPresets = [...DEFAULT_PRESETS, ...customPresets];
  
  const progressPercentRemaining = initialTime > 0 ? (timeLeft / initialTime) * 100 : (isFinished ? 0 : 100);
  const showAddTimeSection = isRunning || (timeLeft > 0 && timeLeft < initialTime && !isFinished && initialTime > 0);

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
        <Progress value={progressPercentRemaining} className="mb-6 h-3 [&>div]:bg-accent" />
        
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
                    <Button // Inner Button for delete
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the div's onClick
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
            <Button onClick={handleStart} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isFinished && timeLeft <=0}>
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
          Set a timer for focused work sessions or breaks.
        </p>
      </CardFooter>
    </Card>
  );
}

