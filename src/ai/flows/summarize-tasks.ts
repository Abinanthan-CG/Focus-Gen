'use server';

/**
 * @fileOverview Summarizes the status of tasks for a given day or week.
 *
 * - summarizeTasks - A function that summarizes task statuses.
 * - SummarizeTasksInput - The input type for the summarizeTasks function.
 * - SummarizeTasksOutput - The return type for the summarizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTasksInputSchema = z.object({
  tasks: z
    .array(
      z.object({
        name: z.string(),
        completed: z.boolean(),
      })
    )
    .describe('An array of tasks with their completion status.'),
  timePeriod: z
    .enum(['day', 'week'])
    .describe('The time period for which to summarize tasks.'),
});
export type SummarizeTasksInput = z.infer<typeof SummarizeTasksInputSchema>;

const SummarizeTasksOutputSchema = z.object({
  summary: z.string().describe('A summary of the tasks and their status.'),
});
export type SummarizeTasksOutput = z.infer<typeof SummarizeTasksOutputSchema>;

export async function summarizeTasks(input: SummarizeTasksInput): Promise<SummarizeTasksOutput> {
  return summarizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTasksPrompt',
  input: {schema: SummarizeTasksInputSchema},
  output: {schema: SummarizeTasksOutputSchema},
  prompt: `You are a personal assistant helping the user summarize their tasks.

  Summarize the status of the following tasks for the {{{timePeriod}}}.
  Tasks:
  {{#each tasks}}
  - {{name}} (Completed: {{completed}})
  {{/each}}
  `,
});

const summarizeTasksFlow = ai.defineFlow(
  {
    name: 'summarizeTasksFlow',
    inputSchema: SummarizeTasksInputSchema,
    outputSchema: SummarizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
