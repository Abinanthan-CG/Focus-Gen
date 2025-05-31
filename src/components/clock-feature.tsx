
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClockIcon } from 'lucide-react';
import AnalogClockDisplay from './analog-clock-display';
// Removed Separator and Globe imports as they are no longer used here

type ClockType = 'digital' | 'analog';

// Removed WorldClockInfo interface and CITIES_TO_DISPLAY constant

export default function ClockFeature() {
  const [currentTimeString, setCurrentTimeString] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeClockType, setActiveClockType] = useState<ClockType>('digital');
  // Removed worldClocks state

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setCurrentTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now);

      // Removed world clock update logic
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
        {/* Removed World Clocks Section and Separator */}
      </CardContent>
      <CardFooter>
        {/* Footer content can be added here if needed */}
      </CardFooter>
    </Card>
  );
}
