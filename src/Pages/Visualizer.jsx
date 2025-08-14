
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DFA } from '../entities/DFA';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Save, HelpCircle, FileText, GitMerge, GitPullRequest, BookOpen, Code, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import DFACanvas from '../components/dfa/DFACanvas';
import ControlPanel from '../components/dfa/ControlPanel';
import TutorialModal from '../components/dfa/TutorialModal';
import GrammarModal from '../components/dfa/GrammarModal';
import ProductionRulesModal from '../components/dfa/ProductionRulesModal';
import InteractiveDemoModal from '../components/dfa/InteractiveDemoModal'; // Added import
//import SmartErrorButton from '../components/dfa/SmartErrorButton'; 
import { useLocation } from 'react-router-dom';
import SmartErrorConsole from '../components/dfa/SmartErrorConsole';


export default function Visualizer() {
  const [dfaName, setDfaName] = useState('Untitled DFA');
  const [states, setStates] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [alphabet, setAlphabet] = useState(['a', 'b']);
  const [testString, setTestString] = useState('');
  const [currentState, setCurrentState] = useState(null);
  const [simulationState, setSimulationState] = useState({
    isRunning: false,
    currentStep: 0,
    path: [],
    status: null
  });
  const [validationErrors, setValidationErrors] = useState([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isGrammarOpen, setIsGrammarOpen] = useState(false);
  const [isProductionRulesOpen, setIsProductionRulesOpen] = useState(false);
  const [isInteractiveDemoOpen, setIsInteractiveDemoOpen] = useState(false); // Added state
  const [splitMode, setSplitMode] = useState(false);
  const [transitionCurvatures, setTransitionCurvatures] = useState({});
  const [highlightedElement, setHighlightedElement] = useState(null); // Added state
  const location = useLocation();
  const canvasApiRef = useRef(null);
  

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Check for tutorial or demo mode from URL
    if (params.has('tutorial')) {
      setIsTutorialOpen(true);
    } else if (params.has('demo')) {
      setIsInteractiveDemoOpen(true);
    }
    
    // Check for first visit if no URL parameters are present
    const hasVisited = localStorage.getItem('dfa-visualizer-visited');
    if (!hasVisited && !params.has('tutorial') && !params.has('demo')) {
      setIsTutorialOpen(true);
      localStorage.setItem('dfa-visualizer-visited', 'true');
    }
  }, [location.search]); // Added location.search as dependency

  // Load DFA from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dfaId = params.get('dfa_id');
    if (dfaId) {
      const loadDfa = async () => {
        try {
          toast.info('Loading DFA...');
          const savedDfa = await DFA.get(dfaId);
          setDfaName(savedDfa.name);
          setStates(savedDfa.states || []);
          setTransitions(savedDfa.transitions || []);
          setAlphabet(savedDfa.alphabet || ['a', 'b']);
          setTransitionCurvatures(savedDfa.curvatures || {});
          toast.success(`Loaded DFA: ${savedDfa.name}`);
          setTimeout(() => canvasApiRef.current?.centerView(), 100);
        } catch (error) {
          toast.error("Failed to load DFA.");
          console.error("Load error:", error);
        }
      };
      loadDfa();
    }
  }, [location.search]);

  // Validation
  const validateDFA = useCallback(() => {
    const errors = [];
    
    if (states.length === 0) {
      errors.push('DFA must have at least one state');
      setValidationErrors(errors);
      return false;
    }

    const startStates = states.filter(s => s.type === 'start' || s.type === 'start-accept');
    if (startStates.length === 0) {
      errors.push('DFA must have exactly one start state');
    } else if (startStates.length > 1) {
      errors.push('DFA can have only one start state');
    }

    const acceptStates = states.filter(s => s.type === 'accept' || s.type === 'start-accept');
    if (acceptStates.length === 0) {
      errors.push('DFA should have at least one accept state');
    }

    for (const state of states) {
      for (const symbol of alphabet) {
        const hasTransition = transitions.some(t => t.from === state.id && t.symbol === symbol);
        if (!hasTransition) {
          errors.push(`State ${state.label} missing transition for symbol '${symbol}'`);
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [states, transitions, alphabet]);

  useEffect(() => {
    validateDFA();
  }, [validateDFA]);

  // State management
  const handleStateAdd = useCallback((newState) => {
    setStates(prev => [...prev, newState]);
  }, []);

  const handleStateUpdate = useCallback((stateId, updatedState) => {
    setStates(prev => prev.map(s => s.id === stateId ? updatedState : s));
  }, []);

  const handleStateDelete = useCallback((stateId) => {
    setStates(prev => prev.filter(s => s.id !== stateId));
    setTransitions(prev => prev.filter(t => t.from !== stateId && t.to !== stateId));
  }, []);

  // Transition management
  const handleTransitionAdd = useCallback((newTransition) => {
    setTransitions(prev => [...prev, { ...newTransition, id: `transition-${Date.now()}` }]);
  }, []);

  const handleTransitionUpdate = useCallback((oldTransition, updatedTransition) => {
    setTransitions(prev => prev.map(t => 
      t.id === oldTransition.id ? { ...updatedTransition, id: oldTransition.id } : t
    ));
  }, []);

  const handleTransitionDelete = useCallback((transitionToDelete) => {
    setTransitions(prev => prev.filter(t => t.id !== transitionToDelete.id));
  }, []);

  const handleTransitionCurveUpdate = useCallback((transition, newCurvature) => {
    const transitionKey = `${transition.from}-${transition.to}`;
    setTransitionCurvatures(prev => ({
      ...prev,
      [transitionKey]: newCurvature
    }));
  }, []);

  // Simulation logic
  const runSimulation = useCallback(() => {
    if (!validateDFA() || !testString) return;

    const startState = states.find(s => s.type === 'start' || s.type === 'start-accept');
    if (!startState) return;

    let currentStateId = startState.id;
    const path = [startState.label];
    let step = 0;

    const simulateStep = () => {
      if (step >= testString.length) {
        const finalState = states.find(s => s.id === currentStateId);
        const status = (finalState?.type === 'accept' || finalState?.type === 'start-accept') ? 'accepted' : 'rejected';
        
        setSimulationState({
          isRunning: false,
          currentStep: step,
          path,
          status
        });
        setCurrentState(null);
        return;
      }

      const symbol = testString[step];
      const transition = transitions.find(t => t.from === currentStateId && t.symbol === symbol);
      
      if (!transition) {
        setSimulationState({
          isRunning: false,
          currentStep: step,
          path,
          status: 'rejected'
        });
        setCurrentState(null);
        return;
      }

      currentStateId = transition.to;
      const nextState = states.find(s => s.id === currentStateId);
      path.push(nextState.label);
      step++;

      setCurrentState(currentStateId);
      setSimulationState({
        isRunning: true,
        currentStep: step,
        path: [...path],
        status: null
      });

      setTimeout(simulateStep, 1000);
    };

    setCurrentState(startState.id);
    setSimulationState({
      isRunning: true,
      currentStep: 0,
      path: [startState.label],
      status: null
    });

    setTimeout(simulateStep, 1000);
  }, [states, transitions, testString, validateDFA]);

  const handleStepForward = useCallback(() => {
    // Implementation for manual step forward
  }, []);

  const handleStepBack = useCallback(() => {
    // Implementation for manual step back
  }, []);

  const handleReset = useCallback(() => {
    setSimulationState({
      isRunning: false,
      currentStep: 0,
      path: [],
      status: null
    });
    setCurrentState(null);
  }, []);

  const handleGenerateDFAFromGrammar = (dfaData) => {
    setDfaName(dfaData.name);
    setStates(dfaData.states);
    setTransitions(dfaData.transitions);
    setAlphabet(dfaData.alphabet);
    setTransitionCurvatures({}); // Clear curvatures for new DFA
    toast.success('DFA generated from production rules!');
    setTimeout(() => canvasApiRef.current?.centerView(), 100);
  };

  // Save DFA
  const handleSave = async () => {
    try {
      const dfaData = {
        name: dfaName,
        states,
        transitions,
        alphabet,
        description: `DFA with ${states.length} states over alphabet {${alphabet.join(', ')}}`,
        curvatures: transitionCurvatures,
      };
      
      await DFA.create(dfaData);
      toast.success('DFA saved successfully!');
    } catch (error) {
      toast.error('Failed to save DFA');
      console.error('Save error:', error);
    }
  };

  // Add demo creation function (kept as outline did not remove it)
  const createDemoExample = () => {
    // Clear existing states and transitions
    setStates([]);
    setTransitions([]);
    setTransitionCurvatures({}); // Clear curvatures for new demo

    // Create the demo states
    const demoStates = [
      { id: 'q0', label: 'q0', type: 'start', x: 200, y: 200 },
      { id: 'q1', label: 'q1', type: 'normal', x: 400, y: 200 },
      { id: 'q2', label: 'q2', type: 'accept', x: 600, y: 200 }
    ];
    
    // Create the demo transitions
    const demoTransitions = [
      { id: 't1', from: 'q0', to: 'q1', symbol: 'a' },
      { id: 't2', from: 'q1', to: 'q2', symbol: 'b' },
      { id: 't3', from: 'q0', to: 'q0', symbol: 'b' },
      { id: 't4', from: 'q1', to: 'q1', symbol: 'a' },
      { id: 't5', from: 'q2', to: 'q0', symbol: 'a' },
      { id: 't6', from: 'q2', to: 'q0', symbol: 'b' }
    ];
    
    setStates(demoStates);
    setTransitions(demoTransitions);
    setAlphabet(['a', 'b']);
    setDfaName('Demo: Strings Ending with "ab"');
    setTestString('aab');
    
    toast.success('Demo DFA created! Try testing with "aab", "ab", "ba", or "abb"');
    setTimeout(() => canvasApiRef.current?.centerView(), 100);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <TutorialModal 
        open={isTutorialOpen} 
        onOpenChange={setIsTutorialOpen}
      />
      <GrammarModal 
        open={isGrammarOpen} 
        onOpenChange={setIsGrammarOpen}
        states={states}
        transitions={transitions}
        alphabet={alphabet}
      />
      <ProductionRulesModal
        open={isProductionRulesOpen}
        onOpenChange={setIsProductionRulesOpen}
        onGenerateDFA={handleGenerateDFAFromGrammar}
      />
      <InteractiveDemoModal
        open={isInteractiveDemoOpen}
        onOpenChange={setIsInteractiveDemoOpen}
        onHighlight={setHighlightedElement}
        // Pass state setters and canvas API ref for the demo to manipulate the DFA
        setDfaName={setDfaName}
        setStates={setStates}
        setTransitions={setTransitions}
        setAlphabet={setAlphabet}
        setTestString={setTestString}
        setTransitionCurvatures={setTransitionCurvatures}
        canvasApiRef={canvasApiRef}
      />
      
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-slate-600" />
              <Input
                value={dfaName}
                onChange={(e) => setDfaName(e.target.value)}
                className="text-lg font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsInteractiveDemoOpen(true)}
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
            >
              <Sparkles className="w-4 h-4" />
              Interactive Demo
            </Button>
             <Button
              variant="outline"
              onClick={() => setIsTutorialOpen(true)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Tutorial
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsProductionRulesOpen(true)}
              className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
            >
              <Code className="w-4 h-4" />
              From Grammar
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsGrammarOpen(true)}
              disabled={states.length === 0 || transitions.length === 0}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Generate Grammar
            </Button>
            
            {splitMode ? (
              <Button onClick={() => setSplitMode(false)} variant="outline">
                <GitMerge className="w-4 h-4 mr-2" />
                Merge Transitions
              </Button>
            ) : (
              <Button onClick={() => setSplitMode(true)} variant="outline">
                <GitPullRequest className="w-4 h-4 mr-2" />
                Split Transitions
              </Button>
            )}

            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={states.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save DFA
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          <DFACanvas
            ref={canvasApiRef}
            states={states}
            transitions={transitions}
            onStateAdd={handleStateAdd}
            onStateUpdate={handleStateUpdate}
            onStateDelete={handleStateDelete}
            onTransitionAdd={handleTransitionAdd}
            onTransitionUpdate={handleTransitionUpdate}
            onTransitionDelete={handleTransitionDelete}
            onTransitionCurveUpdate={handleTransitionCurveUpdate}
            currentState={currentState}
            simulationMode={simulationState.isRunning || currentState}
            splitMode={splitMode}
            transitionCurvatures={transitionCurvatures}
            highlightedElement={highlightedElement}
          />
        </div>

        <ControlPanel
          alphabet={alphabet}
          onAlphabetChange={setAlphabet}
          testString={testString}
          onTestStringChange={setTestString}
          onSimulate={runSimulation}
          onStepForward={handleStepForward}
          onStepBack={handleStepBack}
          onReset={handleReset}
          simulationState={simulationState}
          validationErrors={validationErrors}
          highlightedElement={highlightedElement}
        />
      </div>

      {/* Smart Error Detection Button */}
      <SmartErrorConsole
        states={states} 
        transitions={transitions} 
        alphabet={alphabet} 
        initialOpen={false}
      />
    </div>
  );
}
