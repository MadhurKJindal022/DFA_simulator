import React, { useCallback } from 'react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Circle, PlayCircle, CheckCircle, ArrowRight, Target, LocateFixed } from 'lucide-react';

const toolbarItems = [
  { type: 'start', label: 'Start State', icon: PlayCircle, color: 'text-amber-500' },
  { type: 'accept', label: 'Accept State', icon: CheckCircle, color: 'text-green-500' },
  { type: 'start-accept', label: 'Start + Accept State', icon: Target, color: 'text-orange-500' },
  { type: 'normal', label: 'Normal State', icon: Circle, color: 'text-slate-500' }
];

export default function DFAToolbar({ onConnectionModeToggle, connectionMode, onCenterView, highlightedElement }) {
  
  const handleDragStart = useCallback((e, stateType) => {
    e.dataTransfer.setData('application/dfa-state-type', stateType);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const getHighlightClass = useCallback((elementId) => {
    return highlightedElement === elementId ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : '';
  }, [highlightedElement]);

  return (
    <TooltipProvider>
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-slate-200 shadow-lg flex flex-col gap-2">
        
        {toolbarItems.map(item => (
          <Tooltip key={item.type}>
            <TooltipTrigger asChild>
              {/* Wrap icon in a div to handle drag more smoothly */}
              <div
                className={`cursor-grab ${getHighlightClass(`${item.type}-state`)}`}
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={item.label}
                >
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Drag to add a {item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="w-full h-[1px] bg-slate-200 my-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={connectionMode ? 'secondary' : 'ghost'}
              size="icon"
              aria-label="Add Transition"
              onClick={onConnectionModeToggle}
              className={getHighlightClass('transition-tool')}
            >
              <ArrowRight className={`w-5 h-5 ${connectionMode ? 'text-blue-600' : 'text-slate-600'}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add Transition</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Center View"
              onClick={onCenterView}
            >
              <LocateFixed className="w-5 h-5 text-slate-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Center View</p>
          </TooltipContent>
        </Tooltip>

      </div>
    </TooltipProvider>
  );
}
