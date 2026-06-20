// Mapping of branch names to deterministic colors

// A visually distinct, GitKraken-like color palette for branches
export const branchColorPalette = [
  { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-400", line: "bg-blue-500", stroke: "#3b82f6" },
  { bg: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-400", line: "bg-emerald-500", stroke: "#10b981" },
  { bg: "bg-amber-500", border: "border-amber-500", text: "text-amber-400", line: "bg-amber-500", stroke: "#f59e0b" },
  { bg: "bg-purple-500", border: "border-purple-500", text: "text-purple-400", line: "bg-purple-500", stroke: "#a855f7" },
  { bg: "bg-rose-500", border: "border-rose-500", text: "text-rose-400", line: "bg-rose-500", stroke: "#f43f5e" },
  { bg: "bg-cyan-500", border: "border-cyan-500", text: "text-cyan-400", line: "bg-cyan-500", stroke: "#06b6d4" },
  { bg: "bg-lime-500", border: "border-lime-500", text: "text-lime-400", line: "bg-lime-500", stroke: "#84cc16" },
  { bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-400", line: "bg-orange-500", stroke: "#f97316" },
  { bg: "bg-pink-500", border: "border-pink-500", text: "text-pink-400", line: "bg-pink-500", stroke: "#ec4899" },
  { bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-400", line: "bg-yellow-500", stroke: "#eab308" },
  { bg: "bg-red-500", border: "border-red-500", text: "text-red-400", line: "bg-red-500", stroke: "#ef4444" }
];

export const GHOST_COLOR = { bg: "bg-slate-400", border: "border-slate-400", text: "text-slate-400", line: "bg-slate-400", stroke: "#94a3b8" };

/**
 * Deterministically generates a color palette index from a string.
 */
function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

import { useSettingsStore } from '../stores/useSettingsStore';

/**
 * Returns a stable color set for a specific branch name.
 */
export function colorForBranch(branchName: string) {
  if (!branchName) return branchColorPalette[0];
  
  // Check user-defined custom colors first
  const customColors = useSettingsStore.getState().customBranchColors || {};
  if (customColors[branchName] !== undefined && customColors[branchName] >= 0 && customColors[branchName] < branchColorPalette.length) {
    return branchColorPalette[customColors[branchName]];
  }

  // Special handling for common main branches to ensure they get consistent known colors
  const normalized = branchName.toLowerCase().replace('origin/', '');
  
  if (normalized === 'main' || normalized === 'master') {
    return branchColorPalette[0]; // Blue
  }
  if (normalized === 'develop' || normalized === 'dev') {
    return branchColorPalette[3]; // Purple
  }
  if (normalized === 'dev-windows') {
    return branchColorPalette[1]; // Emerald (Green)
  }
  if (normalized.startsWith('feature/')) {
    return branchColorPalette[7]; // Orange
  }
  if (normalized.startsWith('release/')) {
    return branchColorPalette[9]; // Yellow
  }
  if (normalized.startsWith('hotfix/')) {
    return branchColorPalette[10]; // Red
  }
  if (normalized.startsWith('exp/') || normalized.startsWith('expr/')) {
    return branchColorPalette[8]; // Pink
  }

  // Fallback for anonymous lanes
  if (normalized.startsWith('__lane_')) {
    const laneIdx = parseInt(normalized.split('_').pop() || '0', 10);
    // Offset by 2 so we don't accidentally get blue or green for early unknown lanes if possible, 
    // but keep it deterministic
    return branchColorPalette[(laneIdx + 2) % branchColorPalette.length];
  }

  // Generic fallback with deterministic hashing for any other branch names
  return branchColorPalette[stringHash(normalized) % branchColorPalette.length];
}
