import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * VocabX Central AI Instance
 * Standardized for high-intensity scholarly synchronization.
 * Strictly uses GEMINI_API_KEY as requested.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});
