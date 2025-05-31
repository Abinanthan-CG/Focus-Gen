"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SparklesIcon, Loader2, CheckSquare, Square } from 'lucide-react';
import { suggestTasks, SummarizeTasksInput, summarizeTasks } from '@/ai/flows'; // Assuming flows are barrel exported
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';


interface TempTask {
  id: string;
  name: string;
  completed: boolean;
}

export default function AiAssistantFeature() {
  const [dailyGoals, setDailyGoals] = useState('');
  const [suggestedTasksList, setSuggestedTasksList] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [summaryTasks, setSummaryTasks] = useState<TempTask[]>([{id: '1', name: '', completed: false}]);
  const [summaryTimePeriod, setSummaryTimePeriod] = useState<'day' | 'week'>('day');
  const [taskSummary, setTaskSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const { toast } = useToast();

  const handleSuggestTasks = async () => {
    if (!dailyGoals.trim()) {
      toast({ title: "Input Required", description: "Please enter your daily goals.", variant: "destructive" });
      return;
    }
    setIsSuggesting(true);
    setSuggestedTasksList([]);
    try {
      const result = await suggestTasks({ dailyGoals });
      setSuggestedTasksList(result.suggestedTasks || []);
      toast({ title: "Tasks Suggested!", description: "AI has generated some task ideas for you." });
    } catch (error) {
      console.error("Error suggesting tasks:", error);
      toast({ title: "Error", description: "Could not suggest tasks. Please try again.", variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddSummaryTaskField = () => {
    setSummaryTasks([...summaryTasks, {id: Date.now().toString(), name: '', completed: false}]);
  };

  const handleSummaryTaskChange = (id: string, field: 'name' | 'completed', value: string | boolean) => {
    setSummaryTasks(currentTasks => 
      currentTasks.map(task => task.id === id ? {...task, [field]: value} : task)
    );
  };
  
  const handleRemoveSummaryTaskField = (id: string) => {
    setSummaryTasks(currentTasks => currentTasks.filter(task => task.id !== id));
  };


  const handleSummarizeTasks = async () => {
    const validTasks = summaryTasks.filter(t => t.name.trim() !== '');
    if (validTasks.length === 0) {
      toast({ title: "Input Required", description: "Please enter at least one task to summarize.", variant: "destructive" });
      return;
    }
    setIsSummarizing(true);
    setTaskSummary('');
    try {
      const input: SummarizeTasksInput = {
        tasks: validTasks.map(t => ({ name: t.name, completed: t.completed })),
        timePeriod: summaryTimePeriod,
      };
      const result = await summarizeTasks(input);
      setTaskSummary(result.summary || '');
      toast({ title: "Tasks Summarized!", description: "AI has generated a summary of your tasks." });
    } catch (error)
     {
      console.error("Error summarizing tasks:", error);
      toast({ title: "Error", description: "Could not summarize tasks. Please try again.", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <SparklesIcon className="h-6 w-6 text-primary" />
            AI Task Suggester
          </CardTitle>
          <CardDescription>Describe your daily goals, and let AI suggest tasks to help you achieve them.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dailyGoals">Your Daily Goals</Label>
              <Textarea
                id="dailyGoals"
                placeholder="e.g., Finish project proposal, exercise for 30 minutes, prepare dinner..."
                value={dailyGoals}
                onChange={(e) => setDailyGoals(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleSuggestTasks} disabled={isSuggesting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SparklesIcon className="mr-2 h-4 w-4" />}
              Suggest Tasks
            </Button>
            {suggestedTasksList.length > 0 && (
              <div className="mt-4 p-4 border rounded-md bg-muted/30">
                <h4 className="font-semibold mb-2">Suggested Tasks:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {suggestedTasksList.map((task, index) => (
                    <li key={index}>{task}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <SparklesIcon className="h-6 w-6 text-primary" />
            AI Task Summarizer
          </CardTitle>
          <CardDescription>Input your tasks and let AI provide a concise summary of your progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Tasks for Summary:</Label>
            {summaryTasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-2">
                <Input 
                  type="text" 
                  placeholder={`Task ${index + 1} name`} 
                  value={task.name}
                  onChange={(e) => handleSummaryTaskChange(task.id, 'name', e.target.value)}
                  className="flex-grow"
                />
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id={`task-completed-${task.id}`} 
                        checked={task.completed}
                        onCheckedChange={(checked) => handleSummaryTaskChange(task.id, 'completed', !!checked)}
                    />
                    <Label htmlFor={`task-completed-${task.id}`} className="text-sm">Done</Label>
                </div>
                {summaryTasks.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSummaryTaskField(task.id)} aria-label="Remove task field">
                        <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={handleAddSummaryTaskField} size="sm">Add Task Field</Button>
            
            <Separator />

            <div>
              <Label htmlFor="timePeriod">Time Period</Label>
              <select
                id="timePeriod"
                value={summaryTimePeriod}
                onChange={(e) => setSummaryTimePeriod(e.target.value as 'day' | 'week')}
                className="w-full mt-1 p-2 border rounded-md bg-background"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
              </select>
            </div>
            <Button onClick={handleSummarizeTasks} disabled={isSummarizing} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SparklesIcon className="mr-2 h-4 w-4" />}
              Summarize Tasks
            </Button>
            {taskSummary && (
              <div className="mt-4 p-4 border rounded-md bg-muted/30">
                <h4 className="font-semibold mb-2">AI Summary:</h4>
                <p className="whitespace-pre-wrap">{taskSummary}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
