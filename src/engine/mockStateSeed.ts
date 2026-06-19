import type { GitHistory, GitBranch, GitTag } from '../types/git';
import type { FileStatus } from './GitEngineStore';

export const mockBranches: GitBranch[] = [
  { name: "main", commitHash: "h-005", isCurrent: false, isRemote: false },
  { name: "origin/main", commitHash: "h-005", isCurrent: false, isRemote: true },
  { name: "feature/login-system", commitHash: "h-007", isCurrent: false, isRemote: false },
  { name: "bugfix/sidebar-overflow", commitHash: "h-008", isCurrent: false, isRemote: false },
  { name: "experiment/old-ui", commitHash: "h-003", isCurrent: false, isRemote: false },
  { name: "experimental", commitHash: "exp-003", isCurrent: true, isRemote: false }, // Most advanced branch
];

export const mockTags: GitTag[] = [
  { name: "v1.0.0", commitHash: "h-002" },
  { name: "v1.1.0-beta", commitHash: "h-005" }
];

export const mockHistory: GitHistory = {
  commits: [
    // --- MAIN TIMELINE ---
    {
      hash: "h-001",
      message: "Initial commit: Setup Vite + React",
      author: { name: "Alice Dev", email: "alice@example.com" },
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: []
    },
    {
      hash: "h-002",
      message: "Configure TailwindCSS and Lucide Icons",
      author: { name: "Alice Dev", email: "alice@example.com" },
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-001"]
    },
    {
      hash: "h-003",
      message: "Build initial layout skeleton",
      author: { name: "Bob Engineer", email: "bob@example.com" },
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-002"]
    },
    {
      hash: "e-001",
      message: "Experiment with glassmorphism UI",
      author: { name: "Charlie Design", email: "charlie@example.com" },
      timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-003"]
    },
    {
      hash: "h-004",
      message: "Implement global Zustand stores",
      author: { name: "Alice Dev", email: "alice@example.com" },
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-003"]
    },
    {
      hash: "h-005",
      message: "Merge pull request #12: Auth scaffolding",
      author: { name: "Alice Dev", email: "alice@example.com" },
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-004", "a-002"]
    },
    {
      hash: "a-001",
      message: "Add Firebase dependencies",
      author: { name: "Bob Engineer", email: "bob@example.com" },
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-004"]
    },
    {
      hash: "a-002",
      message: "Create basic login form",
      author: { name: "Bob Engineer", email: "bob@example.com" },
      timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["a-001"]
    },
    {
      hash: "h-006",
      message: "Connect login form to Firebase Auth",
      author: { name: "Alice Dev", email: "alice@example.com" },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-005"]
    },
    {
      hash: "h-007",
      message: "Add social OAuth providers",
      author: { name: "Alice Dev", email: "alice@example.com" },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-006"]
    },
    {
      hash: "h-008",
      message: "Fix sidebar scrolling on small screens",
      author: { name: "Bob Engineer", email: "bob@example.com" },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-005"]
    },
    
    // --- EXPERIMENTAL BRANCH --- (Branched from h-005, extremely advanced)
    {
      hash: "exp-001",
      message: "WIP: Rewrite core engine in Rust (WASM)",
      author: { name: "Eve Hacker", email: "eve@example.com" },
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["h-005"]
    },
    {
      hash: "exp-002",
      message: "Add predictive diffing algorithms",
      author: { name: "Eve Hacker", email: "eve@example.com" },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["exp-001"]
    },
    {
      hash: "exp-003",
      message: "Integrate Tauri backend bindings",
      author: { name: "Eve Hacker", email: "eve@example.com" },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      parentHashes: ["exp-002"]
    }
  ],
  branches: mockBranches,
  tags: mockTags
};

const mockUnstagedFiles: FileStatus[] = [
  { path: "src-tauri/Cargo.toml", status: "modified", diff: "@@ -10,3 +10,4 @@\n [dependencies]\n tauri = { version = \"1.4\", features = [\"shell-open\"] }\n serde = { version = \"1.0\", features = [\"derive\"] }\n+serde_json = \"1.0\"" },
  { path: "src/engine/Predictor.ts", status: "untracked" },
  { path: "src/components/layout/Sidebar.tsx", status: "modified" },
];

const mockStagedFiles: FileStatus[] = [
  { path: "src/types/engine.ts", status: "added", diff: "@@ -0,0 +1,10 @@\n+export interface EngineState {\n+  version: string;\n+  ready: boolean;\n+}" },
  { path: "package.json", status: "modified", diff: "@@ -15,4 +15,5 @@\n   \"dependencies\": {\n     \"react\": \"^18.2.0\",\n     \"zustand\": \"^4.4.1\",\n+    \"tauri-plugin-fs-extra\": \"^1.0.0\"\n   }" },
  { path: "legacy-script.js", status: "deleted" },
];

export const initialMockState = {
  history: mockHistory,
  HEAD: "experimental",
  unstagedFiles: mockUnstagedFiles,
  stagedFiles: mockStagedFiles
};
