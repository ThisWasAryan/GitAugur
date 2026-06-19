import { Sidebar } from "./components/layout/Sidebar";
import { CommitGraph } from "./features/commit-graph/CommitGraph";
import { StagingPanel } from "./features/staging/StagingPanel";
import { ConflictResolutionView } from "./features/conflicts/ConflictResolutionView";
import { FilesView } from "./features/views/FilesView";
import { BranchesView } from "./features/views/BranchesView";
import { TagsView } from "./features/views/TagsView";
import { ContributorsView } from "./features/views/ContributorsView";
import { ReleasesView } from "./features/views/ReleasesView";
import { PullRequestsView } from "./features/views/PullRequestsView";
import { ChevronDown, ArrowUp, ArrowDown, RefreshCw, Info, CheckCircle2, AlertTriangle, Presentation } from "lucide-react";
import { useRepositoryStore } from "./stores/useRepositoryStore";
import { useNavigationStore } from "./stores/useNavigationStore";

function App() {
  const currentState = useRepositoryStore(state => state.currentState);
  const toggleMergeState = useRepositoryStore(state => state.toggleMergeState);
  const { activeView, graphMode, setGraphMode } = useNavigationStore();

  const isMerging = currentState === 'MERGING';

  const renderActiveView = () => {
    switch (activeView) {
      case 'Files': return <FilesView />;
      case 'Branches': return <BranchesView />;
      case 'Tags': return <TagsView />;
      case 'Contributors': return <ContributorsView />;
      case 'Releases': return <ReleasesView />;
      case 'Pull Requests': return <PullRequestsView />;
      case 'History':
      default:
        return (
          <>
            <div className="flex-1 relative flex flex-col">
              <CommitGraph />

              {/* Contextual Guidance Panel (Floating at bottom) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20 pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl flex gap-4 pointer-events-auto items-start">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-1">Beginner Guidance: Working Tree Clean</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You are on the <span className="text-slate-300 font-mono">main</span> branch. You have 1 local commit that hasn't been pushed to the remote repository yet. Click "Push to origin" to share your changes with the team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <StagingPanel />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Expanded Top Header */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 z-10 bg-slate-950/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-4">
            
            {/* Branch Switcher */}
            <button className="flex items-center gap-2 hover:bg-slate-900 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-slate-800">
              <span className="text-sm font-semibold text-slate-200">main</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <div className="w-px h-6 bg-slate-800"></div>

            {/* Ahead/Behind Sync Status */}
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded">
                <ArrowUp className="w-3 h-3" />
                1 Ahead
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <ArrowDown className="w-3 h-3" />
                0 Behind
              </span>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 ml-2 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Fetch origin
              </button>
            </div>
          </div>

          {/* Repo Health & Global Actions */}
          <div className="flex items-center gap-3">
            
            {/* Graph Mode Switcher */}
            {activeView === 'History' && (
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 mr-4">
                <button 
                  onClick={() => setGraphMode('GIT_GRAPH')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${graphMode === 'GIT_GRAPH' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Git Graph
                </button>
                <button 
                  onClick={() => setGraphMode('REPO_FLOW')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${graphMode === 'REPO_FLOW' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Presentation className="w-3.5 h-3.5" />
                  Repo Flow
                </button>
                <button 
                  onClick={() => setGraphMode('TIMELINE')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${graphMode === 'TIMELINE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Timeline
                </button>
              </div>
            )}

            <button 
              onClick={toggleMergeState}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
            >
              Toggle Demo Conflict
            </button>
            {isMerging ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/50">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Merge Conflicts
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Repo Healthy
              </span>
            )}
          </div>
        </header>

        <div className="flex-1 flex relative overflow-hidden">
          {/* Main Area: Either Conflict Resolver, or Active Navigation View */}
          {isMerging ? (
            <ConflictResolutionView />
          ) : (
            renderActiveView()
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
