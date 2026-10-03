'use server';
/**
 * @fileOverview Mastery Test Generation and Grading Flows.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MasteryQuestionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('mcq'),
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.string(),
    marks: z.number().default(2)
  }),
  z.object({
    type: z.literal('fill-up'),
    sentence: z.string().describe('Sentence with a _____ blank'),
    correctAnswer: z.string(),
    marks: z.number().default(2)
  }),
  z.object({
    type: z.literal('short-answer'),
    prompt: z.string(),
    marks: z.number().default(10)
  }),
  z.object({
    type: z.literal('long-answer'),
    prompt: z.string(),
    marks: z.number().default(15)
  })
]);

const GenerateMasteryTestInputSchema = z.object({
  targetLanguage: z.string(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
});

const GenerateMasteryTestOutputSchema = z.object({
  testId: z.string(),
  questions: z.array(MasteryQuestionSchema)
});

const generateTestPrompt = ai.definePrompt({
  name: 'generateMasteryTestPromptV11',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateMasteryTestInputSchema },
  output: { schema: GenerateMasteryTestOutputSchema },
  prompt: `You are a Senior Academic Examiner for {{{targetLanguage}}}.
Create a rigorous 100-mark Mastery Test for a scholar at {{{level}}} level.
The test must contain EXACTLY 25 questions of varying types.`,
});

export async function generateMasteryTest(input: z.infer<typeof GenerateMasteryTestInputSchema>) {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error("Identity Protocol Failed: API Key missing.");
    }
    const { output } = await generateTestPrompt({
      ...input,
      testId: `test_${Date.now()}`
    } as any);
    if (!output) throw new Error('Neural core timeout.');
    return output;
  } catch (error: any) {
    console.error("Test Gen Error:", error);
    throw new Error(`Test Link Error: ${error.message}`);
  }
}

const GradeMasteryTestInputSchema = z.object({
  targetLanguage: z.string(),
  answers: z.array(z.object({
    type: z.string(),
    question: z.string(),
    userAnswer: z.string(),
    correctAnswer: z.string().optional(),
    marks: z.number()
  }))
});

const GradeMasteryTestOutputSchema = z.object({
  score: z.number(),
  feedback: z.string(),
  isCertified: z.boolean(),
  breakdown: z.array(z.object({
    question: z.string(),
    marksAwarded: z.number(),
    critique: z.string()
  }))
});

const gradeTestPrompt = ai.definePrompt({
  name: 'gradeMasteryTestPromptV11',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GradeMasteryTestInputSchema },
  output: { schema: GradeMasteryTestOutputSchema },
  prompt: `Evaluate the scholar's performance for the {{{targetLanguage}}} Mastery Exam.
Score out of 100. If score >= 90, certify as Master.`,
});

export async function gradeMasteryTest(input: z.infer<typeof GradeMasteryTestInputSchema>) {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error("Identity Protocol Failed: API Key missing.");
    }
    const { output } = await gradeTestPrompt(input);
    if (!output) throw new Error('Neural core timeout during grading.');
    return output;
  } catch (error: any) {
    console.error("Grading Error:", error);
    throw new Error(`Grading Link Error: ${error.message}`);
  }
}
