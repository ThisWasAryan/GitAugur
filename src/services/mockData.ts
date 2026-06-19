import type { GitHistory } from "../types/git";

export const mockGitHistory: GitHistory = {
  commits: [
    {
      hash: "a1b2c3d4",
      message: "Initial commit",
      author: { name: "Aryan", email: "aryan@example.com" },
      timestamp: "2024-01-01T10:00:00Z",
      parentHashes: [],
    },
    {
      hash: "b2c3d4e5",
      message: "Add README and project structure",
      author: { name: "Aryan", email: "aryan@example.com" },
      timestamp: "2024-01-02T11:00:00Z",
      parentHashes: ["a1b2c3d4"],
    },
    {
      hash: "c3d4e5f6",
      message: "Setup Tailwind CSS",
      author: { name: "Aryan", email: "aryan@example.com" },
      timestamp: "2024-01-03T12:00:00Z",
      parentHashes: ["b2c3d4e5"],
    },
    // Branch: feature/auth
    {
      hash: "d4e5f6g7",
      message: "Add login page UI",
      author: { name: "Alice", email: "alice@example.com" },
      timestamp: "2024-01-04T09:00:00Z",
      parentHashes: ["c3d4e5f6"],
    },
    {
      hash: "e5f6g7h8",
      message: "Implement auth provider",
      author: { name: "Alice", email: "alice@example.com" },
      timestamp: "2024-01-04T14:00:00Z",
      parentHashes: ["d4e5f6g7"],
    },
    // Main continues
    {
      hash: "f6g7h8i9",
      message: "Fix layout bug in sidebar",
      author: { name: "Aryan", email: "aryan@example.com" },
      timestamp: "2024-01-05T10:00:00Z",
      parentHashes: ["c3d4e5f6"],
    },
    // Merge feature/auth into main
    {
      hash: "g7h8i9j0",
      message: "Merge branch 'feature/auth' into main",
      author: { name: "Aryan", email: "aryan@example.com" },
      timestamp: "2024-01-06T11:00:00Z",
      parentHashes: ["f6g7h8i9", "e5f6g7h8"],
    },
    // Another commit on main
    {
      hash: "h8i9j0k1",
      message: "Add graph components",
      author: { name: "Aryan", email: "aryan@example.com" },
      timestamp: "2024-01-07T12:00:00Z",
      parentHashes: ["g7h8i9j0"],
    },
  ],
  branches: [
    { name: "main", commitHash: "h8i9j0k1", isRemote: false, isCurrent: true },
    { name: "origin/main", commitHash: "h8i9j0k1", isRemote: true, isCurrent: false },
    { name: "feature/auth", commitHash: "e5f6g7h8", isRemote: false, isCurrent: false },
  ],
  tags: [
    { name: "v0.1.0", commitHash: "c3d4e5f6" }
  ]
};
