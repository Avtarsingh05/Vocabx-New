'use client';

import { useState, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Volume2, Languages, ChevronRight, Trophy, RefreshCw, Check, X } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Alphabet data for each supported language
// ──────────────────────────────────────────────────────────────────────────────
type AlphabetEntry = {
  char: string;
  romanized: string;
  pronunciation: string;
};

type LanguageAlphabet = {
  name: string;
  nativeName: string;
  flag: string;
  script: string;
  color: string;
  bg: string;
  accentBorder: string;
  speechLang: string;
  alphabets: AlphabetEntry[];
};

const LANGUAGES: LanguageAlphabet[] = [
  {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    script: 'Latin',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    accentBorder: 'border-b-blue-500',
    speechLang: 'en-US',
    alphabets: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => ({
      char: c,
      romanized: c,
      pronunciation: c.toLowerCase(),
    })),
  },
  {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    script: 'Devanagari',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    accentBorder: 'border-b-orange-500',
    speechLang: 'hi-IN',
    alphabets: [
      { char: 'अ', romanized: 'a', pronunciation: 'uh' },
      { char: 'आ', romanized: 'aa', pronunciation: 'aah' },
      { char: 'इ', romanized: 'i', pronunciation: 'ih' },
      { char: 'ई', romanized: 'ee', pronunciation: 'ee' },
      { char: 'उ', romanized: 'u', pronunciation: 'oo' },
      { char: 'ऊ', romanized: 'oo', pronunciation: 'ooh' },
      { char: 'ऋ', romanized: 'ri', pronunciation: 'ri' },
      { char: 'ए', romanized: 'e', pronunciation: 'ay' },
      { char: 'ऐ', romanized: 'ai', pronunciation: 'eye' },
      { char: 'ओ', romanized: 'o', pronunciation: 'oh' },
      { char: 'औ', romanized: 'au', pronunciation: 'ow' },
      { char: 'अं', romanized: 'an', pronunciation: 'un' },
      { char: 'अः', romanized: 'ah', pronunciation: 'ah' },
      { char: 'क', romanized: 'ka', pronunciation: 'kuh' },
      { char: 'ख', romanized: 'kha', pronunciation: 'khuh' },
      { char: 'ग', romanized: 'ga', pronunciation: 'guh' },
      { char: 'घ', romanized: 'gha', pronunciation: 'ghuh' },
      { char: 'ङ', romanized: 'nga', pronunciation: 'nguh' },
      { char: 'च', romanized: 'cha', pronunciation: 'chuh' },
      { char: 'छ', romanized: 'chha', pronunciation: 'chhuh' },
      { char: 'ज', romanized: 'ja', pronunciation: 'juh' },
      { char: 'झ', romanized: 'jha', pronunciation: 'jhuh' },
      { char: 'ञ', romanized: 'nya', pronunciation: 'nyuh' },
      { char: 'ट', romanized: 'ta', pronunciation: 'tuh' },
      { char: 'ठ', romanized: 'tha', pronunciation: 'thuh' },
      { char: 'ड', romanized: 'da', pronunciation: 'duh' },
      { char: 'ढ', romanized: 'dha', pronunciation: 'dhuh' },
      { char: 'ण', romanized: 'na', pronunciation: 'nuh' },
      { char: 'त', romanized: 'ta', pronunciation: 'tuh' },
      { char: 'थ', romanized: 'tha', pronunciation: 'thuh' },
      { char: 'द', romanized: 'da', pronunciation: 'duh' },
      { char: 'ध', romanized: 'dha', pronunciation: 'dhuh' },
      { char: 'न', romanized: 'na', pronunciation: 'nuh' },
      { char: 'प', romanized: 'pa', pronunciation: 'puh' },
      { char: 'फ', romanized: 'pha', pronunciation: 'phuh' },
      { char: 'ब', romanized: 'ba', pronunciation: 'buh' },
      { char: 'भ', romanized: 'bha', pronunciation: 'bhuh' },
      { char: 'म', romanized: 'ma', pronunciation: 'muh' },
      { char: 'य', romanized: 'ya', pronunciation: 'yuh' },
      { char: 'र', romanized: 'ra', pronunciation: 'ruh' },
      { char: 'ल', romanized: 'la', pronunciation: 'luh' },
      { char: 'व', romanized: 'va', pronunciation: 'vuh' },
      { char: 'श', romanized: 'sha', pronunciation: 'shuh' },
      { char: 'ष', romanized: 'sha', pronunciation: 'shuh' },
      { char: 'स', romanized: 'sa', pronunciation: 'suh' },
      { char: 'ह', romanized: 'ha', pronunciation: 'huh' },
      { char: 'क्ष', romanized: 'ksha', pronunciation: 'kshuh' },
      { char: 'त्र', romanized: 'tra', pronunciation: 'truh' },
      { char: 'ज्ञ', romanized: 'gya', pronunciation: 'gyuh' },
    ],
  },
  {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    script: 'Gurmukhi',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    accentBorder: 'border-b-yellow-500',
    speechLang: 'pa-IN',
    alphabets: [
      { char: 'ਉ', romanized: 'u', pronunciation: 'oo' },
      { char: 'ਅ', romanized: 'a', pronunciation: 'uh' },
      { char: 'ੲ', romanized: 'i', pronunciation: 'ih' },
      { char: 'ਸ', romanized: 'sa', pronunciation: 'suh' },
      { char: 'ਹ', romanized: 'ha', pronunciation: 'huh' },
      { char: 'ਕ', romanized: 'ka', pronunciation: 'kuh' },
      { char: 'ਖ', romanized: 'kha', pronunciation: 'khuh' },
      { char: 'ਗ', romanized: 'ga', pronunciation: 'guh' },
      { char: 'ਘ', romanized: 'gha', pronunciation: 'ghuh' },
      { char: 'ਙ', romanized: 'nga', pronunciation: 'nguh' },
      { char: 'ਚ', romanized: 'cha', pronunciation: 'chuh' },
      { char: 'ਛ', romanized: 'chha', pronunciation: 'chhuh' },
      { char: 'ਜ', romanized: 'ja', pronunciation: 'juh' },
      { char: 'ਝ', romanized: 'jha', pronunciation: 'jhuh' },
      { char: 'ਞ', romanized: 'nya', pronunciation: 'nyuh' },
      { char: 'ਟ', romanized: 'ta', pronunciation: 'tuh' },
      { char: 'ਠ', romanized: 'tha', pronunciation: 'thuh' },
      { char: 'ਡ', romanized: 'da', pronunciation: 'duh' },
      { char: 'ਢ', romanized: 'dha', pronunciation: 'dhuh' },
      { char: 'ਣ', romanized: 'na', pronunciation: 'nuh' },
      { char: 'ਤ', romanized: 'ta', pronunciation: 'tuh' },
      { char: 'ਥ', romanized: 'tha', pronunciation: 'thuh' },
      { char: 'ਦ', romanized: 'da', pronunciation: 'duh' },
      { char: 'ਧ', romanized: 'dha', pronunciation: 'dhuh' },
      { char: 'ਨ', romanized: 'na', pronunciation: 'nuh' },
      { char: 'ਪ', romanized: 'pa', pronunciation: 'puh' },
      { char: 'ਫ', romanized: 'pha', pronunciation: 'phuh' },
      { char: 'ਬ', romanized: 'ba', pronunciation: 'buh' },
      { char: 'ਭ', romanized: 'bha', pronunciation: 'bhuh' },
      { char: 'ਮ', romanized: 'ma', pronunciation: 'muh' },
      { char: 'ਯ', romanized: 'ya', pronunciation: 'yuh' },
      { char: 'ਰ', romanized: 'ra', pronunciation: 'ruh' },
      { char: 'ਲ', romanized: 'la', pronunciation: 'luh' },
      { char: 'ਵ', romanized: 'va', pronunciation: 'vuh' },
      { char: 'ੜ', romanized: 'rra', pronunciation: 'rruh' },
    ],
  },
  {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    script: 'Latin',
    color: 'text-red-600',
    bg: 'bg-red-50',
    accentBorder: 'border-b-red-500',
    speechLang: 'es-ES',
    alphabets: [
      { char: 'A', romanized: 'a', pronunciation: 'ah' },
      { char: 'B', romanized: 'b', pronunciation: 'beh' },
      { char: 'C', romanized: 'c', pronunciation: 'seh' },
      { char: 'D', romanized: 'd', pronunciation: 'deh' },
      { char: 'E', romanized: 'e', pronunciation: 'eh' },
      { char: 'F', romanized: 'f', pronunciation: 'EH-feh' },
      { char: 'G', romanized: 'g', pronunciation: 'Heh' },
      { char: 'H', romanized: 'h', pronunciation: 'AH-cheh' },
      { char: 'I', romanized: 'i', pronunciation: 'ee' },
      { char: 'J', romanized: 'j', pronunciation: 'HO-tah' },
      { char: 'K', romanized: 'k', pronunciation: 'kah' },
      { char: 'L', romanized: 'l', pronunciation: 'EH-leh' },
      { char: 'LL', romanized: 'll', pronunciation: 'EH-yeh' },
      { char: 'M', romanized: 'm', pronunciation: 'EH-meh' },
      { char: 'N', romanized: 'n', pronunciation: 'EH-neh' },
      { char: 'Ñ', romanized: 'ñ', pronunciation: 'EH-nyeh' },
      { char: 'O', romanized: 'o', pronunciation: 'oh' },
      { char: 'P', romanized: 'p', pronunciation: 'peh' },
      { char: 'Q', romanized: 'q', pronunciation: 'koo' },
      { char: 'R', romanized: 'r', pronunciation: 'EH-rreh' },
      { char: 'S', romanized: 's', pronunciation: 'EH-seh' },
      { char: 'T', romanized: 't', pronunciation: 'teh' },
      { char: 'U', romanized: 'u', pronunciation: 'oo' },
      { char: 'V', romanized: 'v', pronunciation: 'oo-veh' },
      { char: 'W', romanized: 'w', pronunciation: 'dO-bleh-oo-veh' },
      { char: 'X', romanized: 'x', pronunciation: 'EH-kees' },
      { char: 'Y', romanized: 'y', pronunciation: 'ee-GRYEH-gah' },
      { char: 'Z', romanized: 'z', pronunciation: 'SEH-tah' },
    ],
  },
  {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    script: 'Latin',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    accentBorder: 'border-b-indigo-500',
    speechLang: 'fr-FR',
    alphabets: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => ({
      char: c,
      romanized: c,
      pronunciation: c.toLowerCase(),
    })),
  },
  {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    script: 'Latin',
    color: 'text-zinc-700',
    bg: 'bg-zinc-50',
    accentBorder: 'border-b-zinc-500',
    speechLang: 'de-DE',
    alphabets: [
      ...('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => ({
        char: c,
        romanized: c,
        pronunciation: c.toLowerCase(),
      }))),
      { char: 'Ä', romanized: 'ae', pronunciation: 'ay' },
      { char: 'Ö', romanized: 'oe', pronunciation: 'ur' },
      { char: 'Ü', romanized: 'ue', pronunciation: 'ew' },
      { char: 'ß', romanized: 'ss', pronunciation: 'es-tset' },
    ],
  },
  {
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    script: 'Latin',
    color: 'text-green-700',
    bg: 'bg-green-50',
    accentBorder: 'border-b-green-500',
    speechLang: 'it-IT',
    alphabets: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => ({
      char: c,
      romanized: c,
      pronunciation: c.toLowerCase(),
    })),
  },
  {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    script: 'Hiragana',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    accentBorder: 'border-b-pink-500',
    speechLang: 'ja-JP',
    alphabets: [
      { char: 'あ', romanized: 'a', pronunciation: 'ah' },
      { char: 'い', romanized: 'i', pronunciation: 'ee' },
      { char: 'う', romanized: 'u', pronunciation: 'oo' },
      { char: 'え', romanized: 'e', pronunciation: 'eh' },
      { char: 'お', romanized: 'o', pronunciation: 'oh' },
      { char: 'か', romanized: 'ka', pronunciation: 'kah' },
      { char: 'き', romanized: 'ki', pronunciation: 'kee' },
      { char: 'く', romanized: 'ku', pronunciation: 'koo' },
      { char: 'け', romanized: 'ke', pronunciation: 'keh' },
      { char: 'こ', romanized: 'ko', pronunciation: 'koh' },
      { char: 'さ', romanized: 'sa', pronunciation: 'sah' },
      { char: 'し', romanized: 'shi', pronunciation: 'shee' },
      { char: 'す', romanized: 'su', pronunciation: 'soo' },
      { char: 'せ', romanized: 'se', pronunciation: 'seh' },
      { char: 'そ', romanized: 'so', pronunciation: 'soh' },
      { char: 'た', romanized: 'ta', pronunciation: 'tah' },
      { char: 'ち', romanized: 'chi', pronunciation: 'chee' },
      { char: 'つ', romanized: 'tsu', pronunciation: 'tsoo' },
      { char: 'て', romanized: 'te', pronunciation: 'teh' },
      { char: 'と', romanized: 'to', pronunciation: 'toh' },
      { char: 'な', romanized: 'na', pronunciation: 'nah' },
      { char: 'に', romanized: 'ni', pronunciation: 'nee' },
      { char: 'ぬ', romanized: 'nu', pronunciation: 'noo' },
      { char: 'ね', romanized: 'ne', pronunciation: 'neh' },
      { char: 'の', romanized: 'no', pronunciation: 'noh' },
      { char: 'は', romanized: 'ha', pronunciation: 'hah' },
      { char: 'ひ', romanized: 'hi', pronunciation: 'hee' },
      { char: 'ふ', romanized: 'fu', pronunciation: 'foo' },
      { char: 'へ', romanized: 'he', pronunciation: 'heh' },
      { char: 'ほ', romanized: 'ho', pronunciation: 'hoh' },
      { char: 'ま', romanized: 'ma', pronunciation: 'mah' },
      { char: 'み', romanized: 'mi', pronunciation: 'mee' },
      { char: 'む', romanized: 'mu', pronunciation: 'moo' },
      { char: 'め', romanized: 'me', pronunciation: 'meh' },
      { char: 'も', romanized: 'mo', pronunciation: 'moh' },
      { char: 'や', romanized: 'ya', pronunciation: 'yah' },
      { char: 'ゆ', romanized: 'yu', pronunciation: 'yoo' },
      { char: 'よ', romanized: 'yo', pronunciation: 'yoh' },
      { char: 'ら', romanized: 'ra', pronunciation: 'rah' },
      { char: 'り', romanized: 'ri', pronunciation: 'ree' },
      { char: 'る', romanized: 'ru', pronunciation: 'roo' },
      { char: 'れ', romanized: 're', pronunciation: 'reh' },
      { char: 'ろ', romanized: 'ro', pronunciation: 'roh' },
      { char: 'わ', romanized: 'wa', pronunciation: 'wah' },
      { char: 'を', romanized: 'wo', pronunciation: 'woh' },
      { char: 'ん', romanized: 'n', pronunciation: 'n' },
    ],
  },
  {
    name: 'Mandarin',
    nativeName: '普通话',
    flag: '🇨🇳',
    script: 'Pinyin',
    color: 'text-red-700',
    bg: 'bg-red-50',
    accentBorder: 'border-b-red-700',
    speechLang: 'zh-CN',
    alphabets: [
      { char: 'ā', romanized: 'a', pronunciation: 'ah (flat)' },
      { char: 'á', romanized: 'a', pronunciation: 'ah (rising)' },
      { char: 'ǎ', romanized: 'a', pronunciation: 'ah (dip)' },
      { char: 'à', romanized: 'a', pronunciation: 'ah (falling)' },
      { char: 'bā', romanized: 'ba', pronunciation: 'bah' },
      { char: 'pā', romanized: 'pa', pronunciation: 'pah' },
      { char: 'mā', romanized: 'ma', pronunciation: 'mah' },
      { char: 'fā', romanized: 'fa', pronunciation: 'fah' },
      { char: 'dā', romanized: 'da', pronunciation: 'dah' },
      { char: 'tā', romanized: 'ta', pronunciation: 'tah' },
      { char: 'nā', romanized: 'na', pronunciation: 'nah' },
      { char: 'lā', romanized: 'la', pronunciation: 'lah' },
      { char: 'gā', romanized: 'ga', pronunciation: 'gah' },
      { char: 'kā', romanized: 'ka', pronunciation: 'kah' },
      { char: 'hā', romanized: 'ha', pronunciation: 'hah' },
      { char: 'jī', romanized: 'ji', pronunciation: 'jee' },
      { char: 'qī', romanized: 'qi', pronunciation: 'chee' },
      { char: 'xī', romanized: 'xi', pronunciation: 'shee' },
      { char: 'zhī', romanized: 'zhi', pronunciation: 'jur' },
      { char: 'chī', romanized: 'chi', pronunciation: 'chur' },
      { char: 'shī', romanized: 'shi', pronunciation: 'shur' },
      { char: 'rī', romanized: 'ri', pronunciation: 'rr' },
      { char: 'zī', romanized: 'zi', pronunciation: 'dzuh' },
      { char: 'cī', romanized: 'ci', pronunciation: 'tsuh' },
      { char: 'sī', romanized: 'si', pronunciation: 'suh' },
    ],
  },
  {
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    flag: '🕉️',
    script: 'Devanagari',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    accentBorder: 'border-b-amber-500',
    speechLang: 'hi-IN',
    alphabets: [
      { char: 'अ', romanized: 'a', pronunciation: 'uh' },
      { char: 'आ', romanized: 'ā', pronunciation: 'aah' },
      { char: 'इ', romanized: 'i', pronunciation: 'ih' },
      { char: 'ई', romanized: 'ī', pronunciation: 'ee' },
      { char: 'उ', romanized: 'u', pronunciation: 'oo' },
      { char: 'ऊ', romanized: 'ū', pronunciation: 'ooh' },
      { char: 'ऋ', romanized: 'ṛ', pronunciation: 'ri' },
      { char: 'ए', romanized: 'e', pronunciation: 'ay' },
      { char: 'ऐ', romanized: 'ai', pronunciation: 'eye' },
      { char: 'ओ', romanized: 'o', pronunciation: 'oh' },
      { char: 'औ', romanized: 'au', pronunciation: 'ow' },
      { char: 'क', romanized: 'ka', pronunciation: 'kuh' },
      { char: 'ख', romanized: 'kha', pronunciation: 'khuh' },
      { char: 'ग', romanized: 'ga', pronunciation: 'guh' },
      { char: 'घ', romanized: 'gha', pronunciation: 'ghuh' },
      { char: 'ङ', romanized: 'ṅa', pronunciation: 'nguh' },
      { char: 'च', romanized: 'ca', pronunciation: 'chuh' },
      { char: 'छ', romanized: 'cha', pronunciation: 'chhuh' },
      { char: 'ज', romanized: 'ja', pronunciation: 'juh' },
      { char: 'झ', romanized: 'jha', pronunciation: 'jhuh' },
      { char: 'ञ', romanized: 'ña', pronunciation: 'nyuh' },
      { char: 'ट', romanized: 'ṭa', pronunciation: 'tuh' },
      { char: 'ठ', romanized: 'ṭha', pronunciation: 'thuh' },
      { char: 'ड', romanized: 'ḍa', pronunciation: 'duh' },
      { char: 'ढ', romanized: 'ḍha', pronunciation: 'dhuh' },
      { char: 'ण', romanized: 'ṇa', pronunciation: 'nuh' },
      { char: 'त', romanized: 'ta', pronunciation: 'tuh' },
      { char: 'थ', romanized: 'tha', pronunciation: 'thuh' },
      { char: 'द', romanized: 'da', pronunciation: 'duh' },
      { char: 'ध', romanized: 'dha', pronunciation: 'dhuh' },
      { char: 'न', romanized: 'na', pronunciation: 'nuh' },
      { char: 'प', romanized: 'pa', pronunciation: 'puh' },
      { char: 'फ', romanized: 'pha', pronunciation: 'phuh' },
      { char: 'ब', romanized: 'ba', pronunciation: 'buh' },
      { char: 'भ', romanized: 'bha', pronunciation: 'bhuh' },
      { char: 'म', romanized: 'ma', pronunciation: 'muh' },
      { char: 'य', romanized: 'ya', pronunciation: 'yuh' },
      { char: 'र', romanized: 'ra', pronunciation: 'ruh' },
      { char: 'ल', romanized: 'la', pronunciation: 'luh' },
      { char: 'व', romanized: 'va', pronunciation: 'vuh' },
      { char: 'श', romanized: 'śa', pronunciation: 'shuh' },
      { char: 'ष', romanized: 'ṣa', pronunciation: 'shuh' },
      { char: 'स', romanized: 'sa', pronunciation: 'suh' },
      { char: 'ह', romanized: 'ha', pronunciation: 'huh' },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Speak helper
// ──────────────────────────────────────────────────────────────────────────────
function speakText(text: string, lang: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  
  // Mobile Safari requires a slight delay after cancel to not break the queue
  window.speechSynthesis.cancel();
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
}

// ──────────────────────────────────────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────────────────────────────────────
const MAX_QUIZ_QUESTIONS = 20;

export default function AlphabetsPage() {
  const [selectedLang, setSelectedLang] = useState<LanguageAlphabet | null>(null);
  const [flipped, setFlipped] = useState<number | null>(null);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizOrder, setQuizOrder] = useState<number[]>([]);

  // Build 4 answer options for a given question index
  const buildOptions = useCallback(
    (lang: LanguageAlphabet, currentIdx: number, allOrder: number[]): string[] => {
      const correct = lang.alphabets[currentIdx].romanized;
      // Gather pool of unique romanizations excluding the correct one
      const pool = lang.alphabets
        .filter((_, i) => i !== currentIdx)
        .map((a) => a.romanized)
        .filter((r, i, arr) => arr.indexOf(r) === i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      // Pad with placeholders if pool is too small
      while (pool.length < 3) pool.push(`opt${pool.length}`);
      return [correct, ...pool].sort(() => Math.random() - 0.5);
    },
    []
  );

  const startQuiz = useCallback(
    (lang: LanguageAlphabet) => {
      const shuffled = lang.alphabets
        .map((_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, MAX_QUIZ_QUESTIONS);
      setQuizOrder(shuffled);
      setQuizIndex(0);
      setQuizScore(0);
      setQuizSelected(null);
      setQuizDone(false);
      setQuizOptions(buildOptions(lang, shuffled[0], shuffled));
    },
    [buildOptions]
  );

  const handleAnswer = useCallback(
    (option: string) => {
      if (quizSelected || !selectedLang) return;
      setQuizSelected(option);

      const correct = selectedLang.alphabets[quizOrder[quizIndex]].romanized;
      if (option === correct) setQuizScore((s) => s + 1);

      setTimeout(() => {
        const nextIdx = quizIndex + 1;
        if (nextIdx >= quizOrder.length) {
          setQuizDone(true);
        } else {
          setQuizIndex(nextIdx);
          setQuizSelected(null);
          setQuizOptions(buildOptions(selectedLang, quizOrder[nextIdx], quizOrder));
        }
      }, 900);
    },
    [quizSelected, selectedLang, quizOrder, quizIndex, buildOptions]
  );

  const resetQuiz = useCallback(() => {
    if (selectedLang) startQuiz(selectedLang);
  }, [selectedLang, startQuiz]);

  const totalQuestions = Math.min(quizOrder.length, MAX_QUIZ_QUESTIONS);

  // Score label helpers
  const scorePct = quizDone ? Math.round((quizScore / totalQuestions) * 100) : 0;
  const scoreLabel =
    scorePct >= 90
      ? '🏆 Excellent!'
      : scorePct >= 70
      ? '⭐ Great job!'
      : scorePct >= 50
      ? '👍 Good effort!'
      : '💪 Keep practising!';

  return (
    <div className="min-h-screen bg-background pb-8 pt-16">
      <Navbar />

      <main className="max-w-5xl mx-auto p-4 space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl shrink-0">
            <Languages className="w-6 h-6 text-[#22c55e]" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900 uppercase leading-none">
              Alphabet Lab
            </h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">
              Learn scripts of every language
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!selectedLang ? (
            /* ── Language picker grid ── */
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.name}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedLang(lang);
                    setFlipped(null);
                  }}
                  className="lingua-card !bg-white p-5 flex flex-col items-center gap-3 text-center border hover:border-zinc-300 transition-colors cursor-pointer shadow-sm rounded-2xl"
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-zinc-100',
                      lang.bg
                    )}
                  >
                    <span className={cn('text-lg font-bold', lang.color)}>
                      {lang.alphabets[0]?.char}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 leading-none">
                      {lang.name}
                    </p>
                    <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                      {lang.nativeName}
                    </p>
                    <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mt-0.5">
                      {lang.alphabets.length} chars · {lang.script}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <span className="text-[9px] font-black uppercase tracking-widest">Explore</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            /* ── Language selected: Tabs ── */
            <motion.div
              key={selectedLang.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Back + title bar */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLang(null)}
                  className="rounded-xl h-9 text-[9px] font-black uppercase tracking-widest border-2"
                >
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedLang.flag}</span>
                  <div>
                    <h2 className="text-xl font-black italic tracking-tighter text-zinc-900 uppercase leading-none">
                      {selectedLang.name}
                    </h2>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      {selectedLang.nativeName} · {selectedLang.script} ·{' '}
                      {selectedLang.alphabets.length} chars
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs
                defaultValue="study"
                onValueChange={(v) => {
                  if (v === 'quiz') startQuiz(selectedLang);
                }}
              >
                <TabsList className="grid w-full grid-cols-2 h-12 bg-muted rounded-2xl p-1 mb-6">
                  <TabsTrigger
                    value="study"
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    Study Cards
                  </TabsTrigger>
                  <TabsTrigger
                    value="quiz"
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    Quiz Mode
                  </TabsTrigger>
                </TabsList>

                {/* ── Study Tab ── */}
                <TabsContent value="study" className="space-y-4">
                  {/* Hint */}
                  <div className="terminal-label bg-zinc-900 text-white shadow-lg">
                    <Volume2 className="w-3 h-3 text-primary" />
                    <span>Tap a card to flip it · Tap the speaker icon to hear pronunciation</span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {selectedLang.alphabets.map((entry, idx) => {
                      const isFlipped = flipped === idx;
                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setFlipped(isFlipped ? null : idx)}
                          className="cursor-pointer"
                          style={{ perspective: 600 }}
                        >
                          <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                            className="w-full aspect-square"
                          >
                            {/* Front */}
                            <div
                              className={cn(
                                'lingua-card !bg-white border flex flex-col items-center justify-center gap-1.5 select-none w-full h-full shadow-sm',
                                selectedLang.color
                              )}
                              style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                            >
                              <span
                                className={cn('text-3xl font-bold leading-none', selectedLang.color)}
                              >
                                {entry.char}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground">
                                {entry.romanized}
                              </span>
                            </div>

                            {/* Back */}
                            <div
                              className="lingua-card !bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1 select-none w-full h-full shadow-sm"
                              style={{
                                backfaceVisibility: 'hidden',
                                position: 'absolute',
                                inset: 0,
                                transform: 'rotateY(180deg)',
                              }}
                            >
                              <span className="text-2xl font-bold text-[#22c55e] leading-none">
                                {entry.char}
                              </span>
                              <span className="text-[10px] font-medium text-white/80 text-center px-1 leading-tight">
                                {entry.pronunciation}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  speakText(entry.char, selectedLang.speechLang);
                                }}
                                className="w-8 h-8 bg-[#22c55e]/20 rounded-lg flex items-center justify-center text-[#22c55e] hover:bg-[#22c55e]/40 transition-colors active:scale-90 mt-1"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* ── Quiz Tab ── */}
                <TabsContent value="quiz">
                  <AnimatePresence mode="wait">
                    {quizDone ? (
                      /* Results Screen */
                      <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="lingua-card bg-white p-8 text-center space-y-5 border-b-8 border-b-[#22c55e]/30"
                      >
                        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto">
                          <Trophy className="w-10 h-10 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">
                            Quiz Complete
                          </p>
                          <h2 className="text-4xl font-black italic tracking-tighter text-zinc-900 uppercase">
                            {quizScore}
                            <span className="text-2xl text-muted-foreground font-bold">
                              /{totalQuestions}
                            </span>
                          </h2>
                          <p className="text-lg font-black mt-1 text-[#22c55e]">{scoreLabel}</p>
                        </div>

                        {/* Score bar */}
                        <div className="space-y-1">
                          <Progress value={scorePct} className="h-3 rounded-full" />
                          <p className="text-[10px] font-bold text-muted-foreground text-right">
                            {scorePct}% correct
                          </p>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#22c55e]/10 rounded-2xl py-3 px-4 flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
                            <div className="text-left">
                              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                Correct
                              </p>
                              <p className="text-xl font-black text-[#22c55e]">{quizScore}</p>
                            </div>
                          </div>
                          <div className="bg-red-50 rounded-2xl py-3 px-4 flex items-center gap-2">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <div className="text-left">
                              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                Incorrect
                              </p>
                              <p className="text-xl font-black text-red-500">
                                {totalQuestions - quizScore}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={resetQuiz}
                          className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Try Again
                        </Button>
                      </motion.div>
                    ) : (
                      /* Question Screen */
                      <motion.div
                        key={`q-${quizIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        {/* Progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                              Question {quizIndex + 1} of {totalQuestions}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#22c55e]">
                              Score: {quizScore}
                            </span>
                          </div>
                          <Progress
                            value={(quizIndex / totalQuestions) * 100}
                            className="h-2 rounded-full"
                          />
                        </div>

                        {/* Character card */}
                        <div className="lingua-card bg-zinc-900 p-10 text-center space-y-3 border-b-8 border-b-[#22c55e]/30">
                          <p
                            className={cn(
                              'text-8xl font-black leading-none',
                              selectedLang.color
                            )}
                          >
                            {selectedLang.alphabets[quizOrder[quizIndex]]?.char}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                            What is the romanization of this character?
                          </p>
                        </div>

                        {/* Answer options */}
                        <div className="grid grid-cols-2 gap-3">
                          {quizOptions.map((opt) => {
                            const correct =
                              selectedLang.alphabets[quizOrder[quizIndex]]?.romanized;
                            const isSelected = quizSelected === opt;
                            const isCorrect = opt === correct;
                            const answered = !!quizSelected;

                            return (
                              <motion.button
                                key={opt}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleAnswer(opt)}
                                disabled={answered}
                                className={cn(
                                  'h-16 rounded-2xl font-black text-sm border-2 transition-all duration-200 flex items-center justify-center gap-2',
                                  // Default (unanswered)
                                  !answered &&
                                    'bg-white border-zinc-100 hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5 text-zinc-800',
                                  // Correct answer reveal
                                  answered &&
                                    isCorrect &&
                                    'bg-[#22c55e] text-white border-[#22c55e] shadow-lg shadow-[#22c55e]/20',
                                  // Wrong selection
                                  answered &&
                                    isSelected &&
                                    !isCorrect &&
                                    'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20',
                                  // Other unselected options after answer
                                  answered &&
                                    !isSelected &&
                                    !isCorrect &&
                                    'bg-white border-zinc-100 text-zinc-400 opacity-50'
                                )}
                              >
                                {answered && isCorrect && (
                                  <Check className="w-4 h-4 shrink-0" />
                                )}
                                {answered && isSelected && !isCorrect && (
                                  <X className="w-4 h-4 shrink-0" />
                                )}
                                {opt}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
