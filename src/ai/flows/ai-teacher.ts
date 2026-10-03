'use server';
/**
 * @fileOverview AI Personal Teacher Flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TeacherInputSchema = z.object({
  message: z.string().describe('The user\'s message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional(),
  targetLanguage: z.string().default('English'),
  level: z.string().default('Beginner')
});

const TeacherOutputSchema = z.object({
  response: z.string().describe('The AI teacher\'s response.'),
  suggestions: z.array(z.string()).optional()
});

const teacherPrompt = ai.definePrompt({
  name: 'aiTeacherPromptV12',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: TeacherInputSchema },
  output: { schema: TeacherOutputSchema },
  prompt: `You are the VocabX Master Tutor, an expert in {{{targetLanguage}}}. 
The scholar is at a {{{level}}} level. 

Provide a helpful, professional response to the scholar's query.

History:
{{#each history}}
{{role}}: {{{content}}}
{{/each}}

Scholar: {{{message}}}`,
});

export async function chatWithTeacher(input: z.infer<typeof TeacherInputSchema>) {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      return { response: "Neural Link Error: Identity Protocol Failed. API Key missing." };
    }

    const { output } = await teacherPrompt(input);
    return output!;
  } catch (error: any) {
    console.error("AI Teacher Error:", error);
    return {
      response: `Neural Link Error: ${error.message || 'The tutor node is currently recalibrating.'}`
    };
  }
}
