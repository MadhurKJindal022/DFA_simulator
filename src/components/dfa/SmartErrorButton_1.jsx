import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { AlertTriangle, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Badge } from '../ui/badge';

export default function SmartErrorButton({ states, transitions, alphabet }) {
  const [isOpen, setIsOpen] = useState(false);

  const errors = useMemo(() => {
    const detectedErrors = [];

    // Check for non-deterministic transitions (multiple transitions from same state with same symbol)
    for (const state of states) {
      for (const symbol of alphabet) {
        const sameTransitions = transitions.filter(
          t => t.from === state.id && t.symbol === symbol
        );
        
        if (sameTransitions.length > 1) {
          const targetStates = sameTransitions.map(t => {
            const targetState = states.find(s => s.id === t.to);
            return targetState ? targetState.label : t.to;
          });
          
          detectedErrors.push({
            type: 'non-deterministic',
            severity: 'error',
            message: `State ${state.label} has multiple transitions for symbol '${symbol}'`,
            details: `Goes to states: ${targetStates.join(', ')}. A DFA can only have one transition per symbol from each state.`,
            suggestion: `Keep only one transition from ${state.label} on '${symbol}', or merge the target states.`,
            affectedElements: sameTransitions.map(t => t.id)
          });
        }
      }
    }

    // Check for multiple start states
    const startStates = states.filter(s => s.type === 'start' || s.type === 'start-accept');
    if (startStates.length > 1) {
      detectedErrors.push({
        type: 'multiple-start',
        severity: 'error', 
        message: 'Multiple start states detected',
        details: `Found ${startStates.length} start states: ${startStates.map(s => s.label).join(', ')}. A DFA must have exactly one start state.`,
        suggestion: 'Change all but one start state to normal or accept states.',
        affectedElements: startStates.map(s => s.id)
      });
    }

    // Check for unreachable states
    if (states.length > 0) {
      const startState = states.find(s => s.type === 'start' || s.type === 'start-accept');
      if (startState) {
        const reachable = new Set([startState.id]);
        const queue = [startState.id];
        
        while (queue.length > 0) {
          const currentStateId = queue.shift();
          const outgoingTransitions = transitions.filter(t => t.from === currentStateId);
          
          for (const transition of outgoingTransitions) {
            if (!reachable.has(transition.to)) {
              reachable.add(transition.to);
              queue.push(transition.to);
            }
          }
        }
        
        const unreachableStates = states.filter(s => !reachable.has(s.id));
        if (unreachableStates.length > 0) {
          detectedErrors.push({
            type: 'unreachable-states',
            severity: 'warning',
            message: `${unreachableStates.length} unreachable state(s) found`,
            details: `States ${unreachableStates.map(s => s.label).join(', ')} cannot be reached from the start state.`,
            suggestion: 'Add transitions to make these states reachable, or remove them if not needed.',
            affectedElements: unreachableStates.map(s => s.id)
          });
        }
      }
    }

    // Check for transitions to non-existent states
    const stateIds = new Set(states.map(s => s.id));
    const invalidTransitions = transitions.filter(t => !stateIds.has(t.to) || !stateIds.has(t.from));
    if (invalidTransitions.length > 0) {
      detectedErrors.push({
        type: 'invalid-transitions',
        severity: 'error',
        message: 'Transitions pointing to deleted states',
        details: 'Some transitions reference states that no longer exist.',
        suggestion: 'These transitions will be automatically cleaned up.',
        affectedElements: invalidTransitions.map(t => t.id)
      });
    }

    // Check for transitions using symbols not in alphabet
    const alphabetSet = new Set(alphabet);
    const invalidSymbolTransitions = transitions.filter(t => !alphabetSet.has(t.symbol));
    if (invalidSymbolTransitions.length > 0) {
      const invalidSymbols = [...new Set(invalidSymbolTransitions.map(t => t.symbol))];
      detectedErrors.push({
        type: 'invalid-symbols',
        severity: 'warning',
        message: 'Transitions using symbols not in alphabet',
        details: `Symbols ${invalidSymbols.join(', ')} are used in transitions but not defined in the alphabet.`,
        suggestion: `Add these symbols to the alphabet: ${invalidSymbols.join(', ')}`,
        affectedElements: invalidSymbolTransitions.map(t => t.id)
      });
    }

    return detectedErrors;
  }, [states, transitions, alphabet]);

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  if (errors.length === 0) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <X className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`fixed bottom-6 right-6 z-50 shadow-lg animate-pulse
            ${errorCount > 0 
              ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-600' 
              : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-600'
            }`}
        >
          {errorCount > 0 ? <X className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {(errorCount + warningCount > 0) && (
            <Badge 
              className="absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
            >
              {errorCount + warningCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 max-h-96 overflow-y-auto" 
        side="left" 
        sideOffset={10}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold text-slate-800">DFA Issues Detected</h4>
          </div>
          
          <div className="space-y-3">
            {errors.map((error, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${getSeverityColor(error.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm mb-1">
                      {error.message}
                    </h5>
                    <p className="text-xs opacity-80 mb-2">
                      {error.details}
                    </p>
                    <div className="bg-white/70 rounded p-2 border">
                      <p className="text-xs font-medium mb-1">💡 Suggestion:</p>
                      <p className="text-xs">
                        {error.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t text-xs text-slate-500">
            <p>💡 These are DFA design issues. The validation panel shows missing requirements.</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}