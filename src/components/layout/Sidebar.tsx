import {
  FolderGit2,
  GitBranch,
  Tags,
  GitPullRequest,
  Users,
  Box,
  Archive,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const navItems = [
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
      
      <div className="p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Repository
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </a>
      </div>
    </div>
  );
}
