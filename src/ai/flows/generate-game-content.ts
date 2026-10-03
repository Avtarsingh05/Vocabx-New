
'use server';
/**
 * @fileOverview Genkit Flow for generating game content for various vocabulary games.
 * Optimized for token efficiency and high-density batching.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GameTypeSchema = z.enum([
  'word-match',
  'fill-blank',
  'speed-quiz',
  'spelling',
  'memory',
  'drag-drop',
  'image-vocab',
  'synonym-antonym',
  'sentence-builder',
  'ai-challenge'
]);

const GameContentInputSchema = z.object({
  gameType: GameTypeSchema,
  targetLanguage: z.string().default('English'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  count: z.number().min(1).max(10).default(5)
});

const GameContentOutputSchema = z.object({
  items: z.array(z.object({
    word: z.string(),
    meaning: z.string(),
    sentence: z.string().optional(),
    options: z.array(z.string()).describe('Exactly 4 unique options including the correct one.'),
    correctAnswer: z.string(),
    jumbledWords: z.array(z.string()).optional(),
    imagePrompt: z.string().optional().describe('Vivid visual description for clues.'),
    imageHint: z.string().optional().describe('Two search keywords.'),
    type: z.enum(['synonym', 'antonym']).optional()
  }))
});

export type GameContentOutput = z.infer<typeof GameContentOutputSchema>;

const gamePrompt = ai.definePrompt({
  name: 'generateGameContentV9',
  input: { schema: GameContentInputSchema },
  output: { schema: GameContentOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Generate exactly {{count}} high-quality items for "{{gameType}}" in {{targetLanguage}} at {{level}} level.

CRITICAL: Every item MUST have exactly 4 unique "options" including the "correctAnswer", even for memory and visual games.

Rules:
- word-match: word + meaning + 4 options.
- fill-blank: sentence with "_____" + 4 options.
- speed-quiz: word/meaning question + 4 options.
- spelling: word + 4 options (distractors).
- memory: word + meaning + 4 options (the options MUST be related words for the quiz phase).
- drag-drop: word + meaning + 4 options.
- image-vocab: target word + descriptive "imagePrompt" (English) + imageHint (2 words) + 4 options.
- synonym-antonym: word + label (synonym/antonym) + 4 options.
- sentence-builder: full sentence + jumbledWords array + 4 options (distractors).
- ai-challenge: complex riddle in "meaning" + 4 options.`,
});

export async function generateGameContent(input: z.infer<typeof GameContentInputSchema>) {
  const { output } = await gamePrompt(input);
  if (!output) throw new Error('Generation failed.');
  return output;
}
