const fs = require('fs');
const files = [
  'src/app/dashboard/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/games/page.tsx',
  'src/app/curriculum/page.tsx',
  'src/app/learn/page.tsx',
  'src/app/alphabets/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix Mobile top/bottom padding
    content = content.replace(/pt-20/g, 'pt-16');
    content = content.replace(/pb-28/g, 'pb-8');
    
    // Fix Desktop dashboard
    content = content.replace(/h-\[calc\(100vh-80px\)\] overflow-hidden pt-16/g, 'mt-16 h-[calc(100vh-64px)] overflow-hidden');
    // Fix Desktop profile
    content = content.replace(/h-\[calc\(100vh-80px\)\] overflow-hidden/g, 'mt-16 h-[calc(100vh-64px)] overflow-hidden');
    // Fix Desktop games
    content = content.replace(/h-\[calc\(100vh-80px\)\] overflow-hidden/g, 'mt-16 h-[calc(100vh-64px)] overflow-hidden');
    
    fs.writeFileSync(file, content);
    console.log('Fixed padding in ' + file);
  }
}
