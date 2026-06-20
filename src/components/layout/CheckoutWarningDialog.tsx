import { X, GitBranch, ArrowRight, Package } from "lucide-react";
import { useGitEngineStore } from "../../engine/GitEngineStore";
import { invoke } from "@tauri-apps/api/core";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { useState } from "react";
import { createPortal } from "react-dom";

interface CheckoutWarningDialogProps {
  targetBranch: string;
  onClose: () => void;
}

export function CheckoutWarningDialog({ targetBranch, onClose }: CheckoutWarningDialogProps) {
  const { checkout, HEAD } = useGitEngineStore();
  const repoPath = useRepositoryStore((state) => state.repoPath);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    setIsProcessing(true);
    await checkout(targetBranch);
    setIsProcessing(false);
    onClose();
  };

  const handleStash = async () => {
    setIsProcessing(true);
    if (repoPath) {
      await invoke('git_stash_push', { repoPath, message: `Stash before checking out ${targetBranch}` });
      await checkout(targetBranch);
    }
    setIsProcessing(false);
    onClose();
  };

  const dialog = (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Uncommitted Changes</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto min-h-0">
          <p className="text-sm text-slate-300 leading-relaxed">
            You have uncommitted changes in your working tree. Git natively allows you to switch branches without committing, 
            provided those changes don't conflict with the target branch.
          </p>

          {/* Educational Visualization */}
          <div className="bg-slate-950 rounded-lg p-6 border border-slate-800 relative">
            <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800/50 rounded-bl-lg text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-l border-slate-800">
              Git Behavior
            </div>
            
            <div className="flex items-center justify-between max-w-md mx-auto mt-2">
              {/* Origin Branch */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs font-mono text-slate-400">{HEAD}</span>
              </div>

              {/* Travel Path */}
              <div className="flex-1 flex flex-col items-center px-4 relative">
                <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-blue-500/0 via-amber-400/50 to-amber-400/0 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
                
                {/* Floating Package */}
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 animate-[bounce_3s_ease-in-out_infinite]">
                  <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/40 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-sm">
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-medium text-amber-400 whitespace-nowrap">Working Tree</span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-slate-600 mt-2" />
              </div>

              {/* Target Branch */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs font-mono text-slate-400">{targetBranch}</span>
              </div>
            </div>
            
            <div className="mt-6 text-center text-xs text-slate-500">
              Your uncommitted changes will travel with you to <span className="font-mono text-emerald-400/80">{targetBranch}</span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-1">What would you like to do?</h4>
            <ul className="text-xs text-blue-300/80 space-y-1 list-disc list-inside">
              <li><strong>Continue Checkout:</strong> Carry changes to the new branch. (Git will abort if conflicts occur).</li>
              <li><strong>Stash Changes:</strong> Safely hide changes on the current branch, and checkout cleanly.</li>
              <li><strong>Commit First:</strong> Cancel this, make a commit, and try again.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleStash}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? "Processing..." : "Stash Changes First"}
          </button>
          <button
            onClick={handleContinue}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? "Processing..." : "Continue Checkout"}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    const root = document.getElementById('root') || document.body;
    return createPortal(dialog, root);
  }
  
  return dialog;
}
