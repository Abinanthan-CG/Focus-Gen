"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { ListChecksIcon, PlusCircle, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function TodoFeature() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const { toast } = useToast();

  // Effect to load tasks from localStorage
  useEffect(() => {
    const storedTasks = localStorage.getItem('todoTasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Effect to save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
    toast({ title: "Task Added", description: `Task "${newTask.text}" added to your list.` });
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => 
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({ title: "Task Deleted", variant: "destructive" });
  };

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium font-headline">Daily To-Do List</CardTitle>
        <ListChecksIcon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="What needs to be done?"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button onClick={handleAddTask} disabled={!newTaskText.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
        {tasks.length > 0 ? (
          <ScrollArea className="h-72 rounded-md border p-2">
            <ul className="space-y-2">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors group">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`todo-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      aria-label={`Mark task ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <Label htmlFor={`todo-${task.id}`} className={`cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.text}
                    </Label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80" aria-label={`Delete task ${task.text}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-4">Your to-do list is empty. Add some tasks!</p>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground w-full text-center">
          {totalTasksCount > 0 ? `${completedTasksCount} of ${totalTasksCount} tasks completed.` : "Ready to tackle your day!"}
        </p>
      </CardFooter>
    </Card>
  );
}
