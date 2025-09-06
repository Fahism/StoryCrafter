'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const continueStoryFlow = ai.defineFlow(
  {
    name: 'continueStoryFlow',
    inputSchema: z.object({
      storySoFar: z.string().describe('The story that has been written so far.'),
    }),
    outputSchema: z.object({
      storyContinuation: z.string().describe('The next part of the story.'),
    }),
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `You are a storyteller for children with the enthusiastic and motivational personality of John Cena. Your stories are exciting, positive, and full of action. You talk about never giving up! Continue the following story with one or two exciting new sentences. Keep the story moving forward.

STORY SO FAR:
---
${input.storySoFar}
---

WHAT HAPPENS NEXT:`,
      model: 'googleai/gemini-2.5-flash',
      config: {
        temperature: 0.8,
      },
    });

    return {
      storyContinuation: llmResponse.text,
    };
  }
);
