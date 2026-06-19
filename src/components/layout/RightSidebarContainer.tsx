import { useInspectorStore } from "../../stores/useInspectorStore";
import { StagingPanel } from "../../features/staging/StagingPanel";
import { CommitInspector } from "../../features/inspectors/CommitInspector";
import { PullRequestInspector } from "../../features/inspectors/PullRequestInspector";
import { BranchInspector } from "../../features/inspectors/BranchInspector";

export function RightSidebarContainer() {
  const { activeInspector } = useInspectorStore();

  switch (activeInspector) {
    case 'commit':
      return <CommitInspector />;
    case 'pr':
      return <PullRequestInspector />;
    case 'branch':
      return <BranchInspector />;
    case 'staging':
    default:
      return <StagingPanel />;
  }
}
