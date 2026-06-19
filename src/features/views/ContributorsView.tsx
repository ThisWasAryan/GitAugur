import { Users, Activity } from "lucide-react";

export function ContributorsView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-8 overflow-auto">
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
          <div className="text-3xl font-bold text-slate-200">142</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-500 text-sm font-medium mb-2">Active Contributors</div>
          <div className="text-3xl font-bold text-slate-200">3</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="text-slate-500 text-sm font-medium mb-2">Lines Changed</div>
          <div className="text-3xl font-bold text-emerald-400">+12k / -4k</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="font-medium text-slate-300">Top Contributors</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <div className="font-semibold text-slate-200">Alice</div>
                <div className="text-xs text-slate-500">alice@example.com</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-slate-400"><span className="font-bold text-slate-200">89</span> commits</div>
              <div className="flex items-center gap-1 text-emerald-400">
                <Activity className="w-4 h-4" /> High Activity
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                B
              </div>
              <div>
                <div className="font-semibold text-slate-200">Bob</div>
                <div className="text-xs text-slate-500">bob@example.com</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-slate-400"><span className="font-bold text-slate-200">42</span> commits</div>
              <div className="flex items-center gap-1 text-blue-400">
                <Activity className="w-4 h-4" /> Med Activity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
