import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Code, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export default function ProductionRulesModal({ 
  open, 
  onOpenChange, 
  onGenerateDFA 
}) {
  const [startSymbol, setStartSymbol] = useState('S');
  const [productionRules, setProductionRules] = useState('S → aS | bS | a | b | ε');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  const insertSymbol = (symbol) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const newText = text.substring(0, start) + symbol + text.substring(end);
    setProductionRules(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
    }, 0);
  };

  const parseProductionRules = () => {
    try {
      const lines = productionRules.split('\n').filter(line => line.trim());
      const productions = new Map();
      const nonTerminals = new Set();
      const terminals = new Set();

      for (const line of lines) {
        const separatorIndex = line.includes('→') ? line.indexOf('→') : line.indexOf('->');
        if (separatorIndex === -1) {
            throw new Error(`Invalid production rule format: "${line}". Use '→' or '->'`);
        }
        const left = line.substring(0, separatorIndex).trim();
        const right = line.substring(separatorIndex + (line.includes('→') ? 1 : 2)).trim();

        if (!left || !right) {
          throw new Error(`Invalid production rule: ${line}`);
        }

        nonTerminals.add(left);
        const rightSides = right.split('|').map(s => s.trim());
        
        if (!productions.has(left)) {
          productions.set(left, []);
        }
        
        for (const rightSide of rightSides) {
          if (rightSide === 'ε') {
            productions.get(left).push('ε');
          } else {
            for (let i = 0; i < rightSide.length; i++) {
              const char = rightSide[i];
              if (char >= 'A' && char <= 'Z') {
                nonTerminals.add(char);
              } else if (char !== ' ') {
                terminals.add(char);
              }
            }
            productions.get(left).push(rightSide);
          }
        }
      }

      if (!nonTerminals.has(startSymbol)) {
        throw new Error(`Start symbol "${startSymbol}" is not defined as a non-terminal in your rules.`);
      }

      return {
        productions,
        nonTerminals: Array.from(nonTerminals),
        terminals: Array.from(terminals),
        startSymbol
      };
    } catch (err) {
      throw new Error(`Parse error: ${err.message}`);
    }
  };

  const convertToDFA = () => {
    try {
      setError('');
      const grammar = parseProductionRules();
      
      const states = [];
      const transitions = [];
      const statePositions = {};
      
      grammar.nonTerminals.forEach((nonTerminal, index) => {
        const x = 200 + index * 200;
        const y = 200;
        statePositions[nonTerminal] = { x, y };
        
        const isStart = nonTerminal === grammar.startSymbol;
        const hasEpsilon = grammar.productions.get(nonTerminal)?.includes('ε');
        
        let stateType = 'normal';
        if (isStart && hasEpsilon) {
          stateType = 'start-accept';
        } else if (isStart) {
          stateType = 'start';
        } else if (hasEpsilon) {
          stateType = 'accept';
        }
        
        states.push({
          id: nonTerminal,
          label: nonTerminal,
          type: stateType,
          x,
          y
        });
      });

      let finalStateId = 'qf';
      let finalStateAdded = false;
      const requiresFinalState = Array.from(grammar.productions.values()).some(rules => 
        rules.some(rule => rule !== 'ε' && rule.length === 1 && grammar.terminals.includes(rule))
      );

      if (requiresFinalState) {
        states.push({
          id: finalStateId,
          label: finalStateId,
          type: 'accept',
          x: 200 + grammar.nonTerminals.length * 200 + 100,
          y: 200
        });
        finalStateAdded = true;
      }

      let transitionId = 0;
      grammar.productions.forEach((rules, fromState) => {
        rules.forEach(rule => {
          if (rule === 'ε') return;
          
          if (rule.length === 1 && grammar.terminals.includes(rule)) {
            if (finalStateAdded) {
                transitions.push({
                    id: `t${transitionId++}`,
                    from: fromState,
                    to: finalStateId,
                    symbol: rule
                });
            }
          } else if (rule.length === 2 && 
                     grammar.terminals.includes(rule[0]) && 
                     grammar.nonTerminals.includes(rule[1])) {
            transitions.push({
              id: `t${transitionId++}`,
              from: fromState,
              to: rule[1],
              symbol: rule[0]
            });
          } else {
            setError(`Unsupported rule format for DFA conversion: ${fromState} → ${rule}. Only A → a or A → aB are supported for right-linear grammars.`);
            throw new Error(`Unsupported rule format: ${fromState} → ${rule}`);
          }
        });
      });

      const reachableStates = new Set();
      const queue = [grammar.startSymbol];
      reachableStates.add(grammar.startSymbol);

      while (queue.length > 0) {
          const currentState = queue.shift();
          transitions.forEach(t => {
              if (t.from === currentState && !reachableStates.has(t.to)) {
                  reachableStates.add(t.to);
                  queue.push(t.to);
              }
          });
      }

      if (finalStateAdded && transitions.some(t => t.to === finalStateId)) {
        reachableStates.add(finalStateId);
      }

      const finalStates = states.filter(s => reachableStates.has(s.id));
      const finalTransitions = transitions.filter(t => reachableStates.has(t.from) && reachableStates.has(t.to));

      if (finalStates.length === 0) {
        setError('No states could be generated. Check your production rules and start symbol.');
        return;
      }

      const dfaData = {
        name: `DFA from Grammar (Start: ${grammar.startSymbol})`,
        states: finalStates,
        transitions: finalTransitions,
        alphabet: grammar.terminals.sort(),
        description: `Generated from production rules with start symbol ${grammar.startSymbol}. Only right-linear grammars are fully supported.`,
        isDFA: true
      };

      onGenerateDFA(dfaData);
      onOpenChange(false);

    } catch (err) {
      setError(err.message);
    }
  };

  const loadExample = () => {
    setStartSymbol('S');
    setProductionRules(`S → aS | bS | a | b | ε`);
  };

  const loadAdvancedExample = () => {
    setStartSymbol('S');
    setProductionRules(`S → aA | bB
A → aS | bC | b
B → bS | aC | a
C → aC | bC | ε`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Code className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            Generate DFA from Production Rules
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="start-symbol" className="text-sm font-medium">
              Start Symbol
            </Label>
            <Input
              id="start-symbol"
              value={startSymbol}
              onChange={(e) => setStartSymbol(e.target.value)}
              placeholder="S"
              className="mt-1 font-mono"
            />
          </div>

          <div>
            <Label htmlFor="production-rules" className="text-sm font-medium">
              Production Rules
            </Label>
            <div className="flex flex-wrap items-center gap-2 mt-1">
                <Button variant="outline" size="sm" onClick={() => insertSymbol('→')}>
                  <span className="hidden sm:inline">→ arrow</span>
                  <span className="sm:hidden">→</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => insertSymbol('ε')}>
                  <span className="hidden sm:inline">ε epsilon</span>
                  <span className="sm:hidden">ε</span>
                </Button>
            </div>
            <Textarea
              ref={textareaRef}
              id="production-rules"
              value={productionRules}
              onChange={(e) => setProductionRules(e.target.value)}
              placeholder="Enter production rules, one per line..."
              className="mt-1 h-32 sm:h-40 font-mono text-sm resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Format: A → aB | bC | ε (use → or {"->"}, separate alternatives with |)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Quick Examples:</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={loadExample} variant="outline" size="sm" className="flex-1">
                Simple Grammar
              </Button>
              <Button onClick={loadAdvancedExample} variant="outline" size="sm" className="flex-1">
                Advanced Grammar
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-2 text-sm sm:text-base">Guidelines:</h4>
            <ul className="text-xs sm:text-sm text-amber-700 space-y-1">
              <li>• Use right-linear grammars (A → aB or A → a)</li>
              <li>• Non-terminals should be uppercase (A, B, S)</li>
              <li>• Terminals should be lowercase (a, b, 0, 1)</li>
              <li>• Use ε for empty string</li>
              <li>• Separate alternatives with | symbol</li>
              <li>• Use → or {"->"} for production arrow</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={convertToDFA} className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Generate DFA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
