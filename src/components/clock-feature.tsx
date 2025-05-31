
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClockIcon } from 'lucide-react';
import AnalogClockDisplay from './analog-clock-display';
import PixelClockDisplay from './pixel-clock-display';

type ClockType = 'digital' | 'analog' | 'pixel';

export default function ClockFeature() {
  const [currentTimeString, setCurrentTimeString] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeClockType, setActiveClockType] = useState<ClockType>('digital');

  useEffect(() => {
    const timerId = setInterval(() => {
      const now = new Date();
      setCurrentTimeString(now.toLocaleTimeString());
      setCurrentDate(now);
    }, 1000);
    
    // Initial set
    const now = new Date();
    setCurrentTimeString(now.toLocaleTimeString());
    setCurrentDate(now);

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
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="digital">Digital</TabsTrigger>
            <TabsTrigger value="analog">Analog</TabsTrigger>
            <TabsTrigger value="pixel">Pixel</TabsTrigger>
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
          <TabsContent value="pixel">
             <div className="flex justify-center items-center py-4 h-64 md:h-72">
              <PixelClockDisplay timeString={currentTimeString || "00:00:00"} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
