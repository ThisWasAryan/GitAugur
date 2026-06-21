// Mapping of branch names to deterministic colors

// A visually distinct, GitKraken-like color palette for branches
export const branchColorPalette = [
  { bg: "bg-[#0000FF]", border: "border-[#0000FF]", text: "text-[#0000FF]", line: "bg-[#0000FF]", stroke: "#0000FF" },
  { bg: "bg-[#FF00FF]", border: "border-[#FF00FF]", text: "text-[#FF00FF]", line: "bg-[#FF00FF]", stroke: "#FF00FF" },
  { bg: "bg-[#00FFFF]", border: "border-[#00FFFF]", text: "text-[#00FFFF]", line: "bg-[#00FFFF]", stroke: "#00FFFF" },
  { bg: "bg-[#FF8000]", border: "border-[#FF8000]", text: "text-[#FF8000]", line: "bg-[#FF8000]", stroke: "#FF8000" },
  { bg: "bg-[#8000FF]", border: "border-[#8000FF]", text: "text-[#8000FF]", line: "bg-[#8000FF]", stroke: "#8000FF" },
  { bg: "bg-[#FF0080]", border: "border-[#FF0080]", text: "text-[#FF0080]", line: "bg-[#FF0080]", stroke: "#FF0080" },
  { bg: "bg-[#0080FF]", border: "border-[#0080FF]", text: "text-[#0080FF]", line: "bg-[#0080FF]", stroke: "#0080FF" },
  { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-400", line: "bg-blue-500", stroke: "#3b82f6" },
  { bg: "bg-purple-500", border: "border-purple-500", text: "text-purple-400", line: "bg-purple-500", stroke: "#a855f7" },
  { bg: "bg-cyan-500", border: "border-cyan-500", text: "text-cyan-400", line: "bg-cyan-500", stroke: "#06b6d4" },
  { bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-400", line: "bg-orange-500", stroke: "#f97316" },
  { bg: "bg-pink-500", border: "border-pink-500", text: "text-pink-400", line: "bg-pink-500", stroke: "#ec4899" },
  { bg: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-400", line: "bg-yellow-500", stroke: "#eab308" }
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
