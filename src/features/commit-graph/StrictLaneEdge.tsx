import { BaseEdge, type EdgeProps } from '@xyflow/react';
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
  
  // The total vertical distance for the curve
  const maxOffset = Math.abs(targetY - sourceY);
  const curveOffset = Math.min(24, maxOffset); 
  const sign = targetY > sourceY ? 1 : -1;
  const yOffset = curveOffset * sign;
  
  let path = '';
  
  if (sourceX === targetX) {
    // Same lane, straight line
    path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  } else {
    // Different lanes. Curve immediately from source into the target lane.
    
    // Start curve immediately at sourceY
    path = `M ${sourceX},${sourceY} Q ${sourceX},${sourceY + yOffset/2} ${(sourceX+targetX)/2},${sourceY + yOffset/2} T ${targetX},${sourceY + yOffset}`;
    
    // Then straight to target
    path += ` L ${targetX},${targetY}`;
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
