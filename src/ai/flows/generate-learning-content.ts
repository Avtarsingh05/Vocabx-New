'use server';
/**
 * @fileOverview High-intensity batch generation for personalized vocabulary lessons.
 * Optimized for linguistic synchronization and regional language support.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WordContentSchema = z.object({
  word: z.string().describe('The word in the target language native script.'),
  meaning: z.string().describe('Clear definition in simple English.'),
  explanation: z.string().describe('A simple linguistic tip in English.'),
  exampleSentence: z.string().describe('A contextual sentence in the target language native script.'),
  exampleSentenceTranslation: z.string().describe('English translation of the example.'),
  synonyms: z.array(z.string()).describe('Synonyms in the target language native script.'),
  antonyms: z.array(z.string()).describe('Antonyms in the target language native script.'),
});

const GenerateLearningContentInputSchema = z.object({
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  targetLanguage: z.string(),
  subject: z.string().optional().describe('Academic domain (e.g. Maths, Physics).'),
  exclude: z.array(z.string()).optional(),
  count: z.number().min(1).max(10).default(8),
});

const GenerateLearningContentOutputSchema = z.object({
  words: z.array(WordContentSchema),
  languageMarker: z.string().describe('The name of the target language used for verification.'),
});

const generateLearningContentPrompt = ai.definePrompt({
  name: 'generateLearningContentV22',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateLearningContentInputSchema },
  output: { schema: GenerateLearningContentOutputSchema },
  config: {
    maxOutputTokens: 2048,
    temperature: 0.8,
  },
  prompt: `You are the VocabX Master Intelligence. Generate a high-fidelity batch of {{count}} vocabulary nodes.

Target Language: {{{targetLanguage}}}
Learning Level: {{{level}}}
Academic Node: {{#if subject}}{{{subject}}}{{else}}Adaptive General{{/if}}
Exclude: {{#each exclude}}{{{this}}}, {{/each}}

NUCLEAR LINGUISTIC DIRECTIVE:
1. Every "word", "exampleSentence", "synonyms", and "antonyms" field MUST be written ONLY in the native script of {{{targetLanguage}}}.
2. DO NOT include any English in target language fields.
3. Set languageMarker to strictly "{{{targetLanguage}}}".`,
});

export async function generateLearningContent(input: z.infer<typeof GenerateLearningContentInputSchema>) {
  try {
    // Identity Protocol Check
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error("Identity Protocol Failed: API Key missing from system environment.");
    }

    const { output } = await generateLearningContentPrompt(input);
    
    if (!output || !output.words || output.words.length === 0) {
      throw new Error('Neural core returned an empty dataset node. Recalibration required.');
    }
    return output;
  } catch (error: any) {
    console.error("AI Generation Error (Server Action):", error);
    // Provide raw diagnostic feedback for 100% transparency
    const detail = error.message || 'Calibration failure';
    throw new Error(`Neural Link Error: ${detail}`);
  }
}
