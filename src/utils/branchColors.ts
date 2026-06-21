// Mapping of branch names to deterministic colors

// A visually distinct, GitKraken-like color palette for branches
export const branchColorPalette = [
  { bg: "bg-[#FF0000]", border: "border-[#FF0000]", text: "text-[#FF0000]", line: "bg-[#FF0000]", stroke: "#FF0000" },
  { bg: "bg-[#00FF00]", border: "border-[#00FF00]", text: "text-[#00FF00]", line: "bg-[#00FF00]", stroke: "#00FF00" },
  { bg: "bg-[#0000FF]", border: "border-[#0000FF]", text: "text-[#0000FF]", line: "bg-[#0000FF]", stroke: "#0000FF" },
  { bg: "bg-[#FFFF00]", border: "border-[#FFFF00]", text: "text-[#FFFF00]", line: "bg-[#FFFF00]", stroke: "#FFFF00" },
  { bg: "bg-[#FF00FF]", border: "border-[#FF00FF]", text: "text-[#FF00FF]", line: "bg-[#FF00FF]", stroke: "#FF00FF" },
  { bg: "bg-[#00FFFF]", border: "border-[#00FFFF]", text: "text-[#00FFFF]", line: "bg-[#00FFFF]", stroke: "#00FFFF" },
  { bg: "bg-[#FF8000]", border: "border-[#FF8000]", text: "text-[#FF8000]", line: "bg-[#FF8000]", stroke: "#FF8000" },
  { bg: "bg-[#8000FF]", border: "border-[#8000FF]", text: "text-[#8000FF]", line: "bg-[#8000FF]", stroke: "#8000FF" },
  { bg: "bg-[#00FF80]", border: "border-[#00FF80]", text: "text-[#00FF80]", line: "bg-[#00FF80]", stroke: "#00FF80" },
  { bg: "bg-[#FF0080]", border: "border-[#FF0080]", text: "text-[#FF0080]", line: "bg-[#FF0080]", stroke: "#FF0080" },
  { bg: "bg-[#80FF00]", border: "border-[#80FF00]", text: "text-[#80FF00]", line: "bg-[#80FF00]", stroke: "#80FF00" },
  { bg: "bg-[#0080FF]", border: "border-[#0080FF]", text: "text-[#0080FF]", line: "bg-[#0080FF]", stroke: "#0080FF" }
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
