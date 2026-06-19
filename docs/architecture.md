# System Architecture

## Technology Stack
* **Framework**: Tauri v2
* **Frontend**: React, TypeScript, Vite
* **Styling**: Tailwind CSS v3, shadcn/ui
* **State Management**: Zustand
* **Backend**: Rust
* **Storage**: SQLite
* **Git Engine**: System Git CLI executable
* **GitHub Integration**: GitHub REST & GraphQL APIs via OAuth
* **Graph Visualization**: React Flow (initial)

## Architecture Principles
* Avoid unnecessary complexity (No Microservices, CQRS, Event sourcing, deep inheritance hierarchies).
* Favor Feature-based architecture, explicit services, clear data flow, strong typing, and readable code.

## Folder Structure
* `src/features/`: Isolated feature modules (commit-graph, repositories, branches, etc.)
* `src/services/`: API and external system wrappers (git, github, storage)
* `src/components/`: Reusable UI components
* `src/hooks/`: Shared React hooks
* `src/stores/`: Zustand state definitions
* `src/types/`: TypeScript definitions
* `src/utils/`: Helper functions
* `src-tauri/src/`: Rust backend modules (git, storage, commands)
