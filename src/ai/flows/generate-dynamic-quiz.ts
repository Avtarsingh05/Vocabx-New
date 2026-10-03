'use server';
/**
 * @fileOverview This file implements a Genkit flow for dynamically generating vocabulary quiz questions.
 *
 * - generateDynamicQuiz - A function that generates a set of vocabulary quiz questions.
 * - GenerateQuizInput - The input type for the generateDynamicQuiz function.
 * - GenerateQuizOutput - The return type for the generateDynamicQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultipleChoiceQuestionSchema = z.object({
  type: z.literal('multiple-choice').describe('The type of quiz question.'),
  word: z.string().describe('The vocabulary word being tested.'),
  question: z.string().describe('The multiple-choice question text.'),
  options: z
    .array(z.string())
    .min(4)
    .max(4)
    .describe('Exactly 4 options for the multiple-choice question.'),
  correctAnswer: z.string().describe('The correct answer among the options.'),
});

const FillInTheBlanksQuestionSchema = z.object({
  type: z.literal('fill-in-the-blanks').describe('The type of quiz question.'),
  word: z.string().describe('The vocabulary word being tested.'),
  sentence: z
    .string()
    .describe('The original sentence used for the fill-in-the-blanks question.'),
  blankedSentence: z
    .string()
    .describe('The sentence with the target word replaced by an underscore, e.g., "The cat sat on the _____."'),
  correctAnswer: z.string().describe('The word that correctly fills the blank.'),
});

const GenerateQuizInputSchema = z.object({
  words: z
    .array(
      z.object({
        word: z.string().describe('The vocabulary word.'),
        meaning: z.string().describe('The meaning of the word.'),
        example: z.string().describe('An example sentence using the word.'),
      })
    )
    .min(1)
    .describe('An array of vocabulary words with their meanings and examples.'),
  quizType:
    z.enum(['multiple-choice', 'fill-in-the-blanks']).optional().describe('Optional: Specify the type of quiz questions. If not specified, a mix will be generated.'),
  numQuestions:
    z.number().min(1).max(10).default(5).describe('Optional: The desired number of quiz questions to generate, up to 10.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z
    .array(
      z.discriminatedUnion('type', [
        MultipleChoiceQuestionSchema,
        FillInTheBlanksQuestionSchema,
      ])
    )
    .min(1)
    .describe('An array of generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an intelligent language learning assistant. Your task is to create dynamic vocabulary quiz questions based on the provided list of words, their meanings, and example sentences.

Generate {{numQuestions}} quiz questions. If a specific quizType is provided, generate only that type; otherwise, provide a mix of multiple-choice and fill-in-the-blanks questions.

For multiple-choice questions, provide exactly 4 options, one of which is the correct answer.
For fill-in-the-blanks questions, replace the target word in its example sentence with a blank (e.g., "The cat sat on the _____."). Ensure the blank is always represented by a single underscore.

Provide the quiz questions in a structured format following the defined output schema.

Here are the vocabulary words to use:
{{#each words}}
Word: {{{word}}}
Meaning: {{{meaning}}}
Example: {{{example}}}
---
{{/each}}`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuizPrompt(input);
    if (!output) {
      throw new Error('Failed to generate quiz questions.');
    }
    return output;
  }
);

export async function generateDynamicQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}
