import { useState } from 'react';
import { useTerminology } from '../../hooks/useTerminology';
import { useRepositoryStore } from '../../stores/useRepositoryStore';
import { open } from "@tauri-apps/plugin-dialog";
import { useLayoutStore } from '../../stores/useLayoutStore';
import { useNavigationStore } from '../../stores/useNavigationStore';

type MenuState = 'File' | 'Edit' | 'Branch' | 'Tools' | null;

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<MenuState>(null);
  const { t } = useTerminology();
  const { setRepoPath } = useRepositoryStore();
  const setCreateBranchModal = useLayoutStore(state => state.setCreateBranchModal);
  const setActiveView = useNavigationStore(state => state.setActiveView);

  const handleUndo = async () => {
    closeMenu();
    const { useGitEngineStore } = await import('../../engine/GitEngineStore');
    await useGitEngineStore.getState().undo();
  };

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

  return (
    <div className="flex h-8 bg-slate-950 border-b border-slate-900 text-slate-300 text-xs px-2 select-none relative z-50 shrink-0 items-center">
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
            <div className="h-px bg-slate-700 my-1"></div>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white" onClick={handleCloseRepo}>Close Repository</button>
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
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white" onClick={handleUndo}>Undo (Reset hard HEAD@1)</button>
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
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white" onClick={() => { closeMenu(); setCreateBranchModal(true); }}>Create...</button>
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
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white" onClick={() => { closeMenu(); setActiveView('Stashes'); }}>{t('Stash')}es</button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-blue-600 hover:text-white" onClick={() => { closeMenu(); setActiveView('Tags'); }}>Tags</button>
          </div>
        )}
      </div>

    </div>
  );
}
