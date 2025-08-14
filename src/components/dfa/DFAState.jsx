import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { createPortal } from 'react-dom';

const STATE_COLORS = {
  normal: { bg: 'rgb(248 250 252)', border: 'rgb(148 163 184)', text: 'rgb(51 65 85)' },
  start: { bg: 'rgb(254 243 199)', border: 'rgb(245 158 11)', text: 'rgb(146 64 14)' },
  accept: { bg: 'rgb(220 252 231)', border: 'rgb(16 185 129)', text: 'rgb(5 150 105)' },
  'start-accept': { bg: 'rgb(255 237 213)', border: 'rgb(249 115 22)', text: 'rgb(194 65 12)' },
  dead: { bg: 'rgb(254 226 226)', border: 'rgb(239 68 68)', text: 'rgb(185 28 28)' }
};

// Enhanced portal dropdown with keyboard navigation
function DFAStateDropdown({ state, onDelete, handleTypeChange, setDropdownOpen }) {
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0 });
  const dropdownRef = useRef(null);
  const items = [
    { label: 'Normal State', type: 'normal' },
    { label: 'Start State', type: 'start' },
    { label: 'Accept State', type: 'accept' },
    { label: 'Start + Accept State', type: 'start-accept' },
    { label: 'Dead State', type: 'dead' },
    { label: 'Delete', type: 'delete' },
  ];
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const dropdownWidth = 160;
    const dropdownHeight = 220;
    const padding = 8;

    let left = state.x + 40; // default right side
    let top = state.y - 60; // default above

    if (left + dropdownWidth > window.innerWidth - padding) left = state.x - dropdownWidth - 20;
    if (top < padding) top = state.y + 40;

    setDropdownPos({ left, top });

    // Focus first item on open
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = items[focusedIndex];
        if (item.type === 'delete') onDelete(state.id);
        else handleTypeChange(item.type);
        setDropdownOpen(false);
      } else if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [state.x, state.y, focusedIndex]);

  return createPortal(
    <div
      ref={dropdownRef}
      className="absolute bg-white shadow-md rounded-md py-1 z-50 outline-none"
      style={{ left: dropdownPos.left, top: dropdownPos.top, minWidth: 160 }}
      onClick={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      {items.map((item, index) => {
        const isDelete = item.type === 'delete';
        return (
          <div
            key={item.type}
            className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${
              focusedIndex === index ? 'bg-gray-100' : ''
            } ${isDelete ? 'text-red-600' : ''}`}
            onClick={() => {
              if (isDelete) onDelete(state.id);
              else handleTypeChange(item.type);
              setDropdownOpen(false);
            }}
            onMouseEnter={() => setFocusedIndex(index)}
          >
            {isDelete && <Trash2 className="w-4 h-4 inline mr-1" />}
            {item.label}
          </div>
        );
      })}
    </div>,
    document.body
  );
}

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const colors = STATE_COLORS[state.type];

  const handleLabelSubmit = (e) => {
    e.preventDefault();
    onUpdate(state.id, { ...state, label: editLabel.trim() || state.label });
    setIsEditing(false);
  };

  const handleTypeChange = (newType) => {
    onUpdate(state.id, { ...state, type: newType });
    setDropdownOpen(false);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!connectionMode) setIsEditing(true);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (connectionMode) onConnection();
  };

  const isAcceptType = state.type === 'accept' || state.type === 'start-accept';
  const isStartType = state.type === 'start' || state.type === 'start-accept';

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isCurrentState ? 1.1 : 1, opacity: 1 }}
      whileHover={{ scale: isCurrentState ? 1.15 : 1.05 }}
      className="dfa-state"
    >
      {isAcceptType && (
        <circle cx={state.x} cy={state.y} r="42" fill="none" stroke={colors.border} strokeWidth="2" className={isCurrentState ? 'simulation-active' : ''} />
      )}

      <circle
        cx={state.x}
        cy={state.y}
        r="35"
        fill={colors.bg}
        stroke={colors.border}
        strokeWidth={isCurrentState ? "4" : "2"}
        className={`cursor-pointer transition-all duration-300 ${connectionMode ? 'cursor-crosshair' : 'cursor-move'} ${isCurrentState ? 'simulation-active' : ''}`}
        onMouseDown={connectionMode ? undefined : onDragStart}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{ filter: isCurrentState ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))' : 'none' }}
      />

      {isStartType && (
        <>
          <path d={`M ${state.x - 60} ${state.y} L ${state.x - 40} ${state.y}`} stroke={colors.border} strokeWidth="2" markerEnd="url(#arrowhead)" />
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={colors.border} />
            </marker>
          </defs>
        </>
      )}

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
        <text x={state.x} y={state.y + 5} textAnchor="middle" className="text-sm font-semibold pointer-events-none select-none" fill={colors.text}>
          {state.label}
        </text>
      )}

      {!connectionMode && !isCurrentState && (
        <foreignObject x={state.x + 25} y={state.y - 35} width="30" height="30">
          <Button variant="outline" size="icon" className="w-7 h-7 bg-white shadow-sm hover:bg-slate-50" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <Settings className="w-3 h-3" />
          </Button>
        </foreignObject>
      )}

      {dropdownOpen && (
        <DFAStateDropdown state={state} onDelete={onDelete} handleTypeChange={handleTypeChange} setDropdownOpen={setDropdownOpen} />
      )}

      {isCurrentState && <circle cx={state.x} cy={state.y - 50} r="8" fill="rgb(59 130 246)" className="animate-bounce" />}
    </motion.g>
  );
}
