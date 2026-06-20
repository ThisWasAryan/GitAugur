import { useState } from 'react';
import { useTerminology } from '../../hooks/useTerminology';
import { useRepositoryStore } from '../../stores/useRepositoryStore';
import { open } from "@tauri-apps/plugin-dialog";

type MenuState = 'File' | 'Edit' | 'Repository' | 'Branch' | 'History' | 'Tools' | 'Help' | null;

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<MenuState>(null);
  const { t } = useTerminology();
  const { setRepoPath } = useRepositoryStore();

  const handleMenuClick = (menu: MenuState) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const closeMenu = () => setActiveMenu(null);

  const handleOpenRepo = async () => {
    closeMenu();
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: "Select Git Repository",
      });
      if (selectedPath && typeof selectedPath === 'string') {
        setRepoPath(selectedPath);
      }
    } catch (err) {
      console.error("Failed to open dialog:", err);
    }
  };

  const handleCloseRepo = () => {
    closeMenu();
    setRepoPath(null);
  };

  // This is a basic structural MenuBar. We'll wire the backend commands later.
  return (
    <div className="flex bg-slate-950 border-b border-slate-900 text-slate-300 text-xs px-2 select-none relative z-50 shrink-0">
      <div 
        className="fixed inset-0 z-[-1]" 
        style={{ display: activeMenu ? 'block' : 'none' }} 
        onClick={closeMenu}
      />
      
      {/* File Menu */}
      <div className="relative">
        <button 
          className={`px-3 py-1.5 hover:bg-slate-800 rounded-sm transition-colors ${activeMenu === 'File' ? 'bg-slate-800' : ''}`}
          onClick={() => handleMenuClick('File')}
        >
          File
        </button>
        {activeMenu === 'File' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white" onClick={handleOpenRepo}>Open Repository...</button>
            <button className="w-full text-left px-4 py-1.5 text-slate-500 cursor-not-allowed">Clone Repository...</button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white" onClick={handleCloseRepo}>Close Repository</button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button className="w-full text-left px-4 py-1.5 text-slate-500 cursor-not-allowed">Exit</button>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button 
          className={`px-3 py-1.5 hover:bg-slate-800 rounded-sm transition-colors ${activeMenu === 'Edit' ? 'bg-slate-800' : ''}`}
          onClick={() => handleMenuClick('Edit')}
        >
          Edit
        </button>
        {activeMenu === 'Edit' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Undo</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Redo</button>
          </div>
        )}
      </div>

      {/* Repository Menu */}
      <div className="relative">
        <button 
          className={`px-3 py-1.5 hover:bg-slate-800 rounded-sm transition-colors ${activeMenu === 'Repository' ? 'bg-slate-800' : ''}`}
          onClick={() => handleMenuClick('Repository')}
        >
          Repository
        </button>
        {activeMenu === 'Repository' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Fetch</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Pull</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Push</button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Sync</button>
          </div>
        )}
      </div>

      {/* Branch Menu */}
      <div className="relative">
        <button 
          className={`px-3 py-1.5 hover:bg-slate-800 rounded-sm transition-colors ${activeMenu === 'Branch' ? 'bg-slate-800' : ''}`}
          onClick={() => handleMenuClick('Branch')}
        >
          Branch
        </button>
        {activeMenu === 'Branch' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Create...</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Checkout...</button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Merge...</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">{t('Rebase')}...</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">{t('Cherry Pick')}...</button>
          </div>
        )}
      </div>

      {/* History Menu */}
      <div className="relative">
        <button 
          className={`px-3 py-1.5 hover:bg-slate-800 rounded-sm transition-colors ${activeMenu === 'History' ? 'bg-slate-800' : ''}`}
          onClick={() => handleMenuClick('History')}
        >
          History
        </button>
        {activeMenu === 'History' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Reorder...</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">{t('Squash')}...</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Revert...</button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">{t('Interactive Rebase')}...</button>
          </div>
        )}
      </div>

      {/* Tools Menu */}
      <div className="relative">
        <button 
          className={`px-3 py-1.5 hover:bg-slate-800 rounded-sm transition-colors ${activeMenu === 'Tools' ? 'bg-slate-800' : ''}`}
          onClick={() => handleMenuClick('Tools')}
        >
          Tools
        </button>
        {activeMenu === 'Tools' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">{t('Stash')}es</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Tags</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Releases</button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Conflict Resolution</button>
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button 
          className={`px-3 py-1.5 hover:bg-slate-800 rounded-sm transition-colors ${activeMenu === 'Help' ? 'bg-slate-800' : ''}`}
          onClick={() => handleMenuClick('Help')}
        >
          Help
        </button>
        {activeMenu === 'Help' && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50">
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Documentation</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">Learning Mode</button>
            <div className="h-px bg-slate-700 my-1"></div>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white">About GitAugur</button>
          </div>
        )}
      </div>

    </div>
  );
}
