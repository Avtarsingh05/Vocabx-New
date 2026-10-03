'use server';
/**
 * @fileOverview Dynamic vocabulary quiz questions generator.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MultipleChoiceQuestionSchema = z.object({
  type: z.literal('multiple-choice').describe('The type of quiz question.'),
  word: z.string().describe('The vocabulary word being tested.'),
  question: z.string().describe('The multiple-choice question text.'),
  options: z.array(z.string()).min(4).max(4).describe('Exactly 4 options.'),
  correctAnswer: z.string().describe('The correct answer among the options.'),
});

const FillInTheBlanksQuestionSchema = z.object({
  type: z.literal('fill-in-the-blanks').describe('The type of quiz question.'),
  word: z.string().describe('The vocabulary word being tested.'),
  sentence: z.string().describe('The original sentence.'),
  blankedSentence: z.string().describe('The sentence with a blank.'),
  options: z.array(z.string()).min(4).max(4).describe('Exactly 4 options.'),
  correctAnswer: z.string().describe('The correct word.'),
});

const GenerateQuizInputSchema = z.object({
  words: z.array(z.object({
    word: z.string(),
    meaning: z.string(),
    example: z.string(),
  })).min(1),
  numQuestions: z.number().min(1).max(20).default(10),
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(z.discriminatedUnion('type', [
    MultipleChoiceQuestionSchema,
    FillInTheBlanksQuestionSchema,
  ])).min(1),
});

export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPromptV12',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are the VocabX Assessment Engine. Create {{numQuestions}} quiz questions based on these words:
{{#each words}}
Word: {{{word}}} - Meaning: {{{meaning}}} - Example: {{{example}}}
{{/each}}

Ensure 4 unique options for every question.`,
});

export async function generateDynamicVocabularyQuiz(input: z.infer<typeof GenerateQuizInputSchema>): Promise<GenerateQuizOutput> {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error("Identity Protocol Failed: API Key missing.");
    }
    const { output } = await generateQuizPrompt(input);
    if (!output) throw new Error('Assessment Calibration failed.');
    return output;
  } catch (error: any) {
    console.error("Quiz Gen Error:", error);
    throw new Error(`Assessment Link Error: ${error.message || 'Recalibration required'}`);
  }
}
