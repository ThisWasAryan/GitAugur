import { Sidebar } from "./components/layout/Sidebar";

function App() {
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-800 flex items-center px-6">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-slate-800 rounded text-xs font-medium text-slate-300">
              Clean
            </span>
            <span className="text-sm font-medium">main</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center relative bg-slate-950">
          {/* Subtle grid background to look technical */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {/* Commit Graph Placeholder */}
          <div className="text-center space-y-4 relative z-10">
            <div className="w-24 h-24 border-4 border-slate-800 border-dashed rounded-full flex items-center justify-center mx-auto text-slate-700">
              Graph
            </div>
            <h2 className="text-xl font-semibold text-slate-400">Commit Graph Area</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              The React Flow commit graph visualization will be rendered here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
