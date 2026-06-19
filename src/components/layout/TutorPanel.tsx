import { Info, Lightbulb, GitBranch, GitPullRequest, GitMerge, FileCode2 } from "lucide-react";
import { useNavigationStore } from "../../stores/useNavigationStore";
import { useRepositoryStore } from "../../stores/useRepositoryStore";

export function TutorPanel() {
  const { activeView, graphMode } = useNavigationStore();
  const currentState = useRepositoryStore(state => state.currentState);
  const isMerging = currentState === 'MERGING';

  let title = "";
  let content = "";
  let Icon = Lightbulb;

  if (isMerging) {
    title = "Merge Conflicts";
    content = "A merge conflict happens when Git cannot automatically reconcile differences between two branches. You must manually choose which changes to keep. Review the marked files, resolve the <<<<<<< and >>>>>>> blocks, and complete the merge.";
    Icon = GitMerge;
  } else {
    switch (activeView) {
      case 'History':
        if (graphMode === 'REPO_FLOW') {
          title = "Repository State";
          content = "This dashboard shows your active workflows. Branches represent parallel tracks of work. A 'healthy' repository usually has one stable 'main' branch and several temporary feature branches that will eventually be merged.";
        } else {
          title = "The Commit Graph";
          content = "Each dot represents a 'Commit'—a snapshot of your entire project at a specific moment in time. Branches are just movable sticky notes pointing to a specific commit. As you add commits, the branch pointer moves forward automatically.";
        }
        Icon = Lightbulb;
        break;
      case 'Branches':
        title = "What is a Branch?";
        content = "A branch is a safe, isolated workspace. When you create a branch, you're making a parallel universe of your code. You can make massive, breaking changes without affecting the main timeline. Once your work is perfect, you 'merge' it back.";
        Icon = GitBranch;
        break;
      case 'Pull Requests':
        title = "Code Review & PRs";
        content = "A Pull Request (PR) is a formal request to merge your branch into the main timeline. It allows teammates to review your code, run tests, and discuss changes before they become a permanent part of the project's history.";
        Icon = GitPullRequest;
        break;
      case 'Files':
        title = "The Working Tree";
        content = "This is your current directory structure. When you edit these files, the changes are 'Unstaged'. You must intentionally stage changes and commit them for Git to record them permanently in the history graph.";
        Icon = FileCode2;
        break;
      case 'Stashes':
        title = "Git Stash";
        content = "The Stash is a temporary drawer for your work. If you need to switch branches but aren't ready to commit your current messy changes, you can 'stash' them away, switch branches, and 'pop' them back out later.";
        Icon = Info;
        break;
      default:
        title = "Learning Git";
        content = "Git tracks the history of your files as a series of snapshots. As you explore this repository, this panel will update to explain the concepts behind the tools you are using.";
        Icon = Lightbulb;
        break;
    }
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20 pointer-events-none">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl flex gap-4 pointer-events-auto items-start">
        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-1">{title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
