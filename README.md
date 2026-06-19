# GitAugur

GitAugur is a modern, visual desktop Git and GitHub client built to make Git understandable and approachable while remaining powerful enough for advanced users. It focuses on visual history, predicting repository state, and explaining Git operations clearly.

## Architecture

GitAugur is built using a modern, high-performance desktop stack:
- **Tauri v2**: Core desktop framework enabling lightweight native applications.
- **React 18 & TypeScript**: Frontend UI framework.
- **Vite**: Ultra-fast frontend build tool.
- **Tailwind CSS v3 & shadcn/ui**: Styling and component system.
- **React Flow (`@xyflow/react`)**: Engine driving the central, interactive commit graph.
- **Rust & SQLite**: Native backend for executing Git commands and storing local configurations.

## Current Status (Phase 2)

We are currently completing **Phase 2: Core Git Visualization & Repository Awareness**.

### Implemented Features:
1. **Application Shell**: Complete UI shell with responsive sidebar and custom styling.
2. **Git Service**: Foundational Rust wrapper around the local Git CLI.
3. **Commit Graph Visualization**: 
   - Interactive React Flow-based commit graph.
   - Custom lane-based layout algorithm for branches.
   - Currently operating in **Mock Data Mode** to facilitate UI development without requiring the Rust compilation toolchain in every environment.

### Upcoming Features (Phase 2.5):
- **Staging UI**: Right-hand panel for tracking modified, untracked, and deleted files.
- **Commit Operations**: UI for writing commit messages and executing local commits.

## Documentation

For deep dives into the project's design and architecture, check the `docs/` folder:
- `vision.md`
- `architecture.md`
- `ui.md`
- `operations.md`
- `roadmap.md`

## Development Setup

*Note: Since the backend relies on Rust, you will need `rustc` and `cargo` installed to run the full application.*

1. Clone the repository.
2. Install frontend dependencies: `npm install`
3. Run in dev mode: `npm run tauri dev`
4. Build for production: `npm run tauri build`
