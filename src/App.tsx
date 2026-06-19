import { Sidebar } from "./components/layout/Sidebar";
import { CommitGraph } from "./features/commit-graph/CommitGraph";
import { RightSidebarContainer } from "./components/layout/RightSidebarContainer";
import { BranchDropdown } from "./components/layout/BranchDropdown";
import { ContextMenuProvider } from "./components/ui/ContextMenu";
import { ConflictResolutionView } from "./features/conflicts/ConflictResolutionView";
import { FilesView } from "./features/views/FilesView";
import { BranchesView } from "./features/views/BranchesView";
import { TagsView } from "./features/views/TagsView";
import { ContributorsView } from "./features/views/ContributorsView";
import { ReleasesView } from "./features/views/ReleasesView";
import { PullRequestsView } from "./features/views/PullRequestsView";
import { SettingsView } from "./features/views/SettingsView";
import { StashesView } from "./features/views/StashesView";
import { RepoFlowView } from "./features/views/RepoFlowView";
import { TimelineView } from "./features/views/TimelineView";
import { TutorPanel } from "./components/layout/TutorPanel";
import { ArrowUp, ArrowDown, RefreshCw, CheckCircle2, AlertTriangle, PanelLeft, PanelRight } from "lucide-react";
import { useRepositoryStore } from "./stores/useRepositoryStore";
import { useNavigationStore } from "./stores/useNavigationStore";
import { useLayoutStore } from "./stores/useLayoutStore";

function App() {
  const currentState = useRepositoryStore(state => state.currentState);
  const toggleMergeState = useRepositoryStore(state => state.toggleMergeState);
  const { activeView, graphMode, setGraphMode } = useNavigationStore();

  const { leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } = useLayoutStore();

  const isMerging = currentState === 'MERGING';

  const renderActiveView = () => {
    switch (activeView) {
      case 'Files': return <FilesView />;
      case 'Branches': return <BranchesView />;
      case 'Tags': return <TagsView />;
      case 'Contributors': return <ContributorsView />;
      case 'Releases': return <ReleasesView />;
      case 'Pull Requests': return <PullRequestsView />;
      case 'Stashes': return <StashesView />;
      case 'Settings': return <SettingsView />;
      case 'History':
      default:
        return (
          <>
            <div className="flex-1 relative flex flex-col">
              {graphMode === 'GIT_GRAPH' && <CommitGraph />}
              {graphMode === 'REPO_FLOW' && <RepoFlowView />}
              {graphMode === 'TIMELINE' && <TimelineView />}
              <TutorPanel />
            </div>
            {rightSidebarOpen && <RightSidebarContainer />}
          </>
        );
    }
  };

  return (
    <ContextMenuProvider>
      <div className="flex h-screen w-full bg-slate-950 text-slate-50 font-sans overflow-hidden">
        {leftSidebarOpen && <Sidebar />}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Expanded Top Header */}
          <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 z-10 bg-slate-950/80 backdrop-blur shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleLeftSidebar}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors mr-2"
                title="Toggle Sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
              
              <BranchDropdown />

              <div className="w-px h-6 bg-slate-800 mx-2"></div>

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
                <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 mr-2">
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
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Repo Healthy
                </span>
              )}
              
              <button 
                onClick={toggleRightSidebar}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                title="Toggle Right Panel"
              >
                <PanelRight className="w-5 h-5" />
              </button>
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
    </ContextMenuProvider>
  );
}

export default App;
