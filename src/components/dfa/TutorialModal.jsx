import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Circle, PlayCircle, CheckCircle, Play, Lightbulb } from 'lucide-react';

const tutorialSteps = [
  {
    title: 'Welcome to the DFA Visualizer!',
    content: "This tutorial will teach you to create and simulate Deterministic Finite Automata (DFA). You can follow along with theory or try our interactive demo!",
    showDemo: true,
  },
  {
    title: 'Step 1: Add States',
    content: "Use the toolbar on the left to add states. Drag and drop state types directly onto the canvas.",
    visual: (
      <div className="flex items-center gap-4 p-4 bg-slate-100 rounded-lg">
        <PlayCircle className="w-10 h-10 text-amber-500" />
        <ArrowRight className="w-6 h-6 text-slate-400" />
        <CheckCircle className="w-10 h-10 text-green-500" />
        <ArrowRight className="w-6 h-6 text-slate-400" />
        <Circle className="w-10 h-10 text-slate-500" />
      </div>
    ),
  },
  {
    title: 'Step 2: Add Transitions',
    content: "Click the 'Add Transition' button (the arrow icon) in the toolbar. Then, click on the source state, followed by the destination state. You'll be prompted to enter the transition symbol.",
  },
  {
    title: 'Step 3: Define Your Machine',
    content: "In the Control Panel on the right, define the DFA's alphabet (e.g., 'a', 'b') and enter a string you want to test against your machine.",
  },
  {
    title: 'Step 4: Run the Simulation',
    content: "Click the 'Start' button to watch your DFA process the string step-by-step. The result will appear at the bottom once the simulation is complete.",
  },
  {
    title: 'You are all set!',
    content: "You now know the basics of the DFA Visualizer. Feel free to explore, create complex machines, and test different strings. Happy visualizing!",
  },
];

