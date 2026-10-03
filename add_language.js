const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const targetStr = \                <div>
                   <h2 className="text-xl font-bold text-zinc-900 leading-none">
                      Hello, <span className="text-[#22c55e]">{firstName}</span>!
                   </h2>
                   <p className="text-xs font-medium text-zinc-500 mt-1.5">{profile.level} Scholar</p>
                </div>
                <Button variant="outline" className="w-full h-10 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center gap-2 border-zinc-200">
                   <GraduationCap className="w-4 h-4 text-zinc-500" /> Grade {profile.grade || 1}
                </Button>
             </section>\;

const replaceStr = \                <div>
                   <h2 className="text-xl font-bold text-zinc-900 leading-none">
                      Hello, <span className="text-[#22c55e]">{firstName}</span>!
                   </h2>
                   <p className="text-xs font-medium text-zinc-500 mt-1.5">{profile.level} Scholar</p>
                </div>
                <div className="w-full space-y-2 mt-3">
                  <Select value={profile.targetLanguage || 'English'} onValueChange={handleLanguageChange}>
                     <SelectTrigger className="w-full h-10 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-between px-3 border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                         <div className="flex items-center gap-2 text-zinc-700">
                             <Globe className="w-4 h-4 text-[#22c55e]" />
                             <SelectValue />
                         </div>
                     </SelectTrigger>
                     <SelectContent className="rounded-xl shadow-lg border-zinc-100 bg-white">
                         {LANGUAGES.map(lang => (
                             <SelectItem key={lang} value={lang} className="text-xs font-semibold py-2 cursor-pointer">{lang}</SelectItem>
                         ))}
                     </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="w-full h-10 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center gap-2 border-zinc-200">
                     <GraduationCap className="w-4 h-4 text-zinc-500" /> Grade {profile.grade || 1}
                  </Button>
                </div>
             </section>\;

// Try to replace by normalizing whitespace since we might have mismatch
const normalizedContent = content.replace(/\s+/g, ' ');
const normalizedTarget = targetStr.replace(/\s+/g, ' ');

if (normalizedContent.includes(normalizedTarget)) {
    // we have to replace the exact substring in the original, so we use indexOf logic
    let index = content.indexOf('                <div>\n                   <h2 className="text-xl font-bold text-zinc-900 leading-none">');
    if (index === -1) index = content.indexOf('                <div>\r\n                   <h2 className="text-xl font-bold text-zinc-900 leading-none">');
    
    if (index !== -1) {
        let endIndex = content.indexOf('</section>', index) + 10;
        let newContent = content.substring(0, index) + replaceStr + content.substring(endIndex);
        fs.writeFileSync('src/app/dashboard/page.tsx', newContent);
        console.log("Replaced successfully!");
    } else {
        console.log("Could not find exact index.");
    }
} else {
    console.log("Target not found at all.");
}
