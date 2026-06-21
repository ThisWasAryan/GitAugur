import { GitMerge, GitBranch, Trash2, ArrowRight, X, GitCommit } from "lucide-react";
import { useState } from "react";

export type ActionPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (strategy?: 'standard' | 'squash' | 'ff-only') => void;
  action: 'MERGE' | 'CHECKOUT' | 'DELETE' | null;
  branchName?: string;
  targetBranch?: string;
};

export function ActionPreviewModal({ isOpen, onClose, onConfirm, action, branchName, targetBranch }: ActionPreviewProps) {
  const [strategy, setStrategy] = useState<'standard' | 'squash' | 'ff-only'>('standard');

  if (!isOpen || !action) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            {action === 'MERGE' && <><GitMerge className="text-purple-400" /> Preview Merge</>}
            {action === 'CHECKOUT' && <><GitBranch className="text-blue-400" /> Preview Checkout</>}
            {action === 'DELETE' && <><Trash2 className="text-rose-400" /> Preview Deletion</>}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prediction Visualizer */}
        <div className="p-6 bg-slate-950/50 flex flex-col items-center justify-center py-10 relative overflow-hidden">
          
          {action === 'MERGE' && (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-12">
                  {/* Target */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center z-10">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{targetBranch}</span>
                  </div>

                  {/* Source */}
                  <div className="flex flex-col items-center gap-2 relative">
                    <div className="absolute top-1/2 -left-12 w-12 h-0.5 bg-purple-500/50 -translate-y-1/2"></div>
                    <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 bg-purple-900/20 flex items-center justify-center z-10">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    </div>
                    <span className="text-xs font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded">{branchName}</span>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-600 rotate-90" />

                {/* Result */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center z-10 ${strategy === 'squash' ? 'border-amber-500/50 bg-amber-900/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-emerald-500/50 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}>
                    <GitCommit className={`w-6 h-6 ${strategy === 'squash' ? 'text-amber-400' : 'text-emerald-400'}`} />
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${strategy === 'squash' ? 'text-amber-400 bg-amber-950/50' : 'text-emerald-400 bg-emerald-950/50'}`}>
                    {strategy === 'squash' ? 'Squashed Commit' : strategy === 'ff-only' ? 'Fast-Forward' : 'New Merge Commit'}
                  </span>
                </div>
              </div>

              {/* Strategy Selector */}
              <div className="w-full mt-6 bg-slate-900 border border-slate-800 rounded-lg p-2 flex gap-2">
                <button 
                  onClick={() => setStrategy('standard')}
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${strategy === 'standard' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Standard Merge
                </button>
                <button 
                  onClick={() => setStrategy('squash')}
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${strategy === 'squash' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Squash Merge
                </button>
                <button 
                  onClick={() => setStrategy('ff-only')}
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${strategy === 'ff-only' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Fast-Forward Only
                </button>
              </div>
            </div>
          )}

          {action === 'CHECKOUT' && (
            <div className="flex flex-col items-center gap-6 text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <GitBranch className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">Your working directory files will be instantly updated to match the exact state of <span className="font-mono text-blue-400 bg-blue-950/50 px-1 rounded">{branchName}</span>.</p>
              </div>
            </div>
          )}

          {action === 'DELETE' && (
            <div className="flex flex-col items-center gap-6 text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">The branch pointer <span className="font-mono text-rose-400 bg-rose-950/50 px-1 rounded">{branchName}</span> will be permanently removed. The underlying commits will remain unless they are unreferenced.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-900">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm(action === 'MERGE' ? strategy : undefined);
              onClose();
            }}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors shadow-lg ${
              action === 'MERGE' ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20' :
              action === 'CHECKOUT' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' :
              'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20'
            }`}
          >
            Confirm {action === 'MERGE' ? 'Merge' : action === 'CHECKOUT' ? 'Checkout' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
