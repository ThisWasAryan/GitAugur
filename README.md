# GitAugur

> **Note**: This is an experimental project and heavily under development. Some features might be broken or incomplete. Use at your own risk.

**GitAugur** is a next-generation, experimental, and work-in-progress graphical user interface (GUI) for Git. Built with React, TailwindCSS, Tauri, and Rust, it is designed to visualize Git history in an intuitive, predictive, and beautifully rendered topological graph. 

GitAugur transforms abstract Git commands into a tactile, visual experience—empowering both beginners and advanced users to confidently navigate complex workflows.

<img width="1918" height="1041" alt="GitAugerV1HERO1" src="https://github.com/user-attachments/assets/606c5b3f-b532-4e0b-a291-500a921ffa8a" />
<img width="1917" height="1039" alt="GitAugerHERO2" src="https://github.com/user-attachments/assets/51f2cdca-06d2-477e-a805-5430d507693f" />
<img width="1915" height="1037" alt="GitAugerHERO3" src="https://github.com/user-attachments/assets/02705214-86b2-4bbb-acc7-f9ef59242c8a" />

---

## 🌟 Vision & Philosophy

Git is incredibly powerful but often opaque. The goal of GitAugur is not simply to be a visual wrapper around the CLI, but to provide a **predictive, fluid, and completely tactile** workspace. It reduces cognitive load by turning complex branching, rebasing, and merging strategies into visual logic. Instead of holding the DAG (Directed Acyclic Graph) of your repository in your head, GitAugur renders it perfectly and allows you to manipulate it seamlessly.

---

## 🚀 Key Features

### 1. Dual View Git Engine
GitAugur features two distinct ways to view your commit history:
- **Git Graph**: A classic, vertically-oriented timeline layout that tightly stacks your commits, making it easy to see history at a glance.
- **Repo Flow**: A vast, interactive, horizontally-expansive flowchart powered by ReactFlow. It spaces out your branches into distinct topological lanes, guaranteeing robust DAG representation that makes tracking parallel development effortless.

### 2. GitHub-Style Branches View
A rich, analytical Branches page that mimics the industry-standard GitHub layout:
- Instantly view **Local** and **Remote** branches.
- **Ahead/Behind Sync Status**: Computes advanced topological distances using `git rev-list --left-right` to show exactly how far ahead or behind a branch is relative to your Default branch (e.g., `main`), visualized elegantly with a segmented progress bar.
- Create new branches natively with custom color-coding so they visually stand out in the main graphs.

### 3. Intelligent Source Control & Staging
GitAugur intelligently monitors your working directory. 
- The **Source Control Right Sidebar** auto-opens the moment you modify files, providing a pristine staging area.
- Select files to view an embedded **Side-by-Side Diff Viewer**.
- Stage individual files, unstage files, and securely compose commit messages with ease.

### 4. Interactive Conflict Resolution
GitAugur turns the dreaded "Merge Conflict" into a seamless workflow:
- **Side-by-Side Resolution Editor**: Clean, human-readable labels (e.g., "Your Branch" vs. "Incoming Changes") instead of confusing `HEAD` hashes.
- **Dynamic State Resumption**: Automatically detects whether you are stuck in a Merge, Rebase, or Cherry-Pick, and offers context-aware Continue or Abort buttons.
- **Cherry-Pick Resilience**: Automatically detects and handles "empty cherry-picks" (changes already present) by executing `git cherry-pick --skip` silently, keeping your workflow uninterrupted.

### 5. Detailed Inspectors
Click on any entity in the Repo Flow or Git Graph to view rich metadata:
- **Commit Inspector**: View exact, absolute timestamps alongside the author, message, and a color-coded file diff list. Instantly execute Cherry-Picks from this panel.
- **Branch Inspector**: Quick commands to rebase your current branch onto the target, view sync status, and inspect the Head Commit.

### 6. Extended Tooling & Workspaces
- **Stashes View**: Manage, apply, and drop your stashed works-in-progress.
- **Tags View**: Browse and manage your annotated tags and release versions.
- **Repository Files**: Explore the actual file structure of the currently checked-out commit.
- **Built-in Terminal**: A fully functional `xterm.js` terminal window integrated into the UI. Whenever you need raw power, drop down into native Git directly from the interface.

---

## 🏗️ Architecture

GitAugur is built on a high-performance modern tech stack emphasizing speed, low-latency rendering, and native cross-platform consistency.

- **Frontend Core**: React 18, Vite, TypeScript, and TailwindCSS provide a snappy, hardware-accelerated UI.
- **Graphing Engine**: ReactFlow drives the custom `graphLayout.ts` engine for the topological graph, translating raw Git history into highly optimized nodes and edges.
- **Backend Bridge (Tauri + Rust)**: Tauri acts as a high-performance IPC bridge. Rust asynchronously executes native `git` CLI processes on the local machine and parses the `\x00`-delimited output into structured JSON. This prevents slow node.js bridging and ensures parsing large repositories takes mere milliseconds.
- **Global State Management**: Zustand (`useRepositoryStore.ts` & `GitEngineStore.ts`) handles centralized polling, diffing, staging, and executing backend commands.

---

## 🔧 Installation & Setup

Ensure you have [Node.js](https://nodejs.org/), [Rust](https://www.rust-lang.org/tools/install), and `git` installed on your system.

```bash
# Clone the repository
git clone https://github.com/ThisWasAryan/GitAugur.git
cd GitAugur

# Install frontend dependencies
npm install

# Run the Tauri development server
npm run tauri dev
```

## 🎮 Basic Usage Guide

1. **Launch GitAugur**.
2. **Open** an existing local git repository via the `File -> Open Repository` menu.
3. Switch between **Git Graph**, **Repo Flow**, and the **Branches** data table view using the top navigation bar.
4. **Right-click** on any node in the graph to bring up instant action menus for Checkout, Merge, Rebase, or Cherry-Pick.
5. Watch the **Source Control Panel** dynamically slide in as soon as you modify files in your editor.
6. Press the **Toggle Terminal** button in the bottom panel to spin up an embedded shell.

---

*GitAugur is currently an experimental work-in-progress. Developed with an emphasis on developer experience, workflow optimization, and visual clarity.*
