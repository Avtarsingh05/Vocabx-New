const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const startTag = '<section className="space-y-6 overflow-y-auto scrollbar-hide pb-20 px-2">';
const endTag = '        <aside className="space-y-6 overflow-y-auto scrollbar-hide pb-8">';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const newMiddle = \        {/* Center Main Content */}
        <section className="space-y-6 overflow-y-auto scrollbar-hide pb-20 px-2">
           <header className="pt-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
              <p className="text-sm font-medium text-zinc-500 mt-1">Track your progress and access your learning nodes.</p>
           </header>

           <section className="grid grid-cols-2 gap-4">
              <div className="lingua-card !bg-white p-5 space-y-4 border-b-[4px] border-zinc-100 shadow-sm">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-600 flex items-center gap-2">
                       <Target className="w-4 h-4 text-[#22c55e]" /> Daily Goal
                    </span>
                    <span className="text-sm font-bold text-[#22c55e]">{profile.xp} / {metrics.dailyGoal} XP</span>
                 </div>
                 <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: \\%\ }}
                      className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] rounded-full"
                    />
                 </div>
              </div>
              <div className="lingua-card !bg-white p-5 space-y-4 border-b-[4px] border-zinc-100 shadow-sm">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-600 flex items-center gap-2">
                       <Star className="w-4 h-4 text-blue-500" /> Next Milestone
                    </span>
                    <span className="text-sm font-bold text-blue-500">{metrics.nextMilestone} XP</span>
                 </div>
                 <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: \\%\ }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    />
                 </div>
              </div>
           </section>

           <section className="grid grid-cols-2 gap-4">
              <Link href="/quiz?mode=challenge" className="block">
                <div className="lingua-card bg-gradient-to-br from-[#22c55e] to-emerald-700 text-white p-6 border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all h-full">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                         <Zap className="w-5 h-5 text-white fill-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">Quick Quiz</h3>
                   </div>
                   <p className="text-xs font-medium text-white/80">Test your reflexes and earn extra XP quickly.</p>
                </div>
              </Link>
              <Link href="/college-prep" className="block">
                <div className="lingua-card bg-gradient-to-br from-indigo-600 to-blue-800 text-white p-6 border-b-[6px] border-black/10 shadow-md active:scale-95 transition-all h-full">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                         <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">College Prep</h3>
                   </div>
                   <p className="text-xs font-medium text-white/80">Study materials tailored for college readiness.</p>
                </div>
              </Link>
           </section>

           <section className="space-y-4 pt-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                 <BookOpen className="w-4 h-4 text-zinc-400" />
                 <h2 className="text-sm font-bold text-zinc-600">Subjects</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {SUBJECTS.map((sub) => (
                  <Link key={sub.id} href={\/curriculum?subject=\\}>
                    <div className={cn(
                      "lingua-card !bg-white p-5 border-b-[4px] flex flex-col items-center gap-3 text-center transition-all hover:-translate-y-1 hover:shadow-md shadow-sm border-zinc-100"
                    )}>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", sub.bg)}>
                        <sub.icon className={cn("w-6 h-6", sub.color)} />
                      </div>
                      <p className="text-sm font-semibold text-zinc-800">{sub.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
           </section>
        </section>

\;
  content = content.substring(0, startIndex) + newMiddle + content.substring(endIndex);
  fs.writeFileSync('src/app/dashboard/page.tsx', content);
  console.log('Center section updated');
} else {
  console.log('Could not find start or end tags');
}
