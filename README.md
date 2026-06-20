# GitAugur

**GitAugur** is a next-generation graphical user interface (GUI) for Git. Built with React, TailwindCSS, Tauri, and Rust, it is designed to visualize Git history in an intuitive, predictive, and beautifully rendered topological graph. 

GitAugur transforms abstract Git commands into a tactile, visual experience—empowering both beginners and advanced users to confidently navigate complex workflows.

---

## 🌟 Key Features

### 1. **Predictive Git Graph (Repo Flow)**
A highly interactive, node-based representation of your repository's history:
- **Topological Sorting**: Uses `--topo-order` to guarantee an accurate, robust DAG representation of commits, completely immune to graph-breaking rebase artifacts.
- **Smart Branch Tracking**: Every local and remote branch is strictly assigned to deterministic lanes with distinct color themes.
- **Action Previews (Ghost Commits)**: Visually predict how a branch creation, merge, or deletion will impact your history *before* you execute the action.

### 2. **GitHub-Style Branches View**
A rich, analytical Branches page that mimics the industry-standard GitHub layout:
- Instantly view **Local** and **Remote** branches.
- **Ahead/Behind Sync Status**: Computes advanced topological distances using `git rev-list --left-right` to show exactly how far ahead or behind a branch is relative to your Default branch (e.g., `main`), visualized elegantly with a segmented progress bar.
- Fully integrated contextual right-click menus for checking out or deleting branches.

### 3. **Intelligent Conflict Resolution & Merging**
GitAugur turns the dreaded "Merge Conflict" into a seamless workflow:
- **Side-by-Side Resolution Editor**: Clean, human-readable labels (e.g., "Your Branch" vs. "Incoming Changes") instead of confusing `HEAD` hashes.
- **Custom Merge Messages**: Employs `--no-commit` hooks allowing you to pause fast-forward and clean merges to inject customized merge commit messages.
- **Cherry-Pick Resilience**: Automatically detects and handles "empty cherry-picks" (changes already present) by executing `git cherry-pick --skip` silently, keeping your workflow uninterrupted.
- **Dynamic Abort**: A contextual global Abort button that intelligently routes to `merge --abort`, `rebase --abort`, or `cherry-pick --abort` based on your exact state.

### 4. **Detailed Inspectors**
Click on any entity to view rich metadata:
- **Commit Inspector**: View exact, absolute timestamps (e.g., "Jun 20, 2026, 10:30 AM") alongside the author, message, and a color-coded file diff list.
- **Branch Inspector**: Quick commands to rebase your current branch onto the target, view sync status, and inspect the Head Commit.

### 5. **Built-in Terminal**
A fully functional `xterm.js` terminal window integrated into the UI. Whenever you need raw power, drop down into native Git directly from the interface.

---

## 🏗️ Architecture

GitAugur is built on a high-performance modern tech stack:

- **Frontend**: React 18, Vite, TypeScript, and TailwindCSS provide a snappy, hardware-accelerated UI. ReactFlow drives the custom `graphLayout.ts` engine for the topological graph. Lucide React provides modern SVG iconography.
- **Backend (Tauri + Rust)**: Tauri acts as a high-performance IPC bridge. Rust asynchronously executes native `git` CLI processes on the local machine and parses the `\x00`-delimited output into structured JSON, feeding it directly to the frontend.
- **State Management**: Zustand (`useRepositoryStore.ts` & `GitEngineStore.ts`) handles centralized polling, diffing, staging, and executing backend commands.

---

## 🚀 Installation

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

## 🛠️ Usage

1. **Launch GitAugur**.
2. **Open** an existing local git repository or clone a new one.
3. Switch between **Repo Flow** (the interactive ReactFlow layout) and the **Branches** data table view.
4. **Right-click** on any node in the graph to Checkout, Merge, Rebase, or Cherry-Pick instantly.
5. Use the **Right Sidebar** to inspect commits, view file diffs, and manage your staging area.
6. **Double-click** the main interface to bring up the contextual Command Palette.

---

*GitAugur is currently an experimental work-in-progress. Developed with an emphasis on developer experience and visual clarity.*
