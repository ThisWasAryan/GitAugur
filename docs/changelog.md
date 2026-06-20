# Changelog

## v0.2.0 (Current)
- Added global `--all` repository graph context to `git log` parser.
- Introduced React `setInterval` background polling for repository working-tree state detection.
- Completely refactored the Git Log `CommitGraph.tsx` to handle decoupled branches and tags natively.
- Added visual loading indicators (`isOpening`, `isCloning`) for asynchronous Tauri blocks.
- Solved silent failures during string serialization with null delimiters (`%00`).
- Branch dropdown fully segregated into Local and Remote lists with interactive `Create Branch` input fields.
- Rewrote `FilesView.tsx` and backend `git_show_file` to prioritize working tree fallbacks (`std::fs::read_to_string`).

## v0.1.0
- Initial Repository Setup
- React + Tauri Bindings
- Implementation of mock layout scaffolding
