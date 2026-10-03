
'use server';
/**
 * @fileOverview AI Conversation Simulation Flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConversationInputSchema = z.object({
  scenario: z.string().describe('The scenario (e.g., Ordering coffee, Interview).'),
  userInput: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional(),
  targetLanguage: z.string().default('English')
});

const ConversationOutputSchema = z.object({
  aiResponse: z.string().describe('The AI\'s response in character.'),
  feedback: z.string().optional().describe('Brief grammar correction or suggestion if the user made a mistake.'),
  isCorrect: z.boolean().optional().describe('Whether the user\'s last input was grammatically acceptable.')
});

const convoPrompt = ai.definePrompt({
  name: 'conversationSimPrompt',
  input: { schema: ConversationInputSchema },
  output: { schema: ConversationOutputSchema },
  prompt: `You are simulating a real-life scenario: "{{{scenario}}}".
You are speaking in {{{targetLanguage}}}. 

1. AI Response: Reply to the user in character within the scenario.
2. Feedback: If the user made a grammar mistake in {{{targetLanguage}}}, provide a gentle correction in English.
3. Keep it immersive.

Scenario Context: {{{scenario}}}

History:
{{#each history}}
{{role}}: {{{content}}}
{{/each}}

User says: {{{userInput}}}`,
});

export async function simulateConversation(input: z.infer<typeof ConversationInputSchema>) {
  const { output } = await convoPrompt(input);
  return output!;
}
