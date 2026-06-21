import { BaseEdge, type EdgeProps, getSmoothStepPath, Position } from '@xyflow/react';
import { colorForBranch, GHOST_COLOR } from '../../utils/branchColors';

export function StrictLaneEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
  markerStart,
  data,
}: EdgeProps) {
  // We want the line to go straight down the source lane until it is close to the target,
  // then curve horizontally to the target lane.

  const bColor = colorForBranch((data as any)?.primaryBranch);
  const isGhost = (data as any)?.isGhost;
  
  const customStyle = {
    ...style,
    stroke: isGhost ? GHOST_COLOR.stroke : bColor.stroke
  };
  
  let path = '';
  
  if (Math.abs(sourceX - targetX) < 1) {
    // Same lane, straight line
    path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  } else {
    // Different lanes. Use smooth step path.
    const [smoothPath] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      targetX,
      targetY,
      borderRadius: 16,
    });
    path = smoothPath;
  }

  return (
    <BaseEdge 
      path={path} 
      style={customStyle} 
      markerEnd={markerEnd} 
      markerStart={markerStart}
    />
  );
}
