import { Tag, Rocket, GitPullRequest, GitBranch, Users, GitCommit, GitMerge, Calendar } from 'lucide-react';
import { useGitEngineStore } from '../../engine/GitEngineStore';
import { differenceInDays } from 'date-fns';

export function TimelineView() {
  const { history } = useGitEngineStore();

  // Mock narrative milestones (In a real app, this would be computed by analyzing the DAG for merges/tags over time)
  const timelineGroups = [
    {
      month: 'June',
      events: [
        {
          id: 'j1',
          type: 'TAG',
          title: 'Beta Release',
          description: 'Released v1.1.0-beta',
          icon: <Tag className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-500/20 border-emerald-500/50'
        }
      ]
    },
    {
      month: 'May',
      events: [
        {
          id: 'm1',
          type: 'PR',
          title: 'UI Rewrite',
          description: 'Created UI branch, redesigned dashboard, and added settings panel',
          icon: <GitPullRequest className="w-4 h-4 text-purple-400" />,
          color: 'bg-purple-500/20 border-purple-500/50'
        }
      ]
    },
    {
      month: 'April',
      events: [
        {
          id: 'a1',
          type: 'PR',
          title: 'Authentication System',
          description: 'Created auth branch, implemented Firebase Auth, and merged login system',
          icon: <GitPullRequest className="w-4 h-4 text-purple-400" />,
          color: 'bg-purple-500/20 border-purple-500/50'
        }
      ]
    },
    {
      month: 'March',
      events: [
        {
          id: 'ma1',
          type: 'RELEASE',
          title: 'Initial Project Setup',
          description: 'Created repository, configured React, configured Tauri',
          icon: <Rocket className="w-4 h-4 text-blue-400" />,
          color: 'bg-blue-500/20 border-blue-500/50'
        }
      ]
    }
  ];

  // Derive insights from history
  const oldestCommit = history.commits[history.commits.length - 1];
  const ageInDays = oldestCommit ? differenceInDays(new Date(), new Date(oldestCommit.timestamp)) : 0;
  
  // Unique authors
  const uniqueAuthors = new Set(history.commits.map(c => c.author.email)).size;
  
  const totalCommits = history.commits.length;
  const activeBranches = history.branches.length;
  
  // Mocked for MVP, since we don't have a deleted branches table yet
  const mergedBranches = 9; 
  const releasesCount = history.tags.length;

  return (
    <div className="flex w-full h-full bg-slate-950">
      
      {/* Main Timeline Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-blue-500" />
              Project Timeline
            </h1>
            <p className="text-slate-400 mt-2 text-lg">The story of how this repository evolved over time.</p>
          </div>

          <div className="relative pl-4">
            <div className="absolute left-4 top-2 bottom-0 w-px bg-slate-800"></div>

            <div className="space-y-12">
              {timelineGroups.map((group) => (
                <div key={group.month} className="relative">
                  <h2 className="text-2xl font-bold text-slate-200 bg-slate-950 py-2 inline-block relative z-10 pr-4">
                    {group.month}
                  </h2>
                  
                  <div className="mt-6 space-y-8 pl-8">
                    {group.events.map((evt) => (
                      <div key={evt.id} className="relative group">
                        {/* Connecting line to circle */}
                        <div className="absolute -left-8 top-5 w-8 h-px bg-slate-800"></div>
                        
                        {/* Event Circle */}
                        <div className={`absolute -left-11 top-3 w-6 h-6 rounded-full border ${evt.color} bg-slate-950 flex items-center justify-center z-10`}>
                          {evt.icon}
                        </div>

                        {/* Event Card */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                          <h3 className="text-lg font-semibold text-slate-200 mb-2">{evt.title}</h3>
                          <p className="text-slate-400 leading-relaxed">
                            {evt.description.split(', ').map((line, i) => (
                              <span key={i} className="block">• {line}</span>
                            ))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Repository Insights */}
      <div className="w-80 border-l border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-200">Repository Insights</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3 text-slate-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Repository Age</span>
            </div>
            <div className="text-2xl font-bold text-slate-200">{ageInDays || 32} Days</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Contributors</span>
              </div>
              <div className="text-xl font-bold text-slate-200">{uniqueAuthors}</div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <GitCommit className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Commits</span>
              </div>
              <div className="text-xl font-bold text-slate-200">{totalCommits}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <GitBranch className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Active</span>
              </div>
              <div className="text-xl font-bold text-slate-200">{activeBranches}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <GitMerge className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Merged</span>
              </div>
              <div className="text-xl font-bold text-slate-200">{mergedBranches}</div>
            </div>

            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">Total Releases</span>
              </div>
              <div className="text-xl font-bold text-slate-200">{releasesCount}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
