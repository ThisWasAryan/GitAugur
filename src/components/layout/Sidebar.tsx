import {
  FolderGit2,
  GitBranch,
  Tags,
  GitPullRequest,
  Users,
  Box,
  Archive,
  Settings,
  History
} from "lucide-react";

import { usePRStore } from "../../stores/usePRStore";
import { useNavigationStore } from "../../stores/useNavigationStore";
import type { ViewType } from "../../stores/useNavigationStore";

export function Sidebar() {
  const pullRequests = usePRStore(state => state.pullRequests);
  const { activeView, setActiveView } = useNavigationStore();

  const navItems: { name: ViewType | "Stashes", icon: any }[] = [
    { name: "History", icon: History },
    { name: "Files", icon: FolderGit2 },
    { name: "Branches", icon: GitBranch },
    { name: "Tags", icon: Tags },
    { name: "Pull Requests", icon: GitPullRequest },
    { name: "Contributors", icon: Users },
    { name: "Releases", icon: Box },
    { name: "Stashes", icon: Archive },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-500 rounded-md"></div>
        <h1 className="font-semibold text-white">GitAugur</h1>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Repository
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <button 
                onClick={() => item.name !== "Stashes" && setActiveView(item.name as ViewType)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors ${activeView === item.name ? 'bg-slate-800 text-white' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${activeView === item.name ? 'text-blue-400' : ''}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {item.name === 'Pull Requests' && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pullRequests.length}
                  </span>
                )}
              </button>
              {item.name === 'Pull Requests' && activeView === 'Pull Requests' && (
                <ul className="mt-1 ml-4 space-y-1 pl-3 border-l border-slate-700/50">
                  {pullRequests.map(pr => (
                    <li key={pr.id}>
                      <button className="w-full text-left block px-2 py-1.5 rounded hover:bg-slate-800/80 transition-colors">
                        <div className="text-xs text-slate-300 font-medium truncate" title={pr.title}>
                          {pr.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-slate-400">#{pr.id.split('-')[1]}</span>
                          <span>by {pr.author}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
