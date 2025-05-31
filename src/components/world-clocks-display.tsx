
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from 'lucide-react';

interface WorldClockInfo {
  city: string;
  timeZone: string;
  timeString: string;
}

const CITIES_TO_DISPLAY: { name: string; timeZone: string }[] = [
  { name: "New York", timeZone: "America/New_York" },
  { name: "London", timeZone: "Europe/London" },
  { name: "Tokyo", timeZone: "Asia/Tokyo" },
  { name: "Sydney", timeZone: "Australia/Sydney" },
];

export default function WorldClocksDisplay() {
  const [worldClocks, setWorldClocks] = useState<WorldClockInfo[]>([]);

  useEffect(() => {
    const updateWorldClocks = () => {
      const now = new Date();
      const updatedWorldClocks = CITIES_TO_DISPLAY.map(city => ({
        city: city.name,
        timeZone: city.timeZone,
        timeString: now.toLocaleTimeString([], { 
          timeZone: city.timeZone, 
          hour: '2-digit', 
          minute: '2-digit', 
          // Omitting seconds for a cleaner look in smaller cards, can be added back if preferred
          // second: '2-digit',
          hour12: false 
        }),
      }));
      setWorldClocks(updatedWorldClocks);
    };
    
    updateWorldClocks(); // Initial set
    const timerId = setInterval(updateWorldClocks, 1000); // Update every second for accuracy

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="w-full max-w-4xl">
      {/* Removed h2 heading "World Clocks" */}
      {worldClocks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {worldClocks.map(clock => (
            <Card key={clock.city} className="shadow-md">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg font-medium font-headline flex items-center justify-center">
                  <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
                  {clock.city}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 pb-4">
                <p className="text-3xl font-bold text-center text-primary tabular-nums">
                  {clock.timeString || "Loading..."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">Loading world times...</p>
      )}
    </div>
  );
}
