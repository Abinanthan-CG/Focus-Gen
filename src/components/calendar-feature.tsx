"use client";

import { useState, useEffect } from 'react';
import { format, parseISO, startOfDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { CalendarDaysIcon, PlusCircle, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function CalendarFeature() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [newTaskText, setNewTaskText] = useState('');
  const { toast } = useToast();

  // Effect to load tasks from localStorage (simulating persistence)
  useEffect(() => {
    const storedTasks = localStorage.getItem('calendarTasks');
    if (storedTasks) {
      setTasksByDate(JSON.parse(storedTasks));
    }
  }, []);

  // Effect to save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('calendarTasks', JSON.stringify(tasksByDate));
  }, [tasksByDate]);

  const getTasksForSelectedDate = (): Task[] => {
    if (!selectedDate) return [];
    const dateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };

  const handleAddTask = () => {
    if (!newTaskText.trim() || !selectedDate) return;
    const dateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      date: dateKey,
    };
    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTask],
    }));
    setNewTaskText('');
    toast({ title: "Task Added", description: `Task "${newTask.text}" added for ${format(selectedDate, 'PPP')}.` });
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (!selectedDate) return;
    const dateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedDate) return;
    const dateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd');
    setTasksByDate(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(task => task.id !== taskId),
    }));
    toast({ title: "Task Deleted", variant: "destructive" });
  };

  const tasksForSelectedDay = getTasksForSelectedDate();

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <CalendarDaysIcon className="h-6 w-6 text-primary" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiersClassNames={{
              selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90',
              today: 'bg-accent/50 text-accent-foreground',
            }}
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">
            Tasks for {selectedDate ? format(selectedDate, 'PPP') : 'No date selected'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="New task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              disabled={!selectedDate}
            />
            <Button onClick={handleAddTask} disabled={!selectedDate || !newTaskText.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
          {selectedDate ? (
            tasksForSelectedDay.length > 0 ? (
              <ScrollArea className="h-72 rounded-md border p-2">
                <ul className="space-y-2">
                  {tasksForSelectedDay.map(task => (
                    <li key={task.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors group">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskCompletion(task.id)}
                        />
                        <Label htmlFor={`task-${task.id}`} className={`cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.text}
                        </Label>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-4">No tasks for this day. Add one!</p>
            )
          ) : (
            <p className="text-muted-foreground text-center py-4">Select a date to view or add tasks.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
