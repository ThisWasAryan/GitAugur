import { Users, Activity } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";

export function ContributorsView() {
  const { history } = useGitEngineStore();

  // Aggregate commits by author
  const authorStats = new Map<string, { name: string, email: string, commits: number }>();
  history.commits.forEach(commit => {
    const existing = authorStats.get(commit.author.email);
    if (existing) {
      existing.commits++;
    } else {
      authorStats.set(commit.author.email, {
        name: commit.author.name,
        email: commit.author.email,
        commits: 1
      });
    }
  });

  const sortedAuthors = Array.from(authorStats.values()).sort((a, b) => b.commits - a.commits);

  return (
    <div className="h-full bg-slate-950 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-500" />
          Contributors
        </h1>
        <p className="text-slate-400 mt-1">Repository activity and team members.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-500 text-sm font-medium mb-2">Total Commits</div>
          <div className="text-3xl font-bold text-slate-200">{history.commits.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-500 text-sm font-medium mb-2">Active Contributors</div>
          <div className="text-3xl font-bold text-slate-200">{sortedAuthors.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-500 text-sm font-medium mb-2">Lines Changed</div>
          <div className="text-3xl font-bold text-emerald-400">~ 14k</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="font-medium text-slate-300">Top Contributors</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          {sortedAuthors.map((author, index) => {
            const isTop = index === 0;
            const initials = author.name.substring(0, 1).toUpperCase();
            const colors = [
              "from-blue-500 to-emerald-500",
              "from-rose-500 to-orange-500",
              "from-purple-500 to-pink-500",
              "from-amber-500 to-rose-500"
            ];
            const colorClass = colors[index % colors.length];

            return (
              <div key={author.email} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-tr ${colorClass} rounded-full flex items-center justify-center text-white font-bold`}>
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{author.name}</div>
                    <div className="text-xs text-slate-500">{author.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-slate-400"><span className="font-bold text-slate-200">{author.commits}</span> commits</div>
                  <div className={`flex items-center gap-1 ${isTop ? 'text-emerald-400' : 'text-blue-400'}`}>
                    <Activity className="w-4 h-4" /> {isTop ? 'High Activity' : 'Med Activity'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
