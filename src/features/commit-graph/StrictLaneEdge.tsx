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
  
  let path = '';
  
  if (sourceX === targetX) {
    // Same lane, straight line
    path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  } else {
    // Different lanes. Curve immediately below the source into the target lane,
    // then go straight down.
    
    // Start curve immediately at sourceY
    path = `M ${sourceX},${sourceY} Q ${sourceX},${sourceY + curveOffset/2} ${(sourceX+targetX)/2},${sourceY + curveOffset/2} T ${targetX},${sourceY + curveOffset}`;
    
    // Then straight down to target
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
