import { Box, Plus } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { formatDistanceToNow } from "date-fns";

export function ReleasesView() {
  const { history } = useGitEngineStore();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Box className="w-8 h-8 text-purple-500" />
            Releases
          </h1>
          <p className="text-slate-400 mt-1">Software versions and release notes.</p>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-purple-900/20">
          <Plus className="w-4 h-4" />
          Draft Release
        </button>
      </div>

      <div className="space-y-6">
        {history.tags.length > 0 ? (
          history.tags.map((tag, index) => {
            const commit = history.commits.find(c => c.hash === tag.commitHash);
            const dateStr = commit ? formatDistanceToNow(new Date(commit.timestamp), { addSuffix: true }) : 'Unknown time';
            const isLatest = index === 0;

            return (
              <div key={tag.name} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 relative">
                {isLatest && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-slate-100">{tag.name} Release</h2>
                      {isLatest && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Latest</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 flex items-center gap-3 mb-6">
                      <span>Released {dateStr} by {commit?.author.name || 'Unknown'}</span>
                      <span>•</span>
                      <span className="font-mono bg-slate-950 px-1.5 rounded border border-slate-800 text-xs">Tag: {tag.name}</span>
                    </div>
                    
                    <div className="prose prose-invert prose-sm">
                      <h3>What's new</h3>
                      <ul>
                        <li>Automated release notes from commits</li>
                        <li>Update dependencies</li>
                        <li>General improvements and bug fixes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
            No releases found. Create a tag to draft your first release.
          </div>
        )}
      </div>
    </div>
  );
}
