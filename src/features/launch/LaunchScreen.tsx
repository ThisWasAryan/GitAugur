import { FolderOpen, GitBranch, Loader2 } from "lucide-react";
import { useRepositoryStore } from "../../stores/useRepositoryStore";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export function LaunchScreen() {
  const { setRepoPath } = useRepositoryStore();

  const [isOpening, setIsOpening] = useState(false);

  const handleOpenRepository = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: "Select Git Repository",
      });

      if (selectedPath && typeof selectedPath === 'string') {
        setIsOpening(true);
        await new Promise(resolve => setTimeout(resolve, 50));
        setRepoPath(selectedPath);
      }
    } catch (err) {
      console.error("Failed to open dialog:", err);
    }
  };

  const [cloneUrl, setCloneUrl] = useState("");
  const [cloneDestPath, setCloneDestPath] = useState("");
  const [isCloning, setIsCloning] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);

  const normalizeGitUrl = (url: string) => {
    let normalized = url.trim();
    if (normalized.startsWith('http') && !normalized.endsWith('.git')) {
      normalized += '.git';
    }
    return normalized;
  };

  const handleSelectDestFolder = async () => {
    try {
      const destPath = await open({
        directory: true,
        multiple: false,
        title: "Select Destination Directory to Clone",
      });

      if (destPath && typeof destPath === 'string') {
        const normalizedUrl = normalizeGitUrl(cloneUrl);
        const repoName = normalizedUrl.split('/').pop()?.replace('.git', '') || 'cloned_repo';
        const fullDestPath = `${destPath}/${repoName}`;
        setCloneDestPath(fullDestPath);
      }
    } catch (err) {
      console.error("Failed to open dialog:", err);
    }
  };

  const [cloneStatus, setCloneStatus] = useState("");

  const handleCloneRepository = async () => {
    if (!cloneUrl || !cloneDestPath) return;
    try {
      setIsCloning(true);
      setCloneStatus("Downloading objects...");
      // Yield to React to paint the loading UI before synchronous backend blocks
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const normalizedUrl = normalizeGitUrl(cloneUrl);
      await invoke('git_clone', { url: normalizedUrl, path: cloneDestPath });
      
      setCloneStatus("Checking out branches...");
      await new Promise(resolve => setTimeout(resolve, 50));
      await invoke('git_checkout_all_remotes', { repoPath: cloneDestPath });
      
      setIsCloning(false);
      setShowCloneModal(false);
      setRepoPath(cloneDestPath);
    } catch (err) {
      console.error("Clone failed:", err);
      setIsCloning(false);
      alert("Clone failed: " + err);
    }
  };

  const resetCloneModal = () => {
    setShowCloneModal(false);
    setCloneUrl("");
    setCloneDestPath("");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-50 font-sans p-8">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-5xl font-bold text-slate-100 mb-4 bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
          GitAugur
        </h1>
        <p className="text-lg text-slate-400">
          The easiest way to understand, visualize, and predict Git.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Open Repository */}
        <div 
          onClick={handleOpenRepository}
          className="bg-slate-900 border border-slate-800 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-all group flex flex-col items-center text-center relative overflow-hidden"
        >
          {isOpening && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
              <span className="text-sm font-semibold text-white">Opening Repository...</span>
            </div>
          )}
          <div className="w-16 h-16 bg-blue-950/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FolderOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Open Repository</h2>
          <p className="text-sm text-slate-400">
            Open an existing local Git repository on your computer.
          </p>
        </div>

        {/* Clone Repository */}
        <div 
          onClick={() => setShowCloneModal(true)}
          className="bg-slate-900 border border-slate-800 rounded-xl p-8 cursor-pointer hover:border-emerald-500 hover:bg-slate-800/50 transition-all group flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-emerald-950/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <GitBranch className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Clone Repository</h2>
          <p className="text-sm text-slate-400">
            Clone a remote repository from GitHub directly into a new folder.
          </p>
        </div>
      </div>

      {showCloneModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-[480px] relative overflow-hidden">
            <h3 className="text-xl font-semibold text-slate-200 mb-4">Clone Repository</h3>
            <p className="text-slate-400 text-sm mb-4">Enter the Git URL of the repository you want to clone.</p>
            <input 
              type="text" 
              placeholder="https://github.com/user/repo" 
              value={cloneUrl}
              onChange={(e) => setCloneUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 mb-4 focus:outline-none focus:border-blue-500"
              disabled={isCloning}
            />

            {cloneUrl && !cloneDestPath && (
              <button
                onClick={handleSelectDestFolder}
                className="w-full py-2 mb-6 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                disabled={isCloning}
              >
                Select Destination Folder
              </button>
            )}

            {cloneDestPath && (
              <div className="mb-6 bg-slate-950 p-3 rounded border border-slate-800">
                <p className="text-xs text-slate-500 mb-1 font-semibold uppercase">Cloning into</p>
                <p className="text-sm text-blue-400 font-mono break-all">{cloneDestPath}</p>
                <button 
                  onClick={handleSelectDestFolder}
                  className="text-xs text-slate-400 hover:text-slate-200 underline mt-2"
                  disabled={isCloning}
                >
                  Change Destination
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button 
                onClick={resetCloneModal}
                disabled={isCloning}
                className="px-4 py-2 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleCloneRepository}
                disabled={!cloneDestPath || isCloning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isCloning ? 'Cloning...' : 'Clone'}
              </button>
            </div>
            
            {isCloning && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{cloneStatus || "Cloning Repository"}</h3>
                <p className="text-slate-400 text-sm">This may take a while depending on the repository size...</p>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                  <div className="absolute inset-y-0 left-0 bg-blue-400 w-1/3 rounded-full animate-[bounce_1.5s_infinite]"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
