# GitAugur

> ⚠️ **Disclaimer: Experimental & Work in Progress**
> GitAugur is an experimental project actively under development. Features, APIs, and UI paradigms are subject to rapid iteration and change. Please expect bugs and use with caution on mission-critical repositories.

GitAugur is a state-of-the-art, high-performance Git GUI client built using Tauri, React, TypeScript, and Rust. It aims to redefine how developers visualize, interact with, and manage their Git repositories by merging profound git transparency with an unparalleled, ultra-responsive native feel.

Unlike traditional Electron-based clients that consume heavy system resources, GitAugur runs on a lightweight, deeply integrated Rust backend powered by Tauri. It communicates directly with the underlying Git binaries and local file systems to render real-time history, visual staging, unified diffs, and repository monitoring.

---

<img width="1918" height="1041" alt="GitAugerV1HERO1" src="https://github.com/user-attachments/assets/606c5b3f-b532-4e0b-a291-500a921ffa8a" />
<img width="1917" height="1039" alt="GitAugerHERO2" src="https://github.com/user-attachments/assets/51f2cdca-06d2-477e-a805-5430d507693f" />
<img width="1915" height="1037" alt="GitAugerHERO3" src="https://github.com/user-attachments/assets/02705214-86b2-4bbb-acc7-f9ef59242c8a" />

