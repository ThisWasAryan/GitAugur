import { Tags, Plus } from "lucide-react";

export function TagsView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Tags className="w-8 h-8 text-amber-500" />
            Tags
          </h1>
          <p className="text-slate-400 mt-1">Mark important points in your repository history.</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-amber-900/20">
          <Plus className="w-4 h-4" />
          Create Tag
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <Tags className="w-5 h-5 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-200">v1.0.0</div>
                <div className="text-xs text-slate-500 mt-0.5">Initial stable release • 3 days ago</div>
              </div>
            </div>
            <div className="font-mono text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              1b4a4e5
            </div>
          </div>
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <Tags className="w-5 h-5 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-200">v0.9.0-beta</div>
                <div className="text-xs text-slate-500 mt-0.5">Beta release for testing • 2 weeks ago</div>
              </div>
            </div>
            <div className="font-mono text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              f8c32d1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
