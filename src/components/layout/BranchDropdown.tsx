import { useState, useRef, useEffect } from "react";
import { ChevronDown, GitBranch, Check, Plus } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";


export function BranchDropdown() {
  const { history, checkout } = useGitEngineStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentBranch = history.branches.find(b => b.isCurrent)?.name || "main";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckout = (branchName: string) => {
    checkout(branchName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-900 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-slate-800"
      >
        <span className="text-sm font-semibold text-slate-200">{currentBranch}</span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Switch Branch</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {history.branches.map(branch => (
              <button
                key={branch.name}
                onClick={() => handleCheckout(branch.name)}
                className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                  <span className={branch.isCurrent ? "font-semibold text-blue-400" : "text-slate-200"}>
                    {branch.name}
                  </span>
                </div>
                {branch.isCurrent && <Check className="w-4 h-4 text-blue-500" />}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-800 p-2">
            <button 
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
              onClick={() => {
                setIsOpen(false);
                // Future: open create branch modal
              }}
            >
              <Plus className="w-4 h-4" />
              Create new branch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