---
## Table of Contents
- [Graph Rendering Engine](#graph-rendering-engine)
- [Under the Hood: Architecture & Logic](#under-the-hood-architecture--logic)
- [Installation Guide](#installation-guide)
- [Comprehensive Usage Guide](#comprehensive-usage-guide)
    - [Repository Management](#repository-management)
    - [Branching and Checkouts](#branching-and-checkouts)
    - [Staging and Committing](#staging-and-committing)
    - [Conflict Resolution](#conflict-resolution)
- [Roadmap](#roadmap)

---

## Graph Rendering Engine

GitAugur features a completely custom, highly deterministic commit graph renderer built on top of `@xyflow/react` (React Flow). The goal of the graph engine is to faithfully represent the complex ancestry, branching, and merging of your repository in an intuitive and visually continuous manner.

### Topological Traversal and Lane Assignment
The graph is not arbitrarily laid out. Instead, GitAugur runs a precise topological traversal over your repository's commits:
1. **Raw Git Data**: The Rust backend fetches the entire repository topology using `git log --branches --tags --remotes HEAD --pretty=format:%H%x00%P%x00%an...` to guarantee no orphan branches or floating commits are left out.
2. **Lane Reservation**: When processing commits from newest to oldest, the engine assigns an available "lane" (X-axis column) to each commit.
3. **Ancestry Inheritance**: When a commit declares its parents, the engine passes the lane down to the *first parent*. This guarantees that straight-line ancestry (the backbone of a branch) remains strictly vertical in the same column without zigzagging.
4. **Merge Edge Tracing**: Second and subsequent parents are treated as merge edges. The engine draws Bezier curves originating from the merged branch (the second parent) and curving into the target branch, matching native `git log --graph` aesthetics.

### Deterministic Branch Coloring
GitAugur solves the "visual ownership" problem in Git graphs by strictly pairing Lane Indices with a distinct, high-contrast color palette:
- `main` and `master` are strictly locked to **Blue**.
- `dev` and `develop` are strictly locked to **Purple**.
- Other branches dynamically map to a deterministic color via string hashing to ensure they keep the same color permanently across application restarts.
- Merge lines are rendered using the color of the *source lane* (the branch being merged in), clearly indicating which branch was absorbed into the mainline.

---

## Under the Hood: Architecture & Logic

GitAugur embraces a **Thin Backend, Thick Frontend** architecture.

### Tauri Rust Backend
The Rust backend is not an expansive Git re-implementation (like `libgit2`). Instead, it acts as an ultra-fast, secure bridge to the host machine's native Git binary. 
- It uses `std::process::Command` to execute exact `git` commands.
- It parses raw stdout payloads and serializes them to Rust Structs (`Commit`, `Branch`, `Tag`), passing them to the frontend via Tauri IPC events.
- **Why?** This ensures 100% parity with your terminal. If your terminal can run a complex rebase, GitAugur can read the resulting state natively without discrepancies.

### Zustand State Engine
The frontend relies heavily on Zustand for state management (`GitEngineStore.ts`).
- It polls the repository state and caches `commits`, `branches`, `tags`, and `unstaged/staged files`.
- It handles "Ghost Commits": When you write a commit message, the UI injects a fake floating node into the graph in real-time, previewing what the commit will look like and where it will be placed *before* you even hit submit.

---

## Installation Guide

Because GitAugur is a Tauri application, it requires both Node.js (for the frontend) and Rust (for the backend).

### Prerequisites
- Node.js (v18+)
- Rust (Stable)
- Tauri CLI (`npm i -g @tauri-apps/cli`)
- Git (`>= 2.30`)

### Installation Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/ThisWasAryan/GitAugur.git
   cd GitAugur
   ```
2. **Install frontend dependencies:**
   ```bash
   npm install
   ```
3. **Launch the development server:**
   ```bash
   npm run tauri dev
   ```
   *This command will compile the Rust binaries, start the Vite development server, and open the native window.*

4. **Build for Production (Optional):**
   ```bash
   npm run tauri build
   ```
   *This will generate a highly optimized binary native to your operating system (e.g., an AppImage/deb on Linux, .exe on Windows).*

---

## Comprehensive Usage Guide

### Repository Management
Upon launching GitAugur, you are greeted with the Repository Manager.
- **Open Existing**: Point the application to any existing directory containing a `.git` folder.
- **Clone Repository**: Enter a remote URL to natively clone it to your local machine with a loading state indicator.

### Branching and Checkouts
- **Dropdown Navigation**: The top header features a global Branch Dropdown showing both Local and Remote branches.
- **Detached HEAD Safety**: If you checkout a specific remote branch (e.g., `origin/feature`), GitAugur intercepts the operation and natively provisions a tracking branch (`git checkout -b feature --track origin/feature`). If you intentionally enter a detached HEAD state, the UI visibly warns you.
- **Uncommitted Changes Warning**: If you attempt to switch branches with dirty files, GitAugur detects this and renders a massive, visually stunning "Checkout Warning Dialog". It gives you the option to safely stash changes, abort, or aggressively carry them over to the new branch.

### Staging and Committing
- **The Staging Area**: The right-side panel features an Inspector View. Select a file to instantly render a line-by-line Diff.
- **Granular Control**: Click the "Stage" or "Unstage" buttons next to files. You can also mass-stage/unstage all files with a single click.
- **Ghost Previews**: As you type a commit message, a pulsing "Ghost Node" appears in the main graph. This visually teaches you exactly where your commit will be appended.

### Conflict Resolution
GitAugur features a robust, multi-phase conflict resolution workflow:
- **Detection**: If a merge or rebase results in a conflict, the UI detects the `MERGE_MSG` and conflict markers (`<<<<<<< HEAD`).
- **Interactive Resolution**: The conflict resolution modal uses Git's underlying `git merge-tree` to show you precisely what the file looked like on the base branch versus the incoming branch, allowing you to visually pick lines or manually edit the file before resolving.

---

## Roadmap
- 🚀 **Interactive Rebase Editor**: Drag and drop nodes in the graph to easily construct complex `git rebase -i` sequences.
- 🚀 **Deep GitHub/GitLab Integration**: Native Pull Request, Issue, and Action pipeline rendering inside the client.
- 🚀 **Integrated Terminal**: A synchronized command prompt that visually logs the raw commands GitAugur executes.
- 🚀 **Blame & Heatmaps**: Code lens overlays directly in the Diff engine to see who wrote specific lines and when.

---
*Built with passion to bring sanity to Git.*
