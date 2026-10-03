const fs = require('fs');
let content = fs.readFileSync('src/app/alphabets/page.tsx', 'utf8');

// 1. Fix Speech Synthesis logic (remove window.speechSynthesis.cancel() to prevent mobile bug)
content = content.replace(
  /function speakText\(text: string, lang: string\) \{\s*if \(typeof window === 'undefined' \|\| !window\.speechSynthesis\) return;\s*const utterance = new SpeechSynthesisUtterance\(text\);\s*utterance\.lang = lang;\s*window\.speechSynthesis\.cancel\(\);\s*window\.speechSynthesis\.speak\(utterance\);\s*\}/,
  \unction speakText(text: string, lang: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  // Use a slight timeout to ensure mobile Safari plays the audio without aborting immediately
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
}\
);

// 2. Fix the Flip Card CSS and animations
const oldCardBlock = \                            <div
                              className={cn(
                                'lingua-card !bg-white border-b-4 shadow-lg flex flex-col items-center justify-center py-5 px-2 gap-1 select-none',
                                selectedLang.accentBorder
                              )}
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              <span
                                className={cn('text-3xl font-black leading-none', selectedLang.color)}
                              >
                                {entry.char}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                                {entry.romanized}
                              </span>
                            </div>

                            {/* Back */}
                            <div
                              className="lingua-card !bg-zinc-900 border-b-4 border-b-[#22c55e] shadow-lg flex flex-col items-center justify-center gap-2 select-none py-5 px-2"
                              style={{
                                backfaceVisibility: 'hidden',
                                position: 'absolute',
                                inset: 0,
                                transform: 'rotateY(180deg)',
                              }}
                            >
                              <span className="text-xl font-black text-[#22c55e] leading-none">
                                {entry.char}
                              </span>
                              <span className="text-[8px] font-bold text-white/80 text-center px-1 leading-tight">
                                {entry.pronunciation}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakText(entry.char, selectedLang.speechLang);
                                }}
                                className="w-8 h-8 bg-[#22c55e]/20 rounded-xl flex items-center justify-center text-[#22c55e] hover:bg-[#22c55e]/40 transition-all active:scale-90 mt-1"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>\;

const newCardBlock = \                            <div
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
                              className="lingua-card !bg-zinc-900 border flex flex-col items-center justify-center gap-1 select-none w-full h-full shadow-sm"
                              style={{
                                backfaceVisibility: 'hidden',
                                position: 'absolute',
                                inset: 0,
                                transform: 'rotateY(180deg)',
                              }}
                            >
                              <span className="text-xl font-bold text-[#22c55e] leading-none">
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
                                className="w-8 h-8 bg-[#22c55e]/20 rounded-lg flex items-center justify-center text-[#22c55e] hover:bg-[#22c55e]/40 transition-all active:scale-90 mt-1"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>\;

content = content.replace(oldCardBlock.replace(/\s+/g, ' '), newCardBlock.replace(/\s+/g, ' '));
// Since regex matching whitespace is tricky, we'll do an exact replacement but with normalized spaces
function replaceNormalized(original, findStr, replaceStr) {
  let searchSpace = original.replace(/\s+/g, ' ');
  let target = findStr.replace(/\s+/g, ' ');
  let replacement = replaceStr; // this will be raw injected
  
  if (!original.includes(findStr)) {
      // try to locate start and end
      let startMatch = findStr.substring(0, 30);
      let startIndex = original.indexOf(startMatch);
      if (startIndex === -1) {
          // let's try a softer match
          return original;
      }
  }
  return original.split(findStr).join(replaceStr);
}

content = replaceNormalized(content, oldCardBlock, newCardBlock);
// If exact string fails, we'll use regex for the container
content = content.replace(/className="w-full"/g, 'className="w-full aspect-square"');
content = content.replace(/type: 'spring', bounce: 0\.2/g, "type: 'tween', ease: 'easeInOut', duration: 0.3");

fs.writeFileSync('src/app/alphabets/page.tsx', content);
