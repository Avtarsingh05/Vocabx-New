'use server';
/**
 * @fileOverview AI Code Evaluation Flow.
 * Verifies scholarly code logic and simulated output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluateCodeInputSchema = z.object({
  language: z.string(),
  challenge: z.string(),
  code: z.string(),
  requirements: z.array(z.string()).optional()
});

const EvaluateCodeOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the code correctly solves the challenge.'),
  feedback: z.string().describe('Constructive technical feedback.'),
  simulatedOutput: z.string().describe('The expected output if this code were executed.'),
  efficiencyScore: z.number().min(0).max(100).describe('Score based on code cleanliness and logic.')
});

const evaluationPrompt = ai.definePrompt({
  name: 'evaluateCodePrompt',
  input: { schema: EvaluateCodeInputSchema },
  output: { schema: EvaluateCodeOutputSchema },
  prompt: `You are the VocabX Senior Neural Architect. 
Evaluate the following scholar's code for the "{{{challenge}}}" challenge in {{{language}}}.

Requirements to check:
{{#each requirements}}
- {{{this}}}
{{/each}}

Code Submission:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`

1. Verify if the logic correctly produces the intended output.
2. Check for syntax errors specific to {{{language}}}.
3. Provide a simulated execution output.
4. Set isCorrect to true ONLY if it fully solves the problem.`,
});

export async function evaluateCode(input: z.infer<typeof EvaluateCodeInputSchema>) {
  try {
    const { output } = await evaluationPrompt(input);
    return output!;
  } catch (error: any) {
    return {
      isCorrect: false,
      feedback: "Neural Link Error: The evaluation node is recalibrating.",
      simulatedOutput: "ERROR_NULL",
      efficiencyScore: 0
    };
  }
}
