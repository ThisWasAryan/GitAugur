import { useGitEngineStore } from "../../engine/GitEngineStore";
import { useTerminology } from "../../hooks/useTerminology";
import { FileStatusList } from "./FileStatusList";
import { CommitForm } from "./CommitForm";

export function StagingPanel() {
  const { 
    stagedFiles, 
    unstagedFiles, 
    stageFile, 
    unstageFile, 
    stageAll, 
    unstageAll,
    selectFile,
    selectedFile
  } = useGitEngineStore();

  const { t } = useTerminology();

  return (
    <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-slate-200">Source Control</h2>
        <div className="flex gap-1">
          {/* Action buttons could go here */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <FileStatusList 
          title={t('Index')}
          files={stagedFiles}
          onAction={unstageFile}
          onActionAll={unstageAll}
          onSelect={selectFile}
          selectedFile={selectedFile || undefined}
          actionIcon="minus"
        />

        <FileStatusList 
          title={t('Working Tree')}
          files={unstagedFiles}
          onAction={stageFile}
          onActionAll={stageAll}
          onSelect={selectFile}
          selectedFile={selectedFile || undefined}
          actionIcon="plus"
        />
      </div>

      <CommitForm />
    </div>
  );
}
