import {
  FolderGit2,
  GitBranch,
  Tags,
  Users,
  Archive,
  Settings,
  History
} from "lucide-react";

import { useNavigationStore } from "../../stores/useNavigationStore";
import type { ViewType } from "../../stores/useNavigationStore";

export function Sidebar() {
  const { activeView, setActiveView } = useNavigationStore();

  const navItems: { name: ViewType | "Stashes", icon: any }[] = [
    { name: "History", icon: History },
    { name: "Files", icon: FolderGit2 },
    { name: "Branches", icon: GitBranch },
    { name: "Tags", icon: Tags },
    { name: "Contributors", icon: Users },
    { name: "Stashes", icon: Archive },
  ];

  return (
    <div className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
      <div className="h-14 px-4 border-b border-slate-800 flex items-center shrink-0">
        <h1 className="text-xl font-bold text-white tracking-wide">GitAugur</h1>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Repository
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <button 
                onClick={() => setActiveView(item.name as ViewType)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors ${activeView === item.name ? 'bg-slate-800 text-white' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${activeView === item.name ? 'text-blue-400' : ''}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <button 
          onClick={() => setActiveView('Settings' as ViewType)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors ${activeView === 'Settings' ? 'bg-slate-800 text-white' : ''}`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
