import { FolderGit2, FileCode2, FileJson, FileText, ChevronRight, ChevronDown, SplitSquareHorizontal } from "lucide-react";
import { useFileStore, type FileNode } from "../../stores/useFileStore";
import { useContextMenu } from "../../components/ui/ContextMenu";

export function FilesView() {
  const { files, activeFileId, setActiveFile, toggleFolder } = useFileStore();
  const { showMenu } = useContextMenu();

  const getActiveFileContent = (nodes: FileNode[], targetId: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = getActiveFileContent(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const activeFile = activeFileId ? getActiveFileContent(files, activeFileId) : null;

  const getFileIcon = (name: string, isIgnored?: boolean) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode2 className={`w-4 h-4 ${isIgnored ? 'text-slate-600' : 'text-blue-400'}`} />;
    if (name.endsWith('.json')) return <FileJson className={`w-4 h-4 ${isIgnored ? 'text-slate-600' : 'text-amber-400'}`} />;
    return <FileText className={`w-4 h-4 ${isIgnored ? 'text-slate-600' : 'text-slate-400'}`} />;
  };

  const renderTree = (nodes: FileNode[], depth: number = 0) => {
    return nodes.map(node => {
      const paddingLeft = depth * 16 + 8;
      
      if (node.type === 'folder') {
        return (
          <div key={node.id}>
            <div 
              onClick={() => toggleFolder(node.id)}
              className="flex items-center gap-2 py-1.5 hover:bg-slate-800/80 rounded cursor-pointer group"
              style={{ paddingLeft: `${paddingLeft}px`, paddingRight: '8px' }}
            >
              {node.isOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
              )}
              <FolderGit2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-sm font-medium text-slate-200 truncate">{node.name}</span>
            </div>
            {node.isOpen && node.children && renderTree(node.children, depth + 1)}
          </div>
        );
      }

      const isActive = activeFileId === node.id;

      return (
        <div 
          key={node.id}
          onClick={() => setActiveFile(node.id)}
          className={`flex items-center justify-between py-1.5 hover:bg-slate-800/80 rounded cursor-pointer ${isActive ? 'bg-blue-900/20 border border-blue-900/50' : 'border border-transparent'}`}
          style={{ paddingLeft: `${paddingLeft + 24}px`, paddingRight: '8px' }}
        >
          <div className="flex items-center gap-2 truncate">
            {getFileIcon(node.name, node.isIgnored)}
            <span className={`text-sm truncate ${isActive ? 'text-blue-300 font-medium' : (node.isIgnored ? 'text-slate-500 line-through' : 'text-slate-300')}`}>
              {node.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {node.status === 'modified' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
            {node.status === 'added' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
            {node.status === 'deleted' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>}
            {node.isIgnored && <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 rounded">ignored</span>}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex-1 flex h-full bg-slate-950 text-slate-300">
      {/* File Tree Panel */}
      <div className="w-80 border-r border-slate-800 flex flex-col h-full bg-slate-900/50">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-200">Repository Files</h2>
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">main</span>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <div className="space-y-0.5">
            {renderTree(files)}
          </div>
        </div>
      </div>

      {/* File Preview Panel */}
      <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
        {activeFile ? (
          <>
            <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 bg-slate-900/50">
              <div className="flex items-center gap-2 text-sm truncate">
                <span className="text-slate-200 font-medium font-mono truncate">{activeFileId}</span>
                {activeFile.status === 'modified' && (
                  <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/50 px-1.5 py-0.5 rounded font-medium">Modified</span>
                )}
              </div>
              {activeFile.status === 'modified' && (
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors">
                    <SplitSquareHorizontal className="w-4 h-4" /> Side-by-Side Diff
                  </button>
                </div>
              )}
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
              {activeFile.status === 'modified' ? (
                /* Side-by-side Diff View */
                <div className="flex w-full h-full divide-x divide-slate-800">
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="bg-rose-950/20 px-4 py-1 text-xs font-mono text-rose-300/70 border-b border-slate-800">HEAD</div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre bg-rose-950/5 text-rose-100/80">
                      {activeFile.oldContent}
                    </div>
                  </div>
                  <div 
                    className="flex-1 flex flex-col min-w-0"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      showMenu(e.clientX, e.clientY, [
                        { label: 'Stage Selected Lines', onClick: () => console.log('Stage lines') },
                        { label: 'Stage Hunk', onClick: () => console.log('Stage hunk') },
                        { divider: true, onClick: () => {} },
                        { label: 'Discard Changes', danger: true, onClick: () => console.log('Discard') }
                      ]);
                    }}
                  >
                    <div className="bg-emerald-950/20 px-4 py-1 text-xs font-mono text-emerald-300/70 border-b border-slate-800">Working Tree</div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre bg-emerald-950/5 text-emerald-100/90 cursor-text selection:bg-emerald-900/50">
                      {activeFile.newContent}
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard File View */
                <div className="flex-1 p-6 font-mono text-sm text-slate-300 overflow-auto whitespace-pre">
                  {activeFile.content}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a file to view its contents
          </div>
        )}
      </div>
    </div>
  );
}
