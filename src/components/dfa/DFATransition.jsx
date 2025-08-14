import React from 'react';
import { X } from 'lucide-react';

export default function DFATransition({
  from,
  to,
  transitions,
  onDelete,
  onCurveDragStart,
  isActive = false,
  isBidirectional = false,
  arcIndex = 0,
  customCurvatureX = 0,
  customCurvatureY = 0
}) {
  const stateRadius = 35;
  const labelText = transitions.map(t => t.symbol).join(',');

  // === SELF-LOOP ===
  if (from.id === to.id) {
    const loopRadius = 25 + arcIndex * 15;
    const path = `
      M ${from.x - stateRadius * 0.5} ${from.y - stateRadius * 0.8}
      A ${loopRadius} ${loopRadius} 0 1 1 ${from.x + stateRadius * 0.5} ${from.y - stateRadius * 0.8}
    `;
    const labelX = from.x;
    const labelY = from.y - stateRadius - loopRadius - 8;

    return (
      <g className="cursor-pointer group">
        <defs>
          <marker
            id={`arrowhead-loop-${from.id}-${arcIndex}`}
            markerWidth="8"
            markerHeight="6"
            refX="7.5"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill={isActive ? "rgb(59 130 246)" : "rgb(100 116 139)"}
            />
          </marker>
        </defs>

        <path d={path} fill="none" stroke="transparent" strokeWidth="20" />
        <path
          d={path}
          fill="none"
          stroke={isActive ? "rgb(59 130 246)" : "rgb(100 116 139)"}
          strokeWidth={isActive ? "2.5" : "1.8"}
          markerEnd={`url(#arrowhead-loop-${from.id}-${arcIndex})`}
          className={`transition-colors duration-200 ${isActive ? 'simulation-active' : 'group-hover:stroke-blue-500'}`}
        />

        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          className="text-xs font-semibold pointer-events-none select-none"
          fill={isActive ? "rgb(59 130 246)" : "rgb(51 65 85)"}
        >
          {labelText}
        </text>

        <foreignObject x={labelX - 8} y={labelY - 25} width="16" height="16">
          <button
            onClick={() => transitions.forEach(t => onDelete(t))}
            className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </foreignObject>
      </g>
    );
  }

  // === STANDARD TRANSITIONS ===
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const startX = from.x + (dx / distance) * stateRadius;
  const startY = from.y + (dy / distance) * stateRadius;
  const endX = to.x - (dx / distance) * stateRadius;
  const endY = to.y - (dy / distance) * stateRadius;

  let baseCurveFactor = 20 + arcIndex * 30;
  if (isBidirectional) {
    baseCurveFactor = from.id > to.id ? -45 : 45;
  }

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const perpX = -(endY - startY) / distance * baseCurveFactor;
  const perpY = (endX - startX) / distance * baseCurveFactor;

  const controlX = midX + perpX + customCurvatureX;
  const controlY = midY + perpY + customCurvatureY;

  const pathId = `path_${from.id}_${to.id}_${arcIndex}`;
  const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

  const t = 0.5;
  const labelX =
    (1 - t) * (1 - t) * startX +
    2 * (1 - t) * t * controlX +
    t * t * endX;
  const labelY =
    (1 - t) * (1 - t) * startY +
    2 * (1 - t) * t * controlY +
    t * t * endY - 6;

  return (
    <g className="group">
      <defs>
        <marker
          id={`arrowhead-transition-${pathId}`}
          markerWidth="8"
          markerHeight="6"
          refX="7.5"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill={isActive ? "rgb(59 130 246)" : "rgb(100 116 139)"}
          />
        </marker>
        <path id={pathId} d={pathData} />
      </defs>

      <path d={pathData} fill="none" stroke="transparent" strokeWidth="25" />

      <path
        d={pathData}
        fill="none"
        stroke={isActive ? "rgb(59 130 246)" : "rgb(148 163 184)"}
        strokeWidth={isActive ? "2.5" : "1.8"}
        markerEnd={`url(#arrowhead-transition-${pathId})`}
        className={`transition-colors duration-200 ${isActive ? 'simulation-active' : 'group-hover:stroke-blue-500'}`}
      />

      {/* DRAG HANDLE */}
      <circle
        cx={controlX}
        cy={controlY}
        r="5"
        fill="rgba(59, 130, 246, 0.6)"
        stroke="rgb(59, 130, 246)"
        strokeWidth="1"
        className="opacity-0 group-hover:opacity-100 cursor-move transition-opacity"
        onMouseDown={(e) => {
          e.stopPropagation();
          onCurveDragStart(e, {
            fromId: from.id,
            toId: to.id,
            arcIndex,
            currentX: customCurvatureX,
            currentY: customCurvatureY
          });
        }}
      />

      <text dy="-6" className="text-xs font-semibold pointer-events-none select-none" fill={isActive ? "rgb(59 130 246)" : "rgb(51 65 85)"}>
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {labelText}
        </textPath>
      </text>

      <foreignObject x={labelX - 8} y={labelY - 25} width="16" height="16">
        <button
          onClick={() => transitions.forEach(t => onDelete(t))}
          className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
        >
          <X className="w-3 h-3" />
        </button>
      </foreignObject>
    </g>
  );
}
