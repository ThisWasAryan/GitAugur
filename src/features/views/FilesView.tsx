import { FolderGit2, FileCode2, FileJson, FileText, ChevronRight, ChevronDown } from "lucide-react";

export function FilesView() {
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
            {/* Folder: src */}
            <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800/80 rounded cursor-pointer group">
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">src</span>
            </div>
            
            {/* Folder: src/features */}
            <div className="flex items-center gap-2 px-2 py-1.5 ml-4 hover:bg-slate-800/80 rounded cursor-pointer group">
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">features</span>
            </div>

            {/* File */}
            <div className="flex items-center gap-2 px-2 py-1.5 ml-8 bg-blue-900/20 text-blue-300 rounded cursor-pointer border border-blue-900/50">
              <FileCode2 className="w-4 h-4" />
              <span className="text-sm font-medium">CommitGraph.tsx</span>
            </div>

            {/* File */}
            <div className="flex items-center gap-2 px-2 py-1.5 ml-8 hover:bg-slate-800/80 rounded cursor-pointer">
              <FileCode2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm">CommitNode.tsx</span>
            </div>

            {/* Folder: docs */}
            <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800/80 rounded cursor-pointer group mt-2">
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">docs</span>
            </div>

            {/* Root Files */}
            <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800/80 rounded cursor-pointer">
              <FileJson className="w-4 h-4 text-slate-400" />
              <span className="text-sm">package.json</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-800/80 rounded cursor-pointer">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500 line-through">.env.local</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 rounded">ignored</span>
            </div>

          </div>
        </div>
      </div>

      {/* File Preview Panel */}
      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="h-12 border-b border-slate-800 flex items-center px-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">src</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">features</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-medium font-mono">CommitGraph.tsx</span>
          </div>
        </div>
        <div className="flex-1 p-6 font-mono text-sm text-slate-300 overflow-auto">
          <div className="text-slate-500">{'import { useMemo } from "react";'}</div>
          <div className="text-slate-500">{'import { ReactFlow } from "@xyflow/react";'}</div>
          <br/>
          <div className="text-blue-300">{'export function CommitGraph() {'}</div>
          <div>{'  return ('}</div>
          <div>{'    <div className="absolute inset-0">'}</div >
          <div>{'      <ReactFlow />'}</div>
          <div>{'    </div>'}</div>
          <div>{'  );'}</div>
          <div className="text-blue-300">{'}'}</div>
        </div>
      </div>
    </div>
  );
}
