"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockIcon } from 'lucide-react';

export default function ClockFeature() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString()); // Initial set
    return () => clearInterval(timerId);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Current Time</CardTitle>
        <ClockIcon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-6xl font-bold text-center py-8 text-primary tabular-nums font-headline">
          {currentTime || "Loading..."}
        </div>
      </CardContent>
    </Card>
  );
}
