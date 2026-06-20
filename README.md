# GitAugur

**GitAugur** is an experimental, work-in-progress graphical user interface (GUI) for Git, built with React, TailwindCSS, Tauri, and Rust. It is designed to visualize Git history in an intuitive, predictive, and rich topological graph.

> **Note**: This is an experimental project and heavily under development. Some features might be broken or incomplete. Use at your own risk.

## Table of Contents
1. [Features](#features)
2. [Graph Rendering Logic](#graph-rendering-logic)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Usage](#usage)

---

## Features

- **Repo Flow Graph**: Beautiful, highly-customizable node-based representation of your git history.
- **Visual Branch Tracking**: Each local and remote branch is strictly assigned to deterministic lanes with distinct color themes.
- **Action Preview ("Ghost Commits")**: Visually predict how a merge, rebase, or commit will impact the graph *before* executing the action.
- **In-App Terminal**: A fully functional `xterm.js` terminal window allowing you to drop down into native Git whenever you want.
- **Cherry-Picking & Rebasing**: Advanced Git functionality available directly from contextual right-click menus on the graph.
- **Customizable Appearance**: Configure specific branch colors using settings.

---

## Graph Rendering Logic

GitAugur utilizes **ReactFlow** alongside a custom layout engine (`graphLayout.ts`) to calculate git commit positions dynamically:
1. **Timestamp Sorting**: The graph fetches data via `git log --all` and ensures commits are strictly sorted by timestamp (newest first).
2. **Lane Assignment**: 
   - A deterministic lane index (`__lane_N`) is assigned starting from the newest commit. 
   - As parent links are discovered, the first parent of a commit inherits the commit's lane (maintaining vertical continuity).
   - Secondary parents (i.e., merged branches) are assigned to *new* parallel lanes.
3. **Branch Tracing**: We look for branch refs and regex-parse merge commit messages (`Merge branch 'feature-a' into main`) to accurately back-propagate branch ownership down the entire tree.
4. **Color Determinism**: Every branch gets a persistent color from `branchColors.ts` based on its name. The color drives node borders, background hues, and edge gradients.

---

## Architecture

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, ReactFlow (for the graph), Lucide React (for icons).
- **Backend**: Tauri (Rust) acts as a high-performance IPC bridge.
  - Rust asynchronously executes `git` CLI processes locally on the machine.
  - Parsers split `\x00` delimited `git log` output directly into structured JSON passed back to the frontend.
- **State Management**: Zustand (`GitEngineStore.ts`) handles polling the repository state, diffing, staging, and executing backend commands.

---

## Installation

Ensure you have [Node.js](https://nodejs.org/), [Rust](https://www.rust-lang.org/tools/install), and `git` installed on your system.

```bash
# Clone the repository
git clone https://github.com/yourusername/GitAugur.git
cd GitAugur

# Install frontend dependencies
npm install

# Run the Tauri development server
npm run tauri dev
```

## Usage

1. Launch GitAugur.
2. Select **Open Repository** to load an existing local git repository, or **Clone Repository** to clone a remote one.
3. Switch between **Repo Flow** (the interactive ReactFlow layout) or **Timeline** mode.
4. Use the **Right Sidebar** to view currently staged files and staging functionality.
5. Double-click the main interface to bring up the contextual Command Palette.
