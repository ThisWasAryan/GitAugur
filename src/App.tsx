import { Sidebar } from "./components/layout/Sidebar";
import { CommitGraph } from "./features/commit-graph/CommitGraph";
import { StagingPanel } from "./features/staging/StagingPanel";

function App() {
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-800 flex items-center px-6 z-10 bg-slate-950/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-slate-800 rounded text-xs font-medium text-slate-300">
              Clean
            </span>
            <span className="text-sm font-medium">main</span>
          </div>
        </header>
        <div className="flex-1 flex relative overflow-hidden">
          <div className="flex-1 relative">
            <CommitGraph />
          </div>
          <StagingPanel />
        </div>
      </main>
    </div>
  );
}

export default App;
