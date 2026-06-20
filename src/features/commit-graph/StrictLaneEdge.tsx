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
  
  // The distance before targetY where we start curving
  const curveOffset = 24; 
  
  let path = '';
  
  if (sourceX === targetX) {
    // Same lane, straight line
    path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  } else {
    // Different lanes. Curve immediately below the source into the target lane,
    // then go straight down.
    const startCurveY = sourceY + curveOffset;
    
    // Draw straight line down slightly, then curve to targetX
    path = `M ${sourceX},${sourceY} L ${sourceX},${startCurveY - curveOffset/2} Q ${sourceX},${startCurveY} ${(sourceX+targetX)/2},${startCurveY} T ${targetX},${startCurveY + curveOffset/2}`;
    
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
