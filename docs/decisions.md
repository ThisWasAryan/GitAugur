# Decisions

## 1. Zero Backend State
We actively decided against caching Git data in SQLite or memory on the Rust backend.
**Reason:** Git itself *is* the database. Caching creates infinite race conditions when users modify repositories outside of GitAugur (e.g., via CLI).

## 2. Tauri over Electron
**Reason:** Memory footprint. GitAugur needs to run continuously in the background. A 20MB Tauri binary is acceptable, whereas a 300MB Electron app is not.

## 3. Direct Binary Execution over libgit2
**Reason:** While `libgit2` (via `git2-rs`) provides type-safe abstractions, it severely limits complex graph queries, sparse checkouts, and advanced rebase operations. Falling back to the raw OS Git binary guarantees GitAugur can execute *anything* the CLI can execute.

## 4. Frontend-First Architecture
**Reason:** The UI needs extreme flexibility to visualize diffs and interactive graphs. The backend is treated purely as a highly privileged API router.
