import { useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useGitEngineStore } from '../../engine/GitEngineStore';
import { branchColorPalette } from '../../utils/branchColors';
import { GitBranch, X } from 'lucide-react';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBranchModal({ isOpen, onClose }: CreateBranchModalProps) {
  const { history, createBranch } = useGitEngineStore();
  const { setCustomBranchColor } = useSettingsStore();

  const [branchName, setBranchName] = useState('');
  const [baseBranch, setBaseBranch] = useState('HEAD');
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!branchName.trim()) return;
    
    // Save color preference
    setCustomBranchColor(branchName.trim(), selectedColorIdx);
    
    // Execute branch creation
    const base = baseBranch === 'HEAD' ? undefined : baseBranch;
    createBranch(branchName.trim(), base);
    
    // Reset and close
    setBranchName('');
    setBaseBranch('HEAD');
    setSelectedColorIdx(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <GitBranch className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Create New Branch</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Branch Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Branch Name</label>
            <input 
              type="text" 
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="e.g. feature/new-login"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
              autoFocus
            />
          </div>

          {/* Base Branch */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Based On</label>
            <select 
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-all text-sm"
            >
              <option value="HEAD">Current Branch (HEAD)</option>
              {history.branches.map(b => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Custom Color Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Branch Color</label>
            <div className="flex flex-wrap gap-2">
              {branchColorPalette.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${color.bg} ${selectedColorIdx === idx ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105'}`}
                  title={`Color ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!branchName.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg flex items-center gap-2 ${
              branchName.trim() 
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Create Branch
          </button>
        </div>
      </div>
    </div>
  );
}
