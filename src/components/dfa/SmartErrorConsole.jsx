// components/dfa/SmartErrorConsole.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  AlertTriangle,
  X,
  Terminal,
  ChevronUp,
  ChevronDown,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export default function SmartErrorConsole({
  states,
  transitions,
  alphabet,
  initialOpen = false,
}) {
  const [open, setOpen] = useState(initialOpen);
  const [filter, setFilter] = useState("all");
  const [height, setHeight] = useState(250);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newHeight = Math.max(
        120,
        Math.min(window.innerHeight - 100, window.innerHeight - e.clientY)
      );
      setHeight(newHeight);
    };
    const stopResizing = () => {
      isResizing.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, []);

  const errors = useMemo(() => {
    const detected = [];

    // 1) Non-deterministic transitions
    for (const state of states) {
      for (const symbol of alphabet) {
        const same = transitions.filter(
          (t) => t.from === state.id && t.symbol === symbol
        );
        if (same.length > 1) {
          const targetStates = same.map((t) => {
            const to = states.find((s) => s.id === t.to);
            return to ? to.label : t.to;
          });
          detected.push({
            type: "non-deterministic",
            severity: "error",
            message: `State ${state.label} has multiple transitions for '${symbol}'`,
            details: `Goes to: ${targetStates.join(", ")}. A DFA needs exactly one transition per symbol from each state.`,
            suggestion: `Keep only one transition for '${symbol}' from ${state.label} (or merge target states).`,
            affectedElements: same.map((t) => t.id),
          });
        }
      }
    }

    // 2) Multiple start states
    const startStates = states.filter(
      (s) => s.type === "start" || s.type === "start-accept"
    );
    if (startStates.length > 1) {
      detected.push({
        type: "multiple-start",
        severity: "error",
        message: "Multiple start states detected",
        details: `Found ${startStates.length}: ${startStates
          .map((s) => s.label)
          .join(", ")}. DFA must have exactly one start state.`,
        suggestion: "Change all but one start state to normal/accept.",
        affectedElements: startStates.map((s) => s.id),
      });
    }

    // 3) Unreachable states
    if (states.length > 0) {
      const start = states.find(
        (s) => s.type === "start" || s.type === "start-accept"
      );
      if (start) {
        const reachable = new Set([start.id]);
        const queue = [start.id];
        while (queue.length) {
          const current = queue.shift();
          const outgoing = transitions.filter((t) => t.from === current);
          for (const t of outgoing) {
            if (!reachable.has(t.to)) {
              reachable.add(t.to);
              queue.push(t.to);
            }
          }
        }
        const unreachable = states.filter((s) => !reachable.has(s.id));
        if (unreachable.length > 0) {
          detected.push({
            type: "unreachable-states",
            severity: "warning",
            message: `${unreachable.length} unreachable state(s)`,
            details: `Cannot be reached from the start: ${unreachable
              .map((s) => s.label)
              .join(", ")}.`,
            suggestion:
              "Add transitions to reach these states, or remove them if unused.",
            affectedElements: unreachable.map((s) => s.id),
          });
        }
      }
    }

    // 4) Invalid transitions
    const stateIds = new Set(states.map((s) => s.id));
    const invalidTransitions = transitions.filter(
      (t) => !stateIds.has(t.to) || !stateIds.has(t.from)
    );
    if (invalidTransitions.length > 0) {
      detected.push({
        type: "invalid-transitions",
        severity: "error",
        message: "Transitions referencing deleted/missing states",
        details: "Some transitions have a missing 'from' or 'to' state.",
        suggestion: "Delete or fix those transitions.",
        affectedElements: invalidTransitions.map((t) => t.id),
      });
    }

    // 5) Invalid symbols
    const alphabetSet = new Set(alphabet);
    const invalidSymbolTransitions = transitions.filter(
      (t) => !alphabetSet.has(t.symbol)
    );
    if (invalidSymbolTransitions.length > 0) {
      const invalidSymbols = [
        ...new Set(invalidSymbolTransitions.map((t) => t.symbol)),
      ];
      detected.push({
        type: "invalid-symbols",
        severity: "warning",
        message: "Transitions use symbols not in the alphabet",
        details: `Symbols: ${invalidSymbols.join(", ")} are used but not defined.`,
        suggestion: `Add these to the alphabet or change the transitions.`,
        affectedElements: invalidSymbolTransitions.map((t) => t.id),
      });
    }

    return detected;
  }, [states, transitions, alphabet]);

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;
  const filtered =
    filter === "all" ? errors : errors.filter((e) => e.severity === filter);

  const severityClasses = (severity) =>
    severity === "error"
      ? "text-red-700 bg-red-50 border-red-200"
      : "text-amber-700 bg-amber-50 border-amber-200";

  const iconFor = (severity, cls = "w-4 h-4") =>
    severity === "error" ? (
      <X className={cls} />
    ) : (
      <AlertTriangle className={cls} />
    );

  const copyAll = () => {
    if (errors.length === 0) return;
    const text = errors
      .map(
        (e, i) =>
          `${i + 1}. [${e.severity.toUpperCase()}] ${e.message}\n   Details: ${
            e.details
          }\n   Suggestion: ${e.suggestion}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Console issues copied to clipboard");
  };

  const ToggleButton = (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      <Button
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className={`shadow-lg ${
          errorCount > 0
            ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
            : warningCount > 0
            ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border-slate-300 bg-white"
        }`}
      >
        <Terminal className="w-4 h-4 mr-2" />
        Console
        <Badge className="ml-2">{errorCount + warningCount}</Badge>
        {open ? (
          <ChevronDown className="w-4 h-4 ml-2" />
        ) : (
          <ChevronUp className="w-4 h-4 ml-2" />
        )}
      </Button>
    </div>
  );

  return (
    <>
      {ToggleButton}

      {open && (
        <div
          className="fixed bottom-0 z-[59] bg-white border-t border-slate-200 shadow-2xl flex flex-col rounded-t-lg"
          style={{
            height,
            left: "260px", // start aligned with graph area (after left sidebar)
            width: "calc(100% - 260px - 323px)", // stop before right control panel (~250px width)
            margin: "0 auto", // center in available space
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          <div
            className="h-2 cursor-ns-resize bg-slate-200 hover:bg-slate-300"
            onMouseDown={() => (isResizing.current = true)}
            title="Drag to resize"
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-slate-700" />
                <h4 className="font-semibold text-slate-800">DFA Console</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-red-600 text-white">
                    {errorCount} errors
                  </Badge>
                  <Badge className="bg-amber-500 text-white">
                    {warningCount} warnings
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <Button
                    variant="ghost"
                    className={`px-3 ${filter === "all" ? "bg-slate-100" : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    className={`px-3 ${
                      filter === "error" ? "bg-slate-100" : ""
                    }`}
                    onClick={() => setFilter("error")}
                  >
                    Errors
                  </Button>
                  <Button
                    variant="ghost"
                    className={`px-3 ${
                      filter === "warning" ? "bg-slate-100" : ""
                    }`}
                    onClick={() => setFilter("warning")}
                  >
                    Warnings
                  </Button>
                </div>

                <Button variant="outline" onClick={copyAll}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy all
                </Button>

                <Button variant="ghost" onClick={() => setOpen(false)}>
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="px-4 pb-4 overflow-y-auto flex-1">
              {errors.length === 0 ? (
                <div className="px-3 py-10 text-center text-slate-500">
                  No issues detected. 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((e, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${severityClasses(
                        e.severity
                      )}`}
                    >
                      <div className="flex items-start gap-3">
                        {iconFor(e.severity, "w-5 h-5 mt-0.5")}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-medium text-sm">{e.message}</h5>
                            <Badge variant="outline" className="text-xs">
                              {e.severity.toUpperCase()}
                            </Badge>
                            {e.affectedElements?.length ? (
                              <Badge variant="outline" className="text-xs">
                                affected: {e.affectedElements.length}
                              </Badge>
                            ) : null}
                          </div>

                          {e.details && (
                            <p className="text-xs opacity-80 mt-1">
                              {e.details}
                            </p>
                          )}

                          {e.suggestion && (
                            <div className="bg-white/70 rounded p-2 border mt-2">
                              <p className="text-xs font-medium mb-1">
                                💡 Suggestion
                              </p>
                              <p className="text-xs">{e.suggestion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
