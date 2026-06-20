import { useSettingsStore } from '../stores/useSettingsStore';

type TermKey = 
  | 'HEAD'
  | 'Working Tree'
  | 'Index'
  | 'Incoming Changes'
  | 'Base Commit'
  | 'Stash'
  | 'Cherry Pick'
  | 'Rebase'
  | 'Squash'
  | 'Interactive Rebase'
  | 'Commit';

const beginnerDictionary: Record<TermKey, string> = {
  'HEAD': 'Current Commit',
  'Working Tree': 'Your Changes',
  'Index': 'Staged Changes',
  'Incoming Changes': 'Changes From Main',
  'Base Commit': 'Shared Starting Point',
  'Stash': 'Saved Drafts',
  'Cherry Pick': 'Copy Commit Here',
  'Rebase': 'Reapply Commits',
  'Squash': 'Combine Commits',
  'Interactive Rebase': 'Edit History',
  'Commit': 'Save Version',
};

export function useTerminology() {
  const uiMode = useSettingsStore(state => state.uiMode);

  const t = (term: TermKey): string => {
    if (uiMode === 'beginner') {
      return beginnerDictionary[term] || term;
    }
    return term; // Advanced mode uses the exact git term
  };

  return { t, uiMode };
}
