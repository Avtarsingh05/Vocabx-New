'use server';
/**
 * @fileOverview A Genkit flow for generating vocabulary words, meanings, example sentences,
 * synonyms, and antonyms tailored to a specific learning level.
 *
 * - generateLevelBasedVocabulary - A function that handles the vocabulary generation process.
 * - GenerateLevelBasedVocabularyInput - The input type for the generateLevelBasedVocabulary function.
 * - GenerateLevelBasedVocabularyOutput - The return type for the generateLevelBasedVocabulary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLevelBasedVocabularyInputSchema = z.object({
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The current learning level of the user (e.g., Beginner, Intermediate, Advanced).'),
});
export type GenerateLevelBasedVocabularyInput = z.infer<typeof GenerateLevelBasedVocabularyInputSchema>;

const GenerateLevelBasedVocabularyOutputSchema = z.object({
  word: z.string().describe('A vocabulary word appropriate for the specified level.'),
  meaning: z.string().describe('The definition of the vocabulary word.'),
  exampleSentence: z.string().describe('An example sentence using the vocabulary word.'),
  synonyms: z.array(z.string()).describe('A list of synonyms for the word.'),
  antonyms: z.array(z.string()).describe('A list of antonyms for the word.'),
});
export type GenerateLevelBasedVocabularyOutput = z.infer<typeof GenerateLevelBasedVocabularyOutputSchema>;

const generateVocabularyPrompt = ai.definePrompt({
  name: 'generateVocabularyPrompt',
  input: { schema: GenerateLevelBasedVocabularyInputSchema },
  output: { schema: GenerateLevelBasedVocabularyOutputSchema },
  prompt: `You are an expert vocabulary tutor. Your task is to generate a single new vocabulary word,
its meaning, an example sentence, a list of synonyms, and a list of antonyms.
All these should be appropriate for a user at the '{{{level}}}' learning level.

Provide the response in the specified structured format.`,
});

const generateLevelBasedVocabularyFlow = ai.defineFlow(
  {
    name: 'generateLevelBasedVocabularyFlow',
    inputSchema: GenerateLevelBasedVocabularyInputSchema,
    outputSchema: GenerateLevelBasedVocabularyOutputSchema,
  },
  async (input) => {
    const { output } = await generateVocabularyPrompt(input);
    if (!output) {
      throw new Error('Failed to generate vocabulary.');
    }
    return output;
  }
);

export async function generateLevelBasedVocabulary(
  input: GenerateLevelBasedVocabularyInput
): Promise<GenerateLevelBasedVocabularyOutput> {
  return generateLevelBasedVocabularyFlow(input);
}
