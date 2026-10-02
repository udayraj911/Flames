import React, { useState } from "react";
import { Sparkles, Heart, Calendar, Lock, ShieldCheck, UserCheck, Flame } from "lucide-react";
import { MatchMode, ZodiacSign } from "../types";
import { ZODIAC_SIGNS, getZodiacSign } from "./ZodiacHelper";

interface LandingViewProps {
  onCalculate: (
    name1: string,
    name2: string,
    mode: MatchMode,
    birthdates?: { p1: { month: number; day: number }; p2: { month: number; day: number } },
    passcode?: string
  ) => void;
  initialName1?: string;
  initialName2?: string;
  initialMode?: MatchMode;
}

export default function LandingView({
  onCalculate,
  initialName1 = "",
  initialName2 = "",
  initialMode = "classic",
}: LandingViewProps) {
  const [name1, setName1] = useState(initialName1);
  const [name2, setName2] = useState(initialName2);
  const [mode, setMode] = useState<MatchMode>(initialMode);

  // Zodiac Birthdate states (defaults to March 21 - Aries)
  const [p1Month, setP1Month] = useState(3);
  const [p1Day, setP1Day] = useState(21);
  const [p2Month, setP2Month] = useState(3);
  const [p2Day, setP2Day] = useState(21);

  // Secret Crush mode state
  const [passcode, setPasscode] = useState("");
  const [showPassError, setShowPassError] = useState(false);

  const [error, setError] = useState("");

  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  const getDaysInMonth = (m: number) => {
    if ([4, 6, 9, 11].includes(m)) return 30;
    if (m === 2) return 29; // Allow 29 for leap year compatibility
    return 31;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowPassError(false);

    const trimmed1 = name1.trim();
    const trimmed2 = name2.trim();

    if (!trimmed1 || !trimmed2) {
      setError("Please fill in both names to invoke the oracle.");
      return;
    }

    if (trimmed1.toLowerCase() === trimmed2.toLowerCase()) {
      setError("Names cannot be identical. Try pairing different souls!");
      return;
    }

    // Check if names have letters
    const alphabetOnly1 = trimmed1.replace(/[^a-zA-Z]/g, "");
    const alphabetOnly2 = trimmed2.replace(/[^a-zA-Z]/g, "");

    if (alphabetOnly1.length < 2 || alphabetOnly2.length < 2) {
      setError("Each name must contain at least 2 alphabetic characters.");
      return;
    }

    if (mode === "crush" && passcode.length < 4) {
      setError("Please enter a 4-digit numeric PIN to secure your secret crush.");
      return;
    }

    const birthdates =
      mode === "zodiac"
        ? {
            p1: { month: p1Month, day: p1Day },
            p2: { month: p2Month, day: p2Day },
          }
        : undefined;

    onCalculate(trimmed1, trimmed2, mode, birthdates, mode === "crush" ? passcode : undefined);
  };

  const activeZodiac1 = getZodiacSign(p1Month, p1Day);
  const activeZodiac2 = getZodiacSign(p2Month, p2Day);

  return (
    <div className="w-full max-w-md mx-auto" id="landing-container">
      {/* Mode Selector Tabs */}
      <div className="flex bg-slate-900/40 p-1 rounded-full border border-slate-800/80 mb-6 shadow-inner backdrop-blur-md" id="mode-tabs">
        <button
          type="button"
          id="mode-classic-btn"
          onClick={() => setMode("classic")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
            mode === "classic"
              ? "bg-gradient-to-r from-pink-550 to-rose-500 text-white shadow-md shadow-pink-500/20 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Flame size={14} />
          Classic FLAMES
        </button>
        <button
          type="button"
          id="mode-zodiac-btn"
          onClick={() => setMode("zodiac")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
            mode === "zodiac"
              ? "bg-gradient-to-r from-violet-550 to-indigo-500 text-white shadow-md shadow-violet-500/20 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar size={14} />
          Zodiac Match
        </button>
        <button
          type="button"
          id="mode-crush-btn"
          onClick={() => setMode("crush")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
            mode === "crush"
              ? "bg-gradient-to-r from-amber-550 to-orange-500 text-white shadow-md shadow-amber-500/20 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Lock size={13} />
          Secret Crush
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleCalculate} className="space-y-5 bg-slate-950/80 border border-slate-900 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden" id="match-form">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 via-violet-500 to-amber-500"></div>
        
        {/* Name 1 */}
        <div className="space-y-1.5" id="name1-group">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <UserCheck size={14} className="text-pink-500" />
            Your Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="input-name1"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="e.g. Rahul"
              maxLength={25}
              className="w-full bg-slate-900/60 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/20 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Zodiac Subform for Name 1 */}
          {mode === "zodiac" && (
            <div className="pt-2 flex gap-2 items-center bg-slate-900/35 p-3 rounded-xl border border-slate-800/40 animate-fade-in" id="zodiac1-select">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Your Birth Month</span>
                <select
                  value={p1Month}
                  id="p1-month-select"
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setP1Month(m);
                    const maxDays = getDaysInMonth(m);
                    if (p1Day > maxDays) setP1Day(maxDays);
                  }}
                  className="w-full bg-slate-950/80 text-xs text-slate-200 border border-slate-800/80 rounded-md py-1 px-2 focus:outline-none"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Your Birth Day</span>
                <select
                  value={p1Day}
                  id="p1-day-select"
                  onChange={(e) => setP1Day(parseInt(e.target.value))}
                  className="w-full bg-slate-950/80 text-xs text-slate-200 border border-slate-800/80 rounded-md py-1 px-2 focus:outline-none"
                >
                  {Array.from({ length: getDaysInMonth(p1Month) }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col items-center justify-center bg-slate-950/90 rounded-lg p-2 min-w-16 border border-slate-800/50">
                <span className="text-lg">{activeZodiac1.symbol}</span>
                <span className="text-[9px] font-medium text-slate-300">{activeZodiac1.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Heart Connector Separator */}
        <div className="flex items-center justify-center py-2" id="connector-heart">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent flex-1"></div>
          <div className="mx-4 p-2 rounded-full border border-slate-800/50 bg-slate-900/60 shadow-lg text-rose-500 relative animate-pulse">
            <Heart size={16} fill="currentColor" />
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent flex-1"></div>
        </div>

        {/* Name 2 */}
        <div className="space-y-1.5" id="name2-group">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <UserCheck size={14} className="text-violet-500" />
            Their Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="input-name2"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="e.g. Anjali"
              maxLength={25}
              className="w-full bg-slate-900/60 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Zodiac Subform for Name 2 */}
          {mode === "zodiac" && (
            <div className="pt-2 flex gap-2 items-center bg-slate-900/35 p-3 rounded-xl border border-slate-800/40 animate-fade-in" id="zodiac2-select">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Their Birth Month</span>
                <select
                  value={p2Month}
                  id="p2-month-select"
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setP2Month(m);
                    const maxDays = getDaysInMonth(m);
                    if (p2Day > maxDays) setP2Day(maxDays);
                  }}
                  className="w-full bg-slate-950/80 text-xs text-slate-200 border border-slate-800/80 rounded-md py-1 px-2 focus:outline-none"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Their Birth Day</span>
                <select
                  value={p2Day}
                  id="p2-day-select"
                  onChange={(e) => setP2Day(parseInt(e.target.value))}
                  className="w-full bg-slate-950/80 text-xs text-slate-200 border border-slate-800/80 rounded-md py-1 px-2 focus:outline-none"
                >
                  {Array.from({ length: getDaysInMonth(p2Month) }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col items-center justify-center bg-slate-950/90 rounded-lg p-2 min-w-16 border border-slate-800/50">
                <span className="text-lg">{activeZodiac2.symbol}</span>
                <span className="text-[9px] font-medium text-slate-300">{activeZodiac2.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* PIN lock for Secret Crush Mode */}
        {mode === "crush" && (
          <div className="pt-2 space-y-2 bg-slate-900/35 p-4 rounded-xl border border-slate-800/40 animate-fade-in" id="crush-pin-group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-500" />
              Security PIN
            </span>
            <p className="text-[10px] text-slate-400">
              Create a 4-digit PIN. Your results page will require this PIN to access, keeping your secret crush completely safe from prying eyes!
            </p>
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              id="input-pin"
              maxLength={4}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 1234"
              className="w-24 bg-slate-950 text-center text-slate-100 font-mono tracking-widest rounded-lg py-2 border border-slate-800 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-xs text-red-300 flex items-center gap-2" id="form-error">
            <span className="text-sm font-semibold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="submit"
          id="calculate-destiny-btn"
          className={`w-full relative overflow-hidden group py-3 px-4 rounded-xl font-bold tracking-wider text-sm transition-all duration-300 text-white cursor-pointer ${
            mode === "classic"
              ? "bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 hover:scale-[1.01]"
              : mode === "zodiac"
              ? "bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.01]"
              : "bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.01]"
          }`}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="flex items-center justify-center gap-2 relative z-10">
            <Sparkles size={16} className="animate-pulse" />
            Unveil Compatibility
          </span>
        </button>
      </form>
    </div>
  );
}