const demoSteps = [
  {
    title: 'Demo: Building a Simple DFA',
    content: 'Let\'s create a DFA that accepts strings ending with "ab". This is perfect for beginners!',
    instruction: 'Click "Start Demo" to begin the guided creation process.',
    showStartDemo: true,
  },
  {
    title: 'Demo Step 1: Add Start State',
    content: 'First, we need a start state. This is where our DFA begins processing input.',
    instruction: 'We\'ll add a start state called q0. This represents the initial state of our machine.',
    visual: (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <PlayCircle className="w-8 h-8 text-amber-600" />
          <span className="font-mono text-lg">q0</span>
          <span className="text-sm text-amber-700">(Start State)</span>
        </div>
        <p className="text-sm text-amber-600">The arrow pointing to q0 indicates this is where we start.</p>
      </div>
    ),
  },
  {
    title: 'Demo Step 2: Add Second State',
    content: 'Now we need a state to handle when we\'ve seen the letter "a".',
    instruction: 'Add a normal state q1. This will remember that we\'ve just read an "a".',
    visual: (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-8 h-8 text-amber-600" />
            <span className="font-mono">q0</span>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-400" />
          <div className="flex items-center gap-2">
            <Circle className="w-8 h-8 text-slate-600" />
            <span className="font-mono">q1</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Demo Step 3: Add Accept State',
    content: 'We need an accept state for when we\'ve seen "ab" at the end of our string.',
    instruction: 'Add an accept state q2. This is where we end up when the string ends with "ab".',
    visual: (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-amber-600" />
            <span className="font-mono text-sm">q0</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-6 h-6 text-slate-600" />
            <span className="font-mono text-sm">q1</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="font-mono">q2</span>
            <span className="text-sm text-green-700">(Accept)</span>
          </div>
        </div>
        <p className="text-sm text-green-600 mt-2">The double circle indicates this is an accept state.</p>
      </div>
    ),
  },
  {
    title: 'Demo Step 4: Add Transitions',
    content: 'Now let\'s connect our states with transitions. We need to define what happens on each input symbol.',
    instruction: 'We\'ll add transitions for our alphabet {a, b}:',
    visual: (
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="font-mono text-sm">q0 --a--&gt; q1</p>
          <p className="text-xs text-blue-600">From start, on 'a', go to q1</p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="font-mono text-sm">q1 --b--&gt; q2</p>
          <p className="text-xs text-blue-600">From q1, on 'b', go to accept state</p>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded">
          <p className="font-mono text-sm">q0 --b--&gt; q0, q1 --a--&gt; q1, q2 --a,b--&gt; q0</p>
          <p className="text-xs text-slate-600">Other transitions (try to figure these out!)</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Demo Step 5: Test the DFA',
    content: 'Let\'s test our DFA with some example strings to see if it works correctly.',
    instruction: 'Try these test strings and predict the results:',
    visual: (
      <div className="space-y-2">
        <div className="p-2 bg-green-50 border border-green-200 rounded">
          <span className="font-mono">"ab"</span> → <span className="text-green-600">✓ Accept</span>
          <p className="text-xs text-green-600">Ends with "ab"</p>
        </div>
        <div className="p-2 bg-green-50 border border-green-200 rounded">
          <span className="font-mono">"aab"</span> → <span className="text-green-600">✓ Accept</span>
          <p className="text-xs text-green-600">Ends with "ab"</p>
        </div>
        <div className="p-2 bg-red-50 border border-red-200 rounded">
          <span className="font-mono">"ba"</span> → <span className="text-red-600">✗ Reject</span>
          <p className="text-xs text-red-600">Ends with "a", not "ab"</p>
        </div>
        <div className="p-2 bg-red-50 border border-red-200 rounded">
          <span className="font-mono">"abb"</span> → <span className="text-red-600">✗ Reject</span>
          <p className="text-xs text-red-600">Ends with "b", not "ab"</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Demo Complete!',
    content: 'Congratulations! You\'ve learned how to design a DFA step by step.',
    instruction: 'Key takeaways from this demo:',
    visual: (
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 rounded">
          <h4 className="font-semibold text-blue-800">🎯 Design Process</h4>
          <p className="text-sm text-blue-700">Think about what the machine needs to "remember" about the input it has seen so far.</p>
        </div>
        <div className="p-3 bg-green-50 rounded">
          <h4 className="font-semibold text-green-800">🔄 State Meaning</h4>
          <p className="text-sm text-green-700">Each state represents a different "memory" or condition of the input processed so far.</p>
        </div>
        <div className="p-3 bg-purple-50 rounded">
          <h4 className="font-semibold text-purple-800">🧪 Testing</h4>
          <p className="text-sm text-purple-700">Always test your DFA with various strings to ensure it works correctly.</p>
        </div>
      </div>
    ),
    showTryNow: true,
  },
];

export default function TutorialModal({ open, onOpenChange, onStartDemo }) {
  const [step, setStep] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const goToNext = () => {
    if (isDemoMode) {
      setDemoStep(prev => Math.min(prev + 1, demoSteps.length - 1));
    } else {
      setStep(prev => Math.min(prev + 1, tutorialSteps.length - 1));
    }
  };

  const goToPrev = () => {
    if (isDemoMode) {
      setDemoStep(prev => Math.max(prev - 1, 0));
    } else {
      setStep(prev => Math.max(prev - 1, 0));
    }
  };

  const startDemo = () => {
    setIsDemoMode(true);
    setDemoStep(0);
  };

  const backToTutorial = () => {
    setIsDemoMode(false);
    setStep(0);
  };

  const handleTryNow = () => {
    onOpenChange(false);
    if (onStartDemo) {
      onStartDemo();
    }
  };

  const currentSteps = isDemoMode ? demoSteps : tutorialSteps;
  const currentStep = isDemoMode ? demoStep : step;
  const currentData = currentSteps[currentStep];

  const resetOnClose = (isOpen) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setStep(0);
        setDemoStep(0);
        setIsDemoMode(false);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetOnClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            {isDemoMode && <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />}
            {currentData.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            {currentData.content}
          </p>
          
          {currentData.instruction && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Instructions:</p>
              <p className="text-xs sm:text-sm text-blue-700">{currentData.instruction}</p>
            </div>
          )}
          
          {currentData.visual && (
            <div className="mt-4 flex justify-center overflow-x-auto">
              <div className="min-w-fit">
                {currentData.visual}
              </div>
            </div>
          )}

          {currentData.showStartDemo && (
            <div className="flex justify-center">
              <Button onClick={startDemo} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Play className="w-4 h-4 mr-2" />
                Start Interactive Demo
              </Button>
            </div>
          )}

          {currentData.showTryNow && (
            <div className="flex justify-center">
              <Button onClick={handleTryNow} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Play className="w-4 h-4 mr-2" />
                Try Building This DFA Now!
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t flex flex-col sm:flex-row justify-between w-full gap-2">
          <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            {isDemoMode ? 'Demo ' : ''}Step {currentStep + 1} of {currentSteps.length}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {isDemoMode && (
              <Button variant="outline" onClick={backToTutorial} className="w-full sm:w-auto">
                Back to Tutorial
              </Button>
            )}
            {currentStep > 0 && (
              <Button variant="outline" onClick={goToPrev} className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            {currentStep < currentSteps.length - 1 ? (
              <Button onClick={goToNext} className="w-full sm:w-auto">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <DialogClose asChild>
                <Button className="w-full sm:w-auto">Finish</Button>
              </DialogClose>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}