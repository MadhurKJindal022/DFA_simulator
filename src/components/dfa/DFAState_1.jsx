import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Trash2, Play } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

const STATE_COLORS = {
  normal: {
    bg: 'rgb(248 250 252)',
    border: 'rgb(148 163 184)',
    text: 'rgb(51 65 85)'
  },
  start: {
    bg: 'rgb(254 243 199)',
    border: 'rgb(245 158 11)',
    text: 'rgb(146 64 14)'
  },
  accept: {
    bg: 'rgb(220 252 231)',
    border: 'rgb(16 185 129)',
    text: 'rgb(5 150 105)'
  },
  'start-accept': {
    bg: 'rgb(255 237 213)',
    border: 'rgb(249 115 22)',
    text: 'rgb(194 65 12)'
  },
  dead: {
    bg: 'rgb(254 226 226)',
    border: 'rgb(239 68 68)',
    text: 'rgb(185 28 28)'
  }
};

export default function DFAState({ 
  state, 
  onUpdate, 
  onDelete, 
  onDragStart, 
  onConnection,
  isSelected,
  isCurrentState,
  connectionMode 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(state.label);

  const colors = STATE_COLORS[state.type];

  const handleLabelSubmit = (e) => {
    e.preventDefault();
    onUpdate(state.id, { ...state, label: editLabel.trim() || state.label });
    setIsEditing(false);
  };

  const handleTypeChange = (newType) => {
    onUpdate(state.id, { ...state, type: newType });
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!connectionMode) {
      setIsEditing(true);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (connectionMode) {
      onConnection();
    }
  };

  const isAcceptType = state.type === 'accept' || state.type === 'start-accept';
  const isStartType = state.type === 'start' || state.type === 'start-accept';

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isCurrentState ? 1.1 : 1, 
        opacity: 1 
      }}
      whileHover={{ scale: isCurrentState ? 1.15 : 1.05 }}
      className="dfa-state"
    >
      {/* Outer circle for accept states */}
      {isAcceptType && (
        <circle
          cx={state.x}
          cy={state.y}
          r="42"
          fill="none"
          stroke={colors.border}
          strokeWidth="2"
          className={isCurrentState ? 'simulation-active' : ''}
        />
      )}
      
      {/* Main state circle */}
      <circle
        cx={state.x}
        cy={state.y}
        r="35"
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth={isCurrentState ? "4" : "2"}
        className={`cursor-pointer transition-all duration-300 ${
          connectionMode ? 'cursor-crosshair' : 'cursor-move'
        } ${isCurrentState ? 'simulation-active' : ''}`}
        onMouseDown={connectionMode ? undefined : onDragStart}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{
          filter: isCurrentState ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))' : 'none'
        }}
      />

      {/* Start state arrow */}
      {isStartType && (
        <>
          <path
            d={`M ${state.x - 60} ${state.y} L ${state.x - 40} ${state.y}`}
            stroke={colors.border}
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={colors.border}
              />
            </marker>
          </defs>
        </>
      )}

      {/* State label */}
      {isEditing ? (
        <foreignObject x={state.x - 25} y={state.y - 8} width="50" height="16">
          <form onSubmit={handleLabelSubmit}>
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleLabelSubmit}
              className="w-full text-center text-sm font-semibold bg-transparent border-none outline-none"
              style={{ color: colors.text }}
              autoFocus
            />
          </form>
        </foreignObject>
      ) : (
        <text
          x={state.x}
          y={state.y + 5}
          textAnchor="middle"
          className="text-sm font-semibold pointer-events-none select-none"
          fill={colors.text}
        >
          {state.label}
        </text>
      )}

      {/* Controls */}
      {!connectionMode && !isCurrentState && (
        <foreignObject x={state.x + 25} y={state.y - 35} width="30" height="30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 bg-white shadow-sm hover:bg-slate-50"
              >
                <Settings className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleTypeChange('normal')}>
                Normal State
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange('start')}>
                Start State
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange('accept')}>
                Accept State
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange('start-accept')}>
                Start + Accept State
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeChange('dead')}>
                Dead State
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(state.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </foreignObject>
      )}

      {/* Current state indicator */}
      {isCurrentState && (
        <circle
          cx={state.x}
          cy={state.y - 50}
          r="8"
          fill="rgb(59 130 246)"
          className="animate-bounce"
        />
      )}
    </motion.g>
  );
}
