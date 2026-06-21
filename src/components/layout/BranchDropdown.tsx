import { useState, useRef, useEffect } from "react";
import { ChevronDown, GitBranch, Check, Plus, AlertTriangle } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { CheckoutWarningDialog } from "./CheckoutWarningDialog";
import { useLayoutStore } from "../../stores/useLayoutStore";


export function BranchDropdown() {
  const { history, HEAD, checkout, createBranch, stagedFiles, unstagedFiles } = useGitEngineStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [checkoutTarget, setCheckoutTarget] = useState<string | null>(null);

  let currentBranch = history.branches.find(b => b.name === HEAD)?.name;
  let isDetached = false;
  let shortHash = "";
  if (!currentBranch) {
    if (HEAD && HEAD.length === 40) {
      shortHash = HEAD.substring(0, 8);
      currentBranch = `Detached HEAD`;
      isDetached = true;
    } else {
      currentBranch = HEAD || "main";
    }
  }

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
    if (stagedFiles.length > 0 || unstagedFiles.length > 0) {
      setCheckoutTarget(branchName);
      setIsOpen(false);
      return;
    }
    checkout(branchName);
    setIsOpen(false);
  };

  const localBranches = history.branches.filter(b => !b.isRemote);
  const remoteBranches = history.branches.filter(b => b.isRemote);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors border ${isDetached ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' : 'hover:bg-slate-900 border-transparent hover:border-slate-800'}`}
      >
        {isDetached && <AlertTriangle className="w-4 h-4 text-amber-500" />}
        <span className={`text-sm font-semibold ${isDetached ? 'text-amber-500' : 'text-slate-200'}`}>
          {currentBranch}
        </span>
        {isDetached && <span className="text-xs font-mono text-amber-600/70">{shortHash}</span>}
        <ChevronDown className={`w-4 h-4 ${isDetached ? 'text-amber-500/60' : 'text-slate-500'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col max-h-[400px]">
          <div className="px-3 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400 shrink-0">
            <span>Switch Branch</span>
          </div>

          {isDetached && (
            <div className="mx-3 mt-3 mb-1 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md shrink-0">
              <h4 className="text-xs font-bold text-amber-500 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> What is Detached HEAD?
              </h4>
              <p className="text-[10px] text-amber-400/80 leading-relaxed">
                You are currently viewing a specific commit or remote branch rather than an active local branch. 
                Any new commits made here won't belong to any branch. 
                <br/><br/>
                <strong>How to fix:</strong> Checkout a local branch below, or create a new tracking branch.
              </p>
            </div>
          )}
          
          <div className="overflow-y-auto flex-1 py-1">
            {localBranches.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Local Branches</div>
                {localBranches.map(branch => (
                  <button
                    key={branch.name}
                    onClick={() => handleCheckout(branch.name)}
                    className="w-full text-left px-4 py-1.5 text-sm flex items-center justify-between hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                      <span className={branch.name === HEAD ? "font-semibold text-blue-400" : "text-slate-200"}>
                        {branch.name}
                      </span>
                    </div>
                    {branch.name === HEAD && <Check className="w-4 h-4 text-blue-500" />}
                  </button>
                ))}
              </div>
            )}

            {remoteBranches.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Remote Branches</div>
                {remoteBranches.map(branch => (
                  <div key={branch.name} className="w-full px-4 py-1.5 text-sm flex items-center justify-between hover:bg-slate-800 transition-colors group">
                    <button
                      onClick={() => handleCheckout(branch.name)}
                      className="flex-1 text-left flex items-center gap-2"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-slate-600" />
                      <span className={branch.name === HEAD ? "font-semibold text-blue-400" : "text-slate-400"}>
                        {branch.name}
                      </span>
                    </button>
                    {branch.name === HEAD ? (
                      <Check className="w-4 h-4 text-blue-500 shrink-0 ml-2" />
                    ) : (
                      <button 
                        onClick={() => handleCheckout(branch.name)}
                        className="opacity-0 group-hover:opacity-100 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 px-2 py-0.5 rounded transition-all shrink-0 ml-2"
                      >
                        Checkout Branch
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 p-2 shrink-0 bg-slate-950/30">
              <button 
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  useLayoutStore.getState().setCreateBranchModal(true, HEAD || 'HEAD');
                }}
              >
                <Plus className="w-4 h-4" />
                Create new branch...
              </button>
          </div>
        </div>
      )}
      
      {checkoutTarget && (
        <CheckoutWarningDialog 
          targetBranch={checkoutTarget} 
          onClose={() => setCheckoutTarget(null)} 
        />
      )}
    </div>
  );
}
