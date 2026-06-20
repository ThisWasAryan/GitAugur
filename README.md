# GitAugur

GitAugur is a state-of-the-art, high-performance Git GUI client built using Tauri, React, TypeScript, and Rust. It aims to completely redefine how developers visualize, interact with, and manage their Git repositories by merging profound git transparency with an unparalleled, ultra-responsive native feel.

## Overview

Unlike traditional Electron-based clients that consume heavy system resources, GitAugur runs on a lightweight, deeply integrated Rust backend powered by Tauri. It communicates directly with the underlying Git binaries and local file systems to render real-time history, visual staging, unified diffs, and repository monitoring.

### Core Features

- **Blazing Fast Performance**: Zero-lag UI operations, sub-millisecond Rust bindings for core Git commands (`git log`, `git branch`, etc.).
- **Global Commit Graph**: Automatically visualizes the entire repository topology (`git log --all`) to instantly convey context regardless of the current branch checkout.
- **Continuous Background Monitoring**: Reacts to file system modifications implicitly; seamlessly integrates the working tree into your workflow.
- **Built-in Diff Engine**: A visually striking, GitHub-style line-by-line diff engine that natively reads from `HEAD` and local tree states.
- **Deep Transparency**: GitAugur doesn't hide Git from you; it exposes the core commands it executes behind the scenes for total auditability.
- **Intuitive Staging**: Rapid side-by-side comparison, intelligent hunk isolation, and real-time staging transitions.

## Quick Start

### Prerequisites
- Node.js (v18+)
- Rust (Stable)
- Tauri CLI (`npm i -g @tauri-apps/cli`)
- Git (`>= 2.30`)

### Installation
1. Clone the repository: `git clone https://github.com/Antigravity/GitAugur.git`
2. Install frontend dependencies: `npm install`
3. Launch development server with Tauri runtime: `npm run tauri dev`

## Recent Major Updates (v0.2.0)
- **Unified Graph Model**: GitAugur no longer scopes your graph to local branch context. Branch checkouts merely update the `HEAD` reference pointer without triggering confusing layout regenerations.
- **Intelligent Branch Segregation**: Local and Remote branches are cleanly isolated with visual tracking properties (Ahead/Behind).
- **Responsive Navigation State**: Instantly identifies modified states in the filesystem and intelligently provides fallbacks for new repositories and untracked files.
- **Loading Overlay Integration**: Repositories clone and open smoothly with fully threaded visual loading loops, completely bypassing synchronous backend freezes.

## Future Roadmap
- Intelligent Conflict Resolution Editor
- Deep GitHub / GitLab Authentication Integration
- PR & Issue visualization directly inside the client
- Native SSH Agent configuration

---
*Built with passion by the Antigravity Team.*
