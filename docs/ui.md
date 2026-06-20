# UI System

GitAugur utilizes a purely custom, ultra-modern UI heavily inspired by GitHub's Primer and Tailwind's syntax.

### Stack
- **TailwindCSS**: All layout boundaries, grids, and typographies are managed via pure Tailwind classes.
- **Lucide React**: Vector icons strictly sourced from `lucide-react` for high-fidelity SVG scaling.
- **Dark Mode Native**: Built intentionally as a dark-mode first client (slate-950/slate-900 palettes).

### Components
- `DiffViewer.tsx`: Custom parsing engine handling line additions, deletions, context boundaries, and headers natively without relying on heavy external Diff libraries.
- `CommitGraph.tsx`: Vectorized SVG pathways rendering branch topologies.
- `TutorPanel.tsx`: Contextually aware Git assistance panel explaining obscure terminology to juniors.

### Layout Principles
`flex-1`, `min-h-0`, and `overflow-hidden` are used rigorously on root containers to enforce strict internal scrollable regions rather than document-level scrolling.
