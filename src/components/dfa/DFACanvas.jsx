import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import DFAState from './DFAState';
import DFATransition from './DFATransition';
import DFAToolbar from './DFAToolbar';
import { MousePointer2 } from 'lucide-react';

const DFACanvas = forwardRef(({
  states,
  transitions,
  onStateAdd,
  onStateUpdate,
  onStateDelete,
  onTransitionAdd,
  onTransitionUpdate,
  onTransitionDelete,
  onTransitionCurveUpdate,
  currentState,
  simulationMode = false,
  splitMode = false,
  transitionCurvatures = {}
}, ref) => {
  const canvasRef = useRef(null);

  // --- State ---
  const [draggedState, setDraggedState] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [draggingCurveInfo, setDraggingCurveInfo] = useState(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // --- Center View ---
  const centerView = useCallback(() => {
    if (!canvasRef.current || states.length === 0) return setViewOffset({ x: 0, y: 0 });

    const { width: canvasWidth, height: canvasHeight } = canvasRef.current.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    states.forEach(s => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x);
      maxY = Math.max(maxY, s.y);
    });

    const padding = 80;
    const statesWidth = maxX - minX + padding;
    const statesHeight = maxY - minY + padding;

    const newOffsetX = (canvasWidth - statesWidth) / 2 - minX + padding / 2;
    const newOffsetY = (canvasHeight - statesHeight) / 2 - minY + padding / 2;

    setViewOffset({ x: newOffsetX, y: newOffsetY });
  }, [states]);

  useImperativeHandle(ref, () => ({ centerView }));

  // --- Drag & Drop ---
  const handleDragOver = useCallback(e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const handleDrop = useCallback(e => {
    e.preventDefault();
    const stateType = e.dataTransfer.getData('application/dfa-state-type');
    if (!stateType) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - viewOffset.x;
    const y = e.clientY - rect.top - viewOffset.y;

    onStateAdd({
      id: `state-${Date.now()}`,
      label: `q${states.length}`,
      type: stateType,
      x, y
    });
  }, [onStateAdd, states.length, viewOffset]);

  // --- Canvas Click ---
  const handleCanvasClick = useCallback(() => {
    if (connectionMode) { setConnectionMode(false); setConnectionStart(null); }
  }, [connectionMode]);

  // --- Mouse Move ---
  const handleMouseMove = useCallback(e => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setViewOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const mouseInContent = { x: rawMouse.x - viewOffset.x, y: rawMouse.y - viewOffset.y };
    setMousePosition(mouseInContent);

    if (draggedState) {
      const newX = mouseInContent.x - dragOffset.x;
      const newY = mouseInContent.y - dragOffset.y;
      onStateUpdate(draggedState.id, {
        ...draggedState,
        x: Math.max(40 - viewOffset.x, Math.min(rect.width - 40 - viewOffset.x, newX)),
        y: Math.max(40 - viewOffset.y, Math.min(rect.height - 40 - viewOffset.y, newY))
      });
      return;
    }

    if (draggingCurveInfo) {
      const { key, from, to, isBidirectional, arcIndex } = draggingCurveInfo;
      const dx = to.x - from.x, dy = to.y - from.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      if (distance === 0) return;

      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const perpX = -dy / distance;
      const perpY = dx / distance;
      const totalOffset = (mouseInContent.x - midX) * perpX + (mouseInContent.y - midY) * perpY;

      let baseCurve = 20 + (arcIndex || 0) * 35;
      if (isBidirectional) baseCurve = from.id > to.id ? -45 : 45;

      onTransitionCurveUpdate(key, totalOffset - baseCurve);
    }
  }, [draggedState, dragOffset, isPanning, panStart, viewOffset, draggingCurveInfo, onStateUpdate, onTransitionCurveUpdate]);

  // --- Drag Start / Stop ---
  const startDrag = useCallback((state, e) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggedState(state);
    setDragOffset({ x: e.clientX - rect.left - viewOffset.x - state.x, y: e.clientY - rect.top - viewOffset.y - state.y });
  }, [viewOffset]);

  const stopDrag = useCallback(() => {
    setDraggedState(null);
    setDragOffset({ x: 0, y: 0 });
    setDraggingCurveInfo(null);
    setIsPanning(false);
  }, []);

  const handleCanvasMouseDown = useCallback(e => {
    if (e.target === e.currentTarget) { setIsPanning(true); setPanStart({ x: e.clientX, y: e.clientY }); }
  }, []);

  // --- State Connection ---
  const handleStateConnection = useCallback(fromState => {
    if (connectionStart) {
      const symbol = prompt('Enter transition symbol(s), comma-separated:');
      if (symbol) {
        symbol.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
          onTransitionAdd({ id: `transition-${Date.now()}-${s}`, from: connectionStart.id, to: fromState.id, symbol: s });
        });
      }
      setConnectionMode(false); setConnectionStart(null);
    } else {
      setConnectionMode(true); setConnectionStart(fromState);
    }
  }, [connectionStart, onTransitionAdd]);

  const toggleConnectionMode = useCallback(() => { setConnectionMode(prev => !prev); setConnectionStart(null); }, []);

  // --- Transitions ---
  const getTransitionsForStates = useCallback((fromId, toId) => transitions.filter(t => t.from === fromId && t.to === toId), [transitions]);

  const renderMergedTransitions = useMemo(() => {
    return states.flatMap(fromState =>
      states.map(toState => {
        const transitionsFromTo = getTransitionsForStates(fromState.id, toState.id);
        if (!transitionsFromTo.length) return null;
        const isBidirectional = transitions.some(t => t.from === toState.id && t.to === fromState.id);
        const key = `${fromState.id}-${toState.id}`;
        return (
          <DFATransition
            key={key}
            from={fromState}
            to={toState}
            transitions={transitionsFromTo}
            onUpdate={onTransitionUpdate}
            onDelete={onTransitionDelete}
            onCurveDragStart={() => setDraggingCurveInfo({ key, from: fromState, to: toState, isBidirectional, arcIndex: 0 })}
            isActive={simulationMode && currentState === fromState.id}
            isBidirectional={isBidirectional}
            customCurvature={transitionCurvatures[key] || 0}
          />
        );
      })
    );
  }, [states, transitions, getTransitionsForStates, onTransitionUpdate, onTransitionDelete, simulationMode, currentState, transitionCurvatures]);

  const renderSplitTransitions = useMemo(() => {
    return transitions.map(t => {
      const fromState = states.find(s => s.id === t.from);
      const toState = states.find(s => s.id === t.to);
      if (!fromState || !toState) return null;
      const allBetween = getTransitionsForStates(fromState.id, toState.id);
      const index = allBetween.findIndex(tt => tt.id === t.id);
      const key = `${fromState.id}-${toState.id}-${index}`;
      return (
        <DFATransition
          key={t.id}
          from={fromState}
          to={toState}
          transitions={[t]}
          onUpdate={onTransitionUpdate}
          onDelete={onTransitionDelete}
          onCurveDragStart={() => setDraggingCurveInfo({ key, from: fromState, to: toState, isBidirectional: false, arcIndex: index })}
          isActive={simulationMode && currentState === fromState.id}
          isBidirectional={false}
          arcIndex={index}
          customCurvature={transitionCurvatures[key] || 0}
        />
      );
    });
  }, [transitions, states, getTransitionsForStates, onTransitionUpdate, onTransitionDelete, simulationMode, currentState, transitionCurvatures]);

  // --- Render ---
  return (
    <div className={`relative w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}>
      <DFAToolbar onConnectionModeToggle={toggleConnectionMode} connectionMode={connectionMode} onCenterView={centerView} />

      {states.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-white/80 rounded-2xl border border-slate-200 shadow-sm">
            <MousePointer2 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Start Building Your DFA</h3>
            <p className="text-slate-500 max-w-md">Drag state types from the toolbar on the left onto the canvas to begin.</p>
          </div>
        </div>
      )}

      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        className="dfa-canvas"
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(148 163 184)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g transform={`translate(${viewOffset.x}, ${viewOffset.y})`}>
          {splitMode ? renderSplitTransitions : renderMergedTransitions}
          {connectionMode && connectionStart && (
            <line
              x1={connectionStart.x}
              y1={connectionStart.y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="rgb(59 130 246)"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          )}
          {states.map(state => (
            <DFAState
              key={state.id}
              state={state}
              onUpdate={onStateUpdate}
              onDelete={onStateDelete}
              onDragStart={(e) => startDrag(state, e)}
              onConnection={() => handleStateConnection(state)}
              isCurrentState={simulationMode && currentState === state.id}
              connectionMode={connectionMode}
            />
          ))}
        </g>
      </svg>
    </div>
  );
});

export default DFACanvas;
