import { BaseEdge, type EdgeProps } from '@xyflow/react';

export function StrictLaneEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) {
  // We want the line to go straight down the source lane until it is close to the target,
  // then curve horizontally to the target lane.
  
  // The distance before targetY where we start curving
  const curveOffset = 24; 
  
  let path = '';
  
  if (sourceX === targetX) {
    // Same lane, straight line
    path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  } else {
    // Different lanes. Stay in source lane vertically.
    // Go down to targetY - curveOffset.
    const startCurveY = targetY - curveOffset;
    
    // Draw straight line down
    path = `M ${sourceX},${sourceY} L ${sourceX},${startCurveY}`;
    
    // Curve into target
    // Quadratic bezier: Q controlPointX controlPointY, endPointX endPointY
    path += ` Q ${sourceX},${targetY} ${targetX},${targetY}`;
  }

  return (
    <BaseEdge 
      path={path} 
      style={style} 
      markerEnd={markerEnd} 
    />
  );
}
