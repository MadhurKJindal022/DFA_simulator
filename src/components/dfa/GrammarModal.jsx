import React, { useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Copy, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function GrammarModal({ open, onOpenChange, states, transitions, alphabet }) {
  
  // Generate grammar only when dependencies change
  const { productions, explanation } = useMemo(() => {
    if (!states?.length) {
      return { productions: new Map(), explanation: 'No states defined.' };
    }

    const startState = states.find(s => s.type === 'start' || s.type === 'start-accept');
    if (!startState) {
      return { productions: new Map(), explanation: 'No start state defined.' };
    }

    const acceptStates = states.filter(s => s.type === 'accept' || s.type === 'start-accept');

    // Build lookup map for faster access
    const stateMap = new Map(states.map(s => [s.id, s.label]));

    // Initialize productions map
    const productionsMap = new Map(states.map(s => [s.label, []]));

    // Process transitions
    for (const { from, to, symbol } of transitions) {
      const fromLabel = stateMap.get(from);
      const toLabel = stateMap.get(to);
      if (fromLabel && toLabel) {
        productionsMap.get(fromLabel)?.push(`${symbol}${toLabel}`);
      }
    }

    // Add epsilon productions for accept states
    for (const state of acceptStates) {
      productionsMap.get(state.label)?.push('ε');
    }

    // Remove empty productions
    for (const [key, value] of productionsMap.entries()) {
      if (!value.length) {
        productionsMap.delete(key);
      }
    }

    const nonTerminals = states.map(s => s.label);
    const explanationText =
      `This Regular Grammar is derived from your DFA:\n` +
      `• Start Symbol: ${startState.label}\n` +
      `• Non-terminals (V): {${nonTerminals.join(', ')}}\n` +
      `• Terminals (Σ): {${alphabet.join(', ')}}\n` +
      `• Productions (P) are shown in the table.`;

    return { productions: productionsMap, explanation: explanationText };
  }, [states, transitions, alphabet]);

  // Safe copy function
  const copyGrammar = useCallback(async () => {
    try {
      let grammarText = '';
      productions.forEach((rules, nonTerminal) => {
        grammarText += `${nonTerminal} → ${rules.join(' | ')}\n`;
      });

      await navigator.clipboard.writeText(grammarText.trim());
      toast.success('Productions copied to clipboard!');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      toast.error('Failed to copy productions. Your browser may block this on non-HTTPS.');
    }
  }, [productions]);

  // Close handler ensures parent state updates
  const handleClose = useCallback(() => {
    if (typeof onOpenChange === 'function') {
      onOpenChange(false);
    }
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Generated Regular Grammar
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 sm:space-y-6">
          {productions.size > 0 ? (
            <>
              <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border">
                <h3 className="font-semibold mb-3 text-slate-800 text-sm sm:text-base">
                  Production Rules (P)
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px] sm:w-[200px] text-xs sm:text-sm">
                          State (Non-terminal)
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm">Productions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(productions.entries()).map(([nonTerminal, rules]) => (
                        <TableRow key={nonTerminal}>
                          <TableCell className="font-medium font-mono text-xs sm:text-sm">
                            {nonTerminal}
                          </TableCell>
                          <TableCell className="font-mono text-xs sm:text-sm break-all">
                            {rules.join(' | ')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <h3 className="font-semibold mb-2 text-blue-800 text-sm sm:text-base">
                  Explanation
                </h3>
                <pre className="text-xs sm:text-sm text-blue-700 whitespace-pre-wrap font-sans">
                  {explanation}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-center py-6 sm:py-8 text-slate-500">
              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">
                No grammar can be generated. Please ensure your DFA has:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs sm:text-sm">
                <li>At least one start state</li>
                <li>At least one transition</li>
                <li>Properly defined states</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Close
          </Button>
          {productions.size > 0 && (
            <Button onClick={copyGrammar} className="w-full sm:w-auto">
              <Copy className="w-4 h-4 mr-2" />
              Copy Productions
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
