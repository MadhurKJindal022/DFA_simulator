import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, PlayCircle, CheckCircle, Circle, Sparkles, Target, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const demoSteps = [
  {
    title: 'Welcome to Interactive Demo!',
    content: 'Let\'s build a DFA step by step that recognizes strings ending with "ab".',
    instruction: 'I\'ll guide you through each step. Follow the highlighted actions on the visualizer.',
    highlight: null,
  },
  {
    title: 'Step 1: Add Start State',
    content: 'First, we need a start state where our DFA begins.',
    instruction: 'Look at the toolbar on the left. Drag the START STATE (yellow circle with play icon) onto the canvas.',
    highlight: 'start-state',
    visual: (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
        <PlayCircle className="w-8 h-8 text-amber-600" />
        <div>
          <p className="font-semibold text-amber-800">Start State</p>
          <p className="text-sm text-amber-600">Drag this to canvas</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Step 2: Add Normal State',
    content: 'Great! Now we need a second state to remember when we\'ve seen "a".',
    instruction: 'Drag a NORMAL STATE (gray circle) onto the canvas next to your start state.',
    highlight: 'normal-state',
    visual: (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
        <Circle className="w-8 h-8 text-slate-600" />
        <div>
          <p className="font-semibold text-slate-700">Normal State</p>
          <p className="text-sm text-slate-600">Drag this to canvas</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Step 3: Add Accept State',
    content: 'Perfect! Now we need an accept state for strings ending with "ab".',
    instruction: 'Drag an ACCEPT STATE (green double circle) onto the canvas.',
    highlight: 'accept-state',
    visual: (
      <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
        <CheckCircle className="w-8 h-8 text-green-600" />
        <div>
          <p className="font-semibold text-green-700">Accept State</p>
          <p className="text-sm text-green-600">Drag this to canvas</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Step 4: Connect States with Transitions',
    content: 'Excellent! Now let\'s add transitions between states.',
    instruction: 'Click the ARROW button in the toolbar, then click your start state, then click the second state. Enter "a" when prompted.',
    highlight: 'transition-tool',
    visual: (
      <div className="space-y-2">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-800">1. Click arrow button in toolbar</p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-800">2. Click start state (q0)</p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-800">3. Click second state (q1)</p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-800">4. Type "a" in the popup</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Step 5: Add More Transitions',
    content: 'Good! Now add a transition from the second state to the accept state.',
    instruction: 'With the arrow tool still active, click your second state, then the accept state. Enter "b".',
    highlight: 'transition-tool',
    visual: (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="font-mono text-sm">q1 --b--{">"} q2</p>
        <p className="text-xs text-blue-600">From second state on "b" go to accept state</p>
      </div>
    ),
  },
  {
    title: 'Step 6: Complete the DFA',
    content: 'Almost done! We need to handle all input symbols from every state.',
    instruction: 'Add the remaining transitions:\n• q0 --b--> q0 (stay in start on "b")\n• q1 --a--> q1 (stay in q1 on "a")\n• q2 --a,b--> q0 (reset from accept)',
    highlight: 'transition-tool',
    visual: (
      <div className="space-y-2">
        <div className="p-2 bg-slate-50 border border-slate-200 rounded">
          <p className="font-mono text-xs">q0 --b--{">"} q0</p>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded">
          <p className="font-mono text-xs">q1 --a--{">"} q1</p>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded">
          <p className="font-mono text-xs">q2 --a--{">"} q0</p>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded">
          <p className="font-mono text-xs">q2 --b--{">"} q0</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Step 7: Test Your DFA',
    content: 'Fantastic! Your DFA is complete. Now let\'s test it.',
    instruction: 'In the Control Panel on the right:\n1. Make sure alphabet shows {a, b}\n2. Enter "aab" in the test string\n3. Click Start to see the simulation!',
    highlight: 'control-panel',
    visual: (
      <div className="space-y-3">
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="font-mono text-sm">"aab" → Accept ✓</p>
          <p className="text-xs text-green-600">Should end in accept state</p>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="font-mono text-sm">"ab" → Accept ✓</p>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="font-mono text-sm">"ba" → Reject ✗</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Congratulations! 🎉',
    content: 'You\'ve successfully built your first DFA that recognizes strings ending with "ab"!',
    instruction: 'Try testing different strings like "ab", "ba", "aab", "abb" to see how your DFA behaves.',
    highlight: null,
    visual: (
      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="text-4xl mb-4">🎉</div>
        <p className="font-semibold text-lg text-slate-800 mb-2">Demo Complete!</p>
        <p className="text-sm text-slate-600">You now know how to build DFAs step by step.</p>
      </div>
    ),
  },
];

export default function InteractiveDemoModal({ open, onOpenChange, onHighlight }) {
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepData = demoSteps[currentStep];

  useEffect(() => {
    if (open && onHighlight && currentStepData.highlight) {
      onHighlight(currentStepData.highlight);
    } else if (onHighlight) {
      onHighlight(null);
    }
  }, [currentStep, open, onHighlight, currentStepData.highlight]);

  const goToNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, demoSteps.length - 1));
  };

  const goToPrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const resetAndClose = () => {
    setCurrentStep(0);
    onOpenChange(false);
    if (onHighlight) onHighlight(null);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            {currentStepData.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {currentStepData.content}
            </p>
            
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <h4 className="font-semibold text-blue-800 mb-2">What to do:</h4>
              <div className="text-sm text-blue-700 whitespace-pre-line">
                {currentStepData.instruction}
              </div>
            </div>
            
            {currentStepData.visual && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-700 mb-3">Visual Guide:</h4>
                {currentStepData.visual}
              </div>
            )}
          </motion.div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t flex flex-col sm:flex-row justify-between w-full gap-2">
          <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            Step {currentStep + 1} of {demoSteps.length}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={goToPrev} className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            {currentStep < demoSteps.length - 1 ? (
              <Button onClick={goToNext} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={resetAndClose} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Finish Demo
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}