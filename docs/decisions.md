# Decision Log

This document records important architectural and design decisions for GitAugur.

## 1. Choice of Desktop Framework: Tauri v2
* **Reasoning**: Tauri provides a native-feeling desktop application with cross-platform support. It results in extremely small binaries and low memory usage compared to Electron. The Rust backend is performant and integrates natively with OS features.

## 2. Frontend Framework: React + Vite
* **Reasoning**: High performance ecosystem, massive component availability (React Flow, shadcn/ui), and Vite provides a superior developer experience with rapid HMR.

## 3. Use of System Git Executable
* **Reasoning**: We decided not to build a custom Git implementation or rely strictly on libgit2 wrappers because keeping up with Git's feature set is difficult. Instead, we call the system Git CLI and parse its output. This guarantees compatibility with the user's existing Git configuration, hooks, and SSH agents.

## 4. UI Styling: Tailwind CSS & shadcn/ui
* **Reasoning**: Tailwind provides utility-first styling for rapid development. shadcn/ui offers beautiful, accessible, and customizable React components without the bloat of traditional component libraries.

## 5. State Management: Zustand
* **Reasoning**: Lightweight, fast, and simple API. We avoid Redux to prevent unnecessary boilerplate and complexity.
