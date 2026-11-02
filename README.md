# VocabX

A language-learning web app where learners can study an alphabet, practise vocabulary in short games and test what they remember. VocabX received **first prize at Lovely Professional University**.

[Open VocabX](https://vocabx.vercel.app)

## Explore the project

| Start here | What to look for in the code |
| --- | --- |
| [Alphabet practice](src/app/alphabets/page.tsx) | The learner-facing page for studying letters. |
| [Word matching](src/app/games/word-match/page.tsx) | A vocabulary exercise built into the games section. |
| [Vocabulary quizzes](src/ai/flows/generate-dynamic-vocabulary-quiz.ts) | The AI flow that generates vocabulary questions. |

The interface uses **Next.js, React, TypeScript and Tailwind CSS**. The [AI flows](src/ai/flows) sit alongside the [application pages](src/app), with [Firebase integration](src/lib/firebase.ts) and [Firestore rules](firestore.rules) in the same repository.

## Run locally

From the repository root, install dependencies with `npm ci`, then run `npm run dev` and open [localhost:9002](http://localhost:9002). Firebase and AI features need the corresponding service configuration for your environment.
