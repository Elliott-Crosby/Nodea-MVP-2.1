import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

export default function CustomCurvedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) {
  // Calculate the distance between source and target
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Calculate exaggerated control points for tall curves
  // For horizontal connections, create a tall arc
  // For vertical connections, create a wide arc
  let controlPointOffsetX = 0;
  let controlPointOffsetY = 0;
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal connection - create tall vertical curve
    controlPointOffsetX = deltaX * 0.5; // Midpoint horizontally
    controlPointOffsetY = Math.max(100, Math.abs(deltaX) * 0.8); // Tall curve, minimum 100px height
    
    // Determine curve direction based on relative positions
    if (sourceY < targetY) {
      // Source is above target - curve down then up
      controlPointOffsetY = -controlPointOffsetY;
    }
  } else {
    // Vertical connection - create wide horizontal curve
    controlPointOffsetY = deltaY * 0.5; // Midpoint vertically
    controlPointOffsetX = Math.max(100, Math.abs(deltaY) * 0.8); // Wide curve, minimum 100px width
    
    // Determine curve direction based on relative positions
    if (sourceX < targetX) {
      // Source is left of target - curve right then left
      controlPointOffsetX = -controlPointOffsetX;
    }
  }
  
  // Calculate control points
  const controlPoint1X = sourceX + controlPointOffsetX;
  const controlPoint1Y = sourceY + controlPointOffsetY;
  const controlPoint2X = targetX - controlPointOffsetX;
  const controlPoint2Y = targetY - controlPointOffsetY;
  
  // Generate the Bezier path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.5, // Additional curvature parameter
  });

  // Override with our custom control points for more dramatic curves
  const customPath = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;

  return (
    <>
      <BaseEdge
        id={id}
        path={customPath}
        style={{
          strokeWidth: 3,
          stroke: '#6366f1',
          strokeDasharray: data?.kind === 'reference' ? '8,4' : undefined,
          ...style,
        }}
        markerEnd={markerEnd}
      />
    </>
  );
}

