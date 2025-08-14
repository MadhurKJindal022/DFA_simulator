import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { 
  Play, Pause, Square, SkipForward, SkipBack, Plus, X, 
  CheckCircle, XCircle, AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ControlPanel Component
 * 
 * Props:
 * - alphabet: array of allowed symbols
 * - onAlphabetChange: function to update alphabet
 * - testString: DFA input string
 * - onTestStringChange: function to update testString
 * - onSimulate: start/pause simulation
 * - onStepForward / onStepBack: manual step controls
 * - onReset: reset simulation
 * - simulationState: { status, isRunning, currentStep, path }
 * - validationErrors: list of setup errors
 */
export default function ControlPanel({
  alphabet,
  onAlphabetChange,
  testString,
  onTestStringChange,
  onSimulate,
  onStepForward,
  onStepBack,
  onReset,
  simulationState,
  validationErrors,
}) {
  const [newSymbol, setNewSymbol] = useState("");

  const addSymbol = () => {
    const symbol = newSymbol.trim();
    if (symbol && !alphabet.includes(symbol)) {
      onAlphabetChange([...alphabet, symbol]);
      setNewSymbol("");
    }
  };

  const removeSymbol = (symbol) => {
    onAlphabetChange(alphabet.filter((s) => s !== symbol));
  };

  const getResultIcon = () => {
    switch (simulationState.status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getResultColor = () => {
    switch (simulationState.status) {
      case "accepted":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          Control Panel
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Validation Errors */}
        <AnimatePresence>
          {validationErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Validation Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-amber-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alphabet Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input Alphabet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {alphabet.map((symbol) => (
                <Badge
                  key={symbol}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {symbol}
                  <button
                    onClick={() => removeSymbol(symbol)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add symbol (e.g., a, b, 0, 1)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSymbol()}
                className="flex-1"
              />
              <Button onClick={addSymbol} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test String Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test String</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-string">Input String</Label>
              <Input
                id="test-string"
                placeholder="Enter string (e.g., abba)"
                value={testString}
                onChange={(e) => onTestStringChange(e.target.value)}
                className="font-mono"
              />
            </div>
            {testString && (
              <div className="flex flex-wrap gap-1 p-3 bg-slate-50 rounded-lg">
                {testString.split("").map((char, index) => {
                  const { currentStep } = simulationState;
                  let style = "bg-white text-slate-600 border-slate-300";
                  if (currentStep === index)
                    style = "bg-blue-500 text-white border-blue-500";
                  else if (currentStep > index)
                    style = "bg-green-100 text-green-700 border-green-300";
                  return (
                    <span
                      key={index}
                      className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-mono ${style}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simulation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onSimulate}
                disabled={validationErrors.length > 0 || !testString}
                className="flex items-center gap-2"
              >
                {simulationState.isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start
                  </>
                )}
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" /> Reset
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onStepBack}
                variant="outline"
                size="sm"
                disabled={simulationState.currentStep <= 0}
                className="flex items-center gap-2"
              >
                <SkipBack className="w-4 h-4" /> Step Back
              </Button>
              <Button
                onClick={onStepForward}
                variant="outline"
                size="sm"
                disabled={simulationState.currentStep >= testString.length}
                className="flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4" /> Step Forward
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <AnimatePresence>
          {simulationState.status && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card
                className={`${
                  simulationState.status === "accepted"
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <CardHeader>
                  <CardTitle
                    className={`text-lg flex items-center gap-2 ${getResultColor()}`}
                  >
                    {getResultIcon()} Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div
                      className={`text-lg font-semibold ${getResultColor()}`}
                    >
                      String{" "}
                      {simulationState.status === "accepted"
                        ? "Accepted"
                        : "Rejected"}
                    </div>
                    {simulationState.path && (
                      <div>
                        <Label className="text-sm font-medium text-slate-700">
                          State Path:
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {simulationState.path.map((state, index) => (
                            <span
                              key={index}
                              className="flex items-center gap-1"
                            >
                              <Badge variant="outline" className="text-xs">
                                {state}
                              </Badge>
                              {index < simulationState.path.length - 1 && (
                                <span className="text-slate-400">→</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
