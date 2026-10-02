import React, { useState, useEffect } from "react";
import { Sparkles, Flame, History, Shield, Lock, Unlock, Eye, HelpCircle } from "lucide-react";
import LandingView from "./components/LandingView";
import AnimationView from "./components/AnimationView";
import ResultView from "./components/ResultView";
import HistoryView from "./components/HistoryView";
import { calculateFlames, FlamesMatchResult } from "./components/FlamesAlgorithm";
import { getZodiacSign, calculateZodiacCompatibility } from "./components/ZodiacHelper";
import { MatchHistoryItem, RelationshipType, MatchMode } from "./types";

export default function App() {
  const [view, setView] = useState<"landing" | "animation" | "result" | "history">("landing");
  const [mode, setMode] = useState<MatchMode>("classic");
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");

  const [activeResult, setActiveResult] = useState<FlamesMatchResult | null>(null);

  // Zodiac Birthdate storage
  const [zodiacData, setZodiacData] = useState<{
    sign1: string;
    sign2: string;
    compatibility: string;
    score: number;
  } | undefined>(undefined);

  // Secret Crush Lock storage
  const [passcode, setPasscode] = useState<string | undefined>(undefined);
  const [unlockedCrush, setUnlockedCrush] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Match history log
  const [history, setHistory] = useState<MatchHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const raw = localStorage.getItem("flames_history");
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch (err) {
        console.error("Failed to parse history:", err);
      }
    }
  }, []);

  // Calculate base score for relationship
  const getBaseScore = (rel: RelationshipType): number => {
    switch (rel) {
      case RelationshipType.LOVE:
        return 88;
      case RelationshipType.MARRIAGE:
        return 94;
      case RelationshipType.FRIENDSHIP:
        return 85;
      case RelationshipType.AFFECTION:
        return 74;
      case RelationshipType.SIBLING:
        return 50;
      case RelationshipType.ENMITY:
        return 30;
      default:
        return 60;
    }
  };

  // Trigger Calculations and move to Animation View
  const handleCalculate = (
    n1: string,
    n2: string,
    m: MatchMode,
    birthdates?: { p1: { month: number; day: number }; p2: { month: number; day: number } },
    pass?: string
  ) => {
    setName1(n1);
    setName2(n2);
    setMode(m);
    setPasscode(pass);
    setUnlockedCrush(m !== "crush"); // Lock result if it's secret crush mode
    setPinInput("");
    setPinError(false);

    // Compute base algorithm
    const calcResult = calculateFlames(n1, n2);
    setActiveResult(calcResult);

    // Compute zodiac alignment if selected
    if (m === "zodiac" && birthdates) {
      const z1 = getZodiacSign(birthdates.p1.month, birthdates.p1.day);
      const z2 = getZodiacSign(birthdates.p2.month, birthdates.p2.day);
      const comp = calculateZodiacCompatibility(z1, z2);
      setZodiacData(comp);
    } else {
      setZodiacData(undefined);
    }

    setView("animation");
  };

  // Push completed calculation to history database
  const handleAnimationComplete = () => {
    if (!activeResult) return;

    const baseScore = getBaseScore(activeResult.relationship);
    const getDeterministicOffset = (n1: string, n2: string) => {
      const combined = (n1.toLowerCase() + n2.toLowerCase()).split("").sort().join("");
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash % 11);
    };

    let score = baseScore + getDeterministicOffset(name1, name2);
    if (score > 100) score = 100;

    if (mode === "zodiac" && zodiacData) {
      score = Math.round((score + zodiacData.score) / 2);
    }

    // Save to history list unless passcode was set (keeps secret crush out of public history log unless they want to)
    if (mode !== "crush") {
      const newItem: MatchHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name1: activeResult.name1,
        name2: activeResult.name2,
        relationship: activeResult.relationship,
        score,
        date: new Date().toISOString(),
        zodiacs: zodiacData
          ? {
              sign1: zodiacData.sign1,
              sign2: zodiacData.sign2,
            }
          : undefined,
      };

      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("flames_history", JSON.stringify(updatedHistory));
    }

    setView("result");
  };

  // Reset calculator state
  const handleReset = () => {
    setName1("");
    setName2("");
    setActiveResult(null);
    setZodiacData(undefined);
    setPasscode(undefined);
    setView("landing");
  };

  // Re-run matching from history log
  const handleReRun = (n1: string, n2: string) => {
    handleCalculate(n1, n2, "classic");
  };

  // Clear all history records
  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("flames_history");
  };

  // Delete single history record
  const handleDeleteOneHistory = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("flames_history", JSON.stringify(updated));
  };

  // Keypad unlock for Secret Crush results
  const handlePINSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === passcode) {
      setUnlockedCrush(true);
      setPinError(false);

      // Save to history list now that it is unlocked and visible
      if (activeResult) {
        const baseScore = getBaseScore(activeResult.relationship);
        const getDeterministicOffset = (n1: string, n2: string) => {
          const combined = (n1.toLowerCase() + n2.toLowerCase()).split("").sort().join("");
          let hash = 0;
          for (let i = 0; i < combined.length; i++) {
            hash = combined.charCodeAt(i) + ((hash << 5) - hash);
          }
          return Math.abs(hash % 11);
        };
        let score = baseScore + getDeterministicOffset(name1, name2);
        if (score > 100) score = 100;

        const newItem: MatchHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          name1: activeResult.name1,
          name2: activeResult.name2,
          relationship: activeResult.relationship,
          score,
          date: new Date().toISOString(),
        };

        const updatedHistory = [newItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("flames_history", JSON.stringify(updatedHistory));
      }
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleKeypadPress = (num: string) => {
    setPinError(false);
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + num);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden pb-12" id="app-root">
      
      {/* Background ambient starry graphics */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.06),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none"></div>

      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="ambient-star text-[10px] text-pink-500/20 top-1/4 left-10" style={{ animationDelay: "0s" }}>✦</div>
        <div className="ambient-star text-[12px] text-violet-500/20 top-1/3 right-12" style={{ animationDelay: "3s" }}>✦</div>
        <div className="ambient-star text-[8px] text-amber-500/20 top-2/3 left-1/4" style={{ animationDelay: "5s" }}>✦</div>
        <div className="ambient-star text-[14px] text-rose-500/20 bottom-1/4 right-1/4" style={{ animationDelay: "8s" }}>✦</div>
      </div>

      {/* Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 py-6 flex items-center justify-between border-b border-slate-900 z-10 relative" id="main-header">
        <button
          type="button"
          id="logo-heading-btn"
          onClick={handleReset}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-violet-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:rotate-12 transition-transform duration-300">
            <Flame className="text-white" size={18} fill="currentColor" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-[0.2em] uppercase bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 bg-clip-text text-transparent">
            F.l.a.m.e.s
          </span>
        </button>

        {/* Global Nav Toggles */}
        <div className="flex gap-2" id="nav-tabs">
          <button
            type="button"
            id="nav-matcher-btn"
            onClick={() => {
              if (view === "history" || view === "result") {
                handleReset();
              }
            }}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
              view !== "history"
                ? "bg-slate-900 border border-slate-800 text-pink-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame size={13} />
            Invoker
          </button>
          <button
            type="button"
            id="nav-history-btn"
            onClick={() => setView("history")}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
              view === "history"
                ? "bg-slate-900 border border-slate-800 text-pink-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History size={13} />
            Chronicles
          </button>
        </div>
      </header>

      {/* Primary Layout Section */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 z-10 relative" id="main-body">
        <div className="w-full max-w-lg space-y-6 animate-fade-in" id="content-card-wrapper">
          
          {/* View Router */}
          {view === "landing" && (
            <div className="space-y-6" id="view-landing">
              {/* Brand introduction heading */}
              <div className="text-center space-y-2 max-w-sm mx-auto" id="brand-pitch">
                <h2 className="font-display text-2xl font-black text-slate-100 tracking-tight">
                  Discover Your Soul Connection
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Invoke the standard matching algorithms paired with the Gemini Cosmic Oracle to map your relational destiny.
                </p>
              </div>

              <LandingView
                onCalculate={handleCalculate}
                initialName1={name1}
                initialName2={name2}
                initialMode={mode}
              />
            </div>
          )}

          {view === "animation" && activeResult && (
            <div id="view-animation">
              <AnimationView result={activeResult} onComplete={handleAnimationComplete} />
            </div>
          )}

          {view === "result" && activeResult && (
            <div id="view-result">
              {mode === "crush" && !unlockedCrush ? (
                /* Passcode Guard Vault Card for Secret Crush mode */
                <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center space-y-6" id="vault-pin-screen">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full animate-bounce">
                    <Lock size={32} />
                  </div>
                  <div className="text-center space-y-1.5" id="vault-pitch">
                    <h3 className="text-base font-extrabold text-slate-100 uppercase tracking-wider">Destiny Sealed</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      This calculation was secured in Secret Crush mode. Enter your 4-digit PIN to unlock the oracle.
                    </p>
                  </div>

                  {/* PIN Display Dots */}
                  <div className="flex gap-4 justify-center py-2" id="pin-dots">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                          pinInput.length > idx
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 border-orange-500 scale-110 shadow-md shadow-orange-500/30"
                            : "bg-slate-950 border-slate-800"
                        }`}
                      ></div>
                    ))}
                  </div>

                  {/* Error Indicator */}
                  {pinError && (
                    <div className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1 animate-pulse" id="pin-error-alert">
                      Vault remains locked. PIN incorrect!
                    </div>
                  )}

                  {/* Interactive digital keypad */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-xs py-2" id="pin-keypad">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                      <button
                        key={num}
                        type="button"
                        id={`keypad-${num}`}
                        onClick={() => handleKeypadPress(num)}
                        className="bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-850 text-slate-200 hover:text-white font-mono font-bold text-lg py-3 rounded-xl transition-all cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      id="keypad-clear"
                      onClick={() => setPinInput("")}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-850 text-red-400 hover:text-red-300 text-xs font-bold py-3 rounded-xl transition-all uppercase cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      id="keypad-0"
                      onClick={() => handleKeypadPress("0")}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-200 hover:text-white font-mono font-bold text-lg py-3 rounded-xl transition-all cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      id="keypad-back"
                      onClick={() => setPinInput((prev) => prev.slice(0, -1))}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white text-xs font-bold py-3 rounded-xl transition-all uppercase cursor-pointer"
                    >
                      Back
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    id="submit-pin-btn"
                    onClick={handlePINSubmit}
                    disabled={pinInput.length !== 4}
                    className={`w-full py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      pinInput.length === 4
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.01] text-white shadow-lg shadow-orange-500/20"
                        : "bg-slate-900 border border-slate-850 text-slate-500"
                    }`}
                  >
                    <Unlock size={14} />
                    Uncover Destiny
                  </button>
                </div>
              ) : (
                <ResultView
                  name1={activeResult.name1}
                  name2={activeResult.name2}
                  relationship={activeResult.relationship}
                  baseScore={getBaseScore(activeResult.relationship)}
                  mode={mode}
                  zodiacs={zodiacData}
                  onReset={handleReset}
                />
              )}
            </div>
          )}

          {view === "history" && (
            <div id="view-history">
              <HistoryView
                history={history}
                onClearAll={handleClearAllHistory}
                onDeleteOne={handleDeleteOneHistory}
                onReRun={handleReRun}
              />
            </div>
          )}

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center text-[10px] text-slate-600 font-mono mt-12 z-10 relative" id="main-footer">
        © {new Date().getFullYear()} F.L.A.M.E.S Game • Inspired by Celestial Orbits
      </footer>
    </div>
  );
}
