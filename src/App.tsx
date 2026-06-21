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
import { DiffViewer } from "./features/staging/DiffViewer";
import { ArrowUp, ArrowDown, RefreshCw, CheckCircle2, AlertTriangle, PanelLeft, PanelRight, X } from "lucide-react";
import { useRepositoryStore } from "./stores/useRepositoryStore";
import { useNavigationStore } from "./stores/useNavigationStore";
import { useLayoutStore } from "./stores/useLayoutStore";
import { useSettingsStore } from "./stores/useSettingsStore";
import { useGitEngineStore } from "./engine/GitEngineStore";
import { useInspectorStore } from "./stores/useInspectorStore";
import { useEffect } from "react";
import { Toaster } from "sonner";

import { MenuBar } from "./components/layout/MenuBar";
import { CreateBranchModal } from "./features/preview/CreateBranchModal";
import { LaunchScreen } from "./features/launch/LaunchScreen";
import { BottomPanel } from "./components/layout/BottomPanel";
import { useOperationStore, setupGitOperationListener } from "./stores/useOperationStore";
import { Loader2 } from "lucide-react";

function App() {
  const repoPath = useRepositoryStore(state => state.repoPath);
  const currentState = useRepositoryStore(state => state.currentState);
  const { fetchRepoState, selectedFile, selectedFileDiff, selectedFileIsStaged, clearSelection, history, HEAD, stageHunk, unstageHunk, isFetching, stagedFiles, unstagedFiles } = useGitEngineStore();
  const { activeInspector } = useInspectorStore();
  const { activeView, graphMode, setGraphMode } = useNavigationStore();

  const currentBranch = history.branches.find(b => b.name === HEAD);
  const aheadCount = currentBranch?.aheadDefault || 0;
  const behindCount = currentBranch?.behindDefault || 0;

  const { leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } = useLayoutStore();
  const operations = useOperationStore(state => state.operations);
  const togglePanel = useOperationStore(state => state.togglePanel);
  const uiMode = useSettingsStore(state => state.uiMode);

  useEffect(() => {
    setupGitOperationListener();
    if (repoPath) {
      fetchRepoState(repoPath);
    }
  }, [repoPath, fetchRepoState]);

  // Real-time repository monitoring (only on window focus)
  useEffect(() => {
    if (!repoPath) return;
    
    const handleFocus = () => {
      useGitEngineStore.getState().fetchRepoState(repoPath);
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [repoPath]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        useLayoutStore.getState().setLeftSidebarOpen(false);
        useLayoutStore.getState().setRightSidebarOpen(false);
      } else {
        useLayoutStore.getState().setLeftSidebarOpen(true);
        useLayoutStore.getState().setRightSidebarOpen(true);
      }
    };
    
    // Check initial layout
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-manage Right Sidebar visibility for source control
  useEffect(() => {
    if (activeInspector === 'staging') {
      if (stagedFiles.length === 0 && unstagedFiles.length === 0) {
        useLayoutStore.getState().setRightSidebarOpen(false);
      } else {
        useLayoutStore.getState().setRightSidebarOpen(true);
      }
    }
  }, [stagedFiles.length, unstagedFiles.length, activeInspector]);

  if (!repoPath) {
    return <LaunchScreen />;
  }

  const isResolvingConflicts = currentState !== 'NORMAL';

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
        if (selectedFile) {
          return (
            <div className="flex-1 relative flex flex-col p-4 overflow-hidden bg-slate-950">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-200">Diff Viewer</h3>
                <button 
                  onClick={clearSelection}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {selectedFileDiff === null ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <DiffViewer diff={selectedFileDiff || ''} filename={selectedFile} onStageHunk={stageHunk} onUnstageHunk={unstageHunk} isStaged={selectedFileIsStaged} />
                )}
              </div>
            </div>
          );
        }

        return (
          <>
            <div className="flex-1 relative flex flex-col">
              {graphMode === 'GIT_GRAPH' && <CommitGraph />}
              {graphMode === 'REPO_FLOW' && <RepoFlowView />}
              {graphMode === 'TIMELINE' && <TimelineView />}
              {uiMode === 'beginner' && <TutorPanel />}
            </div>
            {rightSidebarOpen && <RightSidebarContainer />}
          </>
        );
    }
  };

  return (
    <ContextMenuProvider>
      <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-50 font-sans overflow-hidden">
        <MenuBar />
        <div className="flex flex-1 min-h-0">
          {leftSidebarOpen && <Sidebar />}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
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
                <span className={`flex items-center gap-1 px-2 py-1 rounded ${aheadCount > 0 ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500'}`}>
                  <ArrowUp className="w-3 h-3" />
                  {aheadCount} Ahead
                </span>
                <span className={`flex items-center gap-1 ${behindCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  <ArrowDown className="w-3 h-3" />
                  {behindCount} Behind
                </span>
                <button 
                  onClick={() => repoPath && fetchRepoState(repoPath)}
                  title="If recent changes are not visible yet, press Refresh."
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 ml-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Repository
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


              {isResolvingConflicts ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/50">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Resolving {currentState}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Repo Healthy
                </span>
              )}
              
              {activeView === 'History' && (
                <button 
                  onClick={toggleRightSidebar}
                  className={`p-1.5 rounded-md transition-colors ${rightSidebarOpen ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  title="Toggle Right Panel"
                >
                  <PanelRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </header>

          <div className="flex-1 flex relative overflow-hidden min-h-0">
            {/* Main Area: Either Conflict Resolver, or Active Navigation View */}
            {isResolvingConflicts ? (
              <ConflictResolutionView />
            ) : (
              renderActiveView()
            )}
          </div>
          
          <BottomPanel />
          
          {/* Status Bar */}
          <footer className="h-6 border-t border-slate-800 bg-slate-900/80 shrink-0 flex items-center justify-between px-3 text-xs text-slate-500 z-10 select-none">
            <div className="flex items-center gap-4">
              <span>{repoPath}</span>
            </div>
            <div className="flex items-center gap-2 h-full">
              <button 
                onClick={togglePanel}
                className="flex items-center gap-1.5 hover:text-slate-300 transition-colors px-2 h-full cursor-pointer hover:bg-slate-800"
              >
                {(operations.length > 0 && operations[0]?.status === 'Running') || isFetching ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                    <span>Idle</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        </main>
        </div>
        <CreateBranchModal />
        <Toaster theme="dark" position="bottom-right" richColors />
      </div>
    </ContextMenuProvider>
  );
}

export default App;
