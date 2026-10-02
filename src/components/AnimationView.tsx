import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, SkipForward, Flame, Hash, HelpCircle } from "lucide-react";
import { FlamesMatchResult } from "./FlamesAlgorithm";

interface AnimationViewProps {
  result: FlamesMatchResult;
  onComplete: () => void;
}

export default function AnimationView({ result, onComplete }: AnimationViewProps) {
  const [phase, setPhase] = useState<"crossOut" | "count" | "flames" | "done">("crossOut");
  const [crossStep, setCrossStep] = useState(0);
  const [flamesStep, setFlamesStep] = useState(0);
  const [activeFlamesHighlight, setActiveFlamesHighlight] = useState<number | null>(null);

  const { chars1, chars2, crossOutSteps, remainingCount, eliminationSteps } = result;

  // Track which letters are currently crossed out
  const [crossed1, setCrossed1] = useState<number[]>([]);
  const [crossed2, setCrossed2] = useState<number[]>([]);

  // 1. Cross Out Phase Effect
  useEffect(() => {
    if (phase !== "crossOut") return;

    if (crossOutSteps.length === 0 || crossStep >= crossOutSteps.length) {
      const timer = setTimeout(() => {
        setPhase("count");
      }, 800);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      const step = crossOutSteps[crossStep];
      setCrossed1((prev) => [...prev, step.name1Index]);
      setCrossed2((prev) => [...prev, step.name2Index]);
      setCrossStep((prev) => prev + 1);
    }, 700);

    return () => clearTimeout(timer);
  }, [phase, crossStep, crossOutSteps]);

  // 2. Count Phase Transition Effect
  useEffect(() => {
    if (phase !== "count") return;

    const timer = setTimeout(() => {
      setPhase("flames");
    }, 1800);

    return () => clearTimeout(timer);
  }, [phase]);

  // 3. FLAMES Elimination Phase Effect (Stepping)
  useEffect(() => {
    if (phase !== "flames") return;

    if (flamesStep >= eliminationSteps.length) {
      const timer = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }

    const currentStep = eliminationSteps[flamesStep];
    const letters = currentStep.remainingLetters;
    const stepsToCount = remainingCount === 0 ? 1 : remainingCount;

    // Simulate counting cursor bouncing across letters
    let currentCount = 0;
    let cursorIndex = currentStep.startIndex;

    const countInterval = setInterval(() => {
      if (currentCount < stepsToCount) {
        const actualIndexInGrid = "FLAMES".indexOf(letters[cursorIndex]);
        setActiveFlamesHighlight(actualIndexInGrid);

        cursorIndex = (cursorIndex + 1) % letters.length;
        currentCount++;
      } else {
        clearInterval(countInterval);
        // We reached the target letter to eliminate!
        const elimGridIndex = "FLAMES".indexOf(currentStep.eliminatedChar);
        setActiveFlamesHighlight(elimGridIndex);

        // Wait a small bit on the eliminated letter, then strike it out and proceed to the next step
        setTimeout(() => {
          setFlamesStep((prev) => prev + 1);
          setActiveFlamesHighlight(null);
        }, 500);
      }
    }, 200); // Speed of cursor bounce (200ms)

    return () => clearInterval(countInterval);
  }, [phase, flamesStep, eliminationSteps, remainingCount]);

  // Helper to check if a letter in the original FLAMES word is eliminated
  const getEliminatedLettersAtStep = () => {
    const eliminated: string[] = [];
    for (let i = 0; i < flamesStep; i++) {
      eliminated.push(eliminationSteps[i].eliminatedChar);
    }
    return eliminated;
  };

  const eliminatedFLAMESLetters = getEliminatedLettersAtStep();

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-950/80 border border-slate-900 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6" id="animation-container">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4" id="animation-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
            <Flame size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Cosmic Alignment</h3>
            <p className="text-[10px] text-slate-400">The Oracle is performing calculations...</p>
          </div>
        </div>
        <button
          type="button"
          id="skip-animation-btn"
          onClick={onComplete}
          className="flex items-center gap-1 py-1.5 px-3 rounded-lg text-[10px] font-bold tracking-wider text-pink-400 hover:text-white bg-pink-500/10 hover:bg-pink-600/30 transition-all uppercase cursor-pointer"
        >
          <SkipForward size={12} />
          Skip
        </button>
      </div>

      {/* Phase 1: Name letters crossing out */}
      <div className="space-y-4 py-4" id="names-comparison">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Person 1 Name Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 shadow-inner" id="n1-comparison-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Person 1</span>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {chars1.map((c, i) => {
                const isCrossed = crossed1.includes(i);
                return (
                  <div
                    key={c.id}
                    className={`relative flex items-center justify-center w-8 h-10 rounded-lg text-sm font-bold border transition-all duration-300 ${
                      isCrossed
                        ? "bg-rose-950/20 border-rose-900/40 text-slate-500"
                        : "bg-slate-900/90 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>{c.char}</span>
                    {isCrossed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[2px] bg-rose-500 rotate-12 shadow-sm shadow-rose-500/50"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Person 2 Name Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 shadow-inner" id="n2-comparison-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Person 2</span>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {chars2.map((c, i) => {
                const isCrossed = crossed2.includes(i);
                return (
                  <div
                    key={c.id}
                    className={`relative flex items-center justify-center w-8 h-10 rounded-lg text-sm font-bold border transition-all duration-300 ${
                      isCrossed
                        ? "bg-rose-950/20 border-rose-900/40 text-slate-500"
                        : "bg-slate-900/90 border-slate-800 text-slate-200"
                    }`}
                  >
                    <span>{c.char}</span>
                    {isCrossed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[2px] bg-rose-500 rotate-12 shadow-sm shadow-rose-500/50"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Informative text below the crossing */}
        <div className="h-10 flex items-center justify-center text-xs font-medium text-slate-400 text-center" id="animation-instruction">
          {phase === "crossOut" && crossStep < crossOutSteps.length && (
            <span className="flex items-center gap-1.5 text-pink-400/90 animate-pulse">
              <Sparkles size={12} />
              Eliminating matching character &apos;{chars1[crossOutSteps[crossStep].name1Index].char}&apos;...
            </span>
          )}
          {phase === "crossOut" && crossStep >= crossOutSteps.length && (
            <span className="text-slate-300">All overlapping letters successfully removed!</span>
          )}
          {phase === "count" && (
            <div className="flex flex-col items-center space-y-1">
              <span className="text-slate-200 flex items-center gap-1.5 font-bold text-sm">
                <Hash size={14} className="text-pink-500" />
                Remaining Letter Count: {remainingCount}
              </span>
              <span className="text-[10px] text-slate-400">Summing uncanceled elements from both souls</span>
            </div>
          )}
          {phase === "flames" && flamesStep < eliminationSteps.length && (
            <span className="text-violet-400 flex items-center gap-1.5">
              <Flame size={12} className="animate-bounce" />
              Counting up to {remainingCount} on F.L.A.M.E.S...
            </span>
          )}
        </div>
      </div>

      {/* Phase 3: FLAMES letters grid */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6 shadow-inner relative overflow-hidden" id="flames-grid-panel">
        <div className="flex justify-center items-center gap-3 md:gap-5" id="flames-letters-container">
          {["F", "L", "A", "M", "E", "S"].map((letter, idx) => {
            const isEliminated = eliminatedFLAMESLetters.includes(letter);
            const isHighlighted = activeFlamesHighlight === idx;
            const meanings: { [key: string]: string } = {
              F: "Friendship",
              L: "Love",
              A: "Affection",
              M: "Marriage",
              E: "Enmity",
              S: "Sibling",
            };

            return (
              <div key={letter} className="flex flex-col items-center gap-1.5" id={`flames-col-${letter}`}>
                <div
                  className={`relative flex items-center justify-center w-11 h-14 md:w-14 md:h-16 text-lg md:text-xl font-bold rounded-xl border transition-all duration-300 ${
                    isEliminated
                      ? "bg-slate-950/40 border-slate-950 text-slate-700"
                      : isHighlighted
                      ? "bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/50 scale-110"
                      : "bg-slate-900 border-slate-800 text-slate-100"
                  }`}
                >
                  <span>{letter}</span>
                  {isEliminated && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[120%] h-[3px] bg-red-600/80 rounded rotate-45 shadow-lg"></div>
                    </div>
                  )}
                </div>
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    isEliminated ? "text-slate-700 line-through" : isHighlighted ? "text-violet-400 font-bold" : "text-slate-500"
                  }`}
                >
                  {meanings[letter].substring(0, 4)}.
                </span>
              </div>
            );
          })}
        </div>

        {/* Explain detailed counting step */}
        {phase === "flames" && flamesStep < eliminationSteps.length && (
          <div className="bg-slate-950/60 border border-slate-900/60 rounded-xl py-2 px-4 text-[10px] font-mono text-slate-400 text-center max-w-xs" id="step-log-badge">
            <span className="text-violet-400 font-bold">Step {flamesStep + 1}:</span> Eliminating{" "}
            <span className="text-red-400 font-bold uppercase">{eliminationSteps[flamesStep].eliminatedChar}</span> after{" "}
            {remainingCount} steps.
          </div>
        )}
      </div>
    </div>
  );
}
