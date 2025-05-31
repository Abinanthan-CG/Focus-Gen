
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClockIcon, Globe } from 'lucide-react';
import AnalogClockDisplay from './analog-clock-display';
import { Separator } from './ui/separator';

type ClockType = 'digital' | 'analog';

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

export default function ClockFeature() {
  const [currentTimeString, setCurrentTimeString] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeClockType, setActiveClockType] = useState<ClockType>('digital');
  const [worldClocks, setWorldClocks] = useState<WorldClockInfo[]>([]);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now);

      const updatedWorldClocks = CITIES_TO_DISPLAY.map(city => ({
        city: city.name,
        timeZone: city.timeZone,
        timeString: now.toLocaleTimeString([], { 
          timeZone: city.timeZone, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        }),
      }));
      setWorldClocks(updatedWorldClocks);
    };
    
    updateClocks(); // Initial set
    const timerId = setInterval(updateClocks, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Current Time</CardTitle>
        <ClockIcon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Tabs value={activeClockType} onValueChange={(value) => setActiveClockType(value as ClockType)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="analog">Analog</TabsTrigger>
          </TabsList>
          <TabsContent value="digital">
            <div className="text-6xl font-bold text-center py-8 text-primary tabular-nums font-headline">
              {currentTimeString || "Loading..."}
            </div>
          </TabsContent>
          <TabsContent value="analog">
            <div className="flex justify-center items-center py-4 h-64 md:h-72">
              <AnalogClockDisplay date={currentDate} />
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="mt-4">
          <h3 className="text-lg font-medium mb-3 flex items-center justify-center font-headline">
            <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
            World Clocks
          </h3>
          <div className="space-y-2">
            {worldClocks.length > 0 ? worldClocks.map(clock => (
              <div key={clock.city} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium text-foreground">{clock.city}</span>
                <span className="text-sm font-mono text-primary tabular-nums">{clock.timeString || "Loading..."}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center">Loading world times...</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {/* Footer content can be added here if needed */}
      </CardFooter>
    </Card>
  );
}
