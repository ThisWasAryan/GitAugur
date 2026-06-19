import { Box, Plus } from "lucide-react";

export function ReleasesView() {
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-slate-100">v1.0.0 - Production Launch</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Latest</span>
              </div>
              <div className="text-sm text-slate-400 flex items-center gap-3 mb-6">
                <span>Released 3 days ago by Alice</span>
                <span>•</span>
                <span className="font-mono bg-slate-950 px-1.5 rounded border border-slate-800 text-xs">Tag: v1.0.0</span>
              </div>
              
              <div className="prose prose-invert prose-sm">
                <h3>What's new</h3>
                <ul>
                  <li>Complete graph overhaul</li>
                  <li>Multi-graph view support</li>
                  <li>Conflict resolution UI</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
