# Architecture

GitAugur follows a typical Tauri application structure, balancing front-end responsivity with back-end safety and performance.

## Frontend (React/TypeScript)

The frontend is a strictly strictly single-page application (SPA) using React 18, Vite, and Zustand for state management.
- **`GitEngineStore`**: Acts as the central nervous system connecting React to the Rust backend. Handles background polling, git metadata caching, and repository action dispatching.
- **Component Layer**: UI components heavily utilize TailwindCSS and Lucide React.
- **Layout Management**: Context-aware routing without strict URL boundaries. ContextMenus, Modals, and the Command Palette exist outside the primary layout flow.

## Backend (Rust/Tauri)

The Rust backend is entirely stateless in regards to Git tracking, relying purely on executing OS-level Git binaries (`git rev-parse`, `git log`, `git ls-tree`).
- **`commands/mod.rs`**: Exposes specific Tauri IPC invokes like `git_log`, `git_diff`, `git_branch`.
- **`git/parse.rs`**: Custom, zero-copy parsers that take raw null-delimited (`%00`) standard output strings from Git commands and map them directly into structured Rust `structs` before serialization.
- **`git/models.rs`**: Serde-derived models matching TypeScript interfaces seamlessly.

## Concurrency

All Git operations spawn sub-processes via `std::process::Command`. Emitting real-time stdout updates uses Tauri's event emitter loop (`Window::emit`), ensuring the UI stays completely reactive during prolonged `clone`, `fetch`, or `push` executions.
