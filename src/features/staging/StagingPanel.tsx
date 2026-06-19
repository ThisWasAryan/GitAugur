import { useGitEngineStore } from "../../engine/GitEngineStore";
import { FileStatusList } from "./FileStatusList";
import { CommitForm } from "./CommitForm";

export function StagingPanel() {
  const { 
    stagedFiles, 
    unstagedFiles, 
    stageFile, 
    unstageFile, 
    stageAll, 
    unstageAll 
  } = useGitEngineStore();

  return (
    <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="font-semibold text-slate-200">Source Control</h2>
        <div className="flex gap-1">
          {/* Action buttons could go here */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <FileStatusList 
          title="Staged Changes"
          files={stagedFiles}
          onAction={unstageFile}
          onActionAll={unstageAll}
          actionIcon="minus"
        />

        <FileStatusList 
          title="Changes"
          files={unstagedFiles}
          onAction={stageFile}
          onActionAll={stageAll}
          actionIcon="plus"
        />
      </div>

      <CommitForm />
    </div>
  );
}
