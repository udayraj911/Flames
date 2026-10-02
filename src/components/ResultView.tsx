import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Copy, Check, ShieldAlert, Award, Heart, MessageCircle, AlertTriangle, Users } from "lucide-react";
import { RelationshipType, MatchMode } from "../types";
import { ZODIAC_SIGNS } from "./ZodiacHelper";

interface ResultViewProps {
  name1: string;
  name2: string;
  relationship: RelationshipType;
  baseScore: number;
  mode: MatchMode;
  zodiacs?: {
    sign1: string;
    sign2: string;
    compatibility: string;
    score: number;
  };
  onReset: () => void;
}

// Map each relationship to its themed styling
const THEMES: {
  [key in RelationshipType]: {
    title: string;
    gradient: string;
    border: string;
    text: string;
    glow: string;
    quote: string;
    badgeBg: string;
    icon: React.ReactNode;
  };
} = {
  [RelationshipType.FRIENDSHIP]: {
    title: "Friendship",
    gradient: "from-amber-400 via-orange-500 to-yellow-500",
    border: "border-amber-500/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    quote: "“A single soul dwelling in two bodies, forged in banter and absolute loyalty.”",
    badgeBg: "bg-amber-500/10",
    icon: <Users className="text-amber-400" size={28} />,
  },
  [RelationshipType.LOVE]: {
    title: "Love",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    border: "border-pink-500/30",
    text: "text-pink-400",
    glow: "shadow-pink-500/20",
    quote: "“Two souls drifting in the cosmos, destined to collide and share the exact same orbit.”",
    badgeBg: "bg-pink-500/10",
    icon: <Heart className="text-pink-400" size={28} fill="currentColor" />,
  },
  [RelationshipType.AFFECTION]: {
    title: "Affection",
    gradient: "from-violet-400 via-purple-500 to-indigo-500",
    border: "border-purple-500/30",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
    quote: "“A gentle, warm gravity drawing your hearts closer with every single heartbeat.”",
    badgeBg: "bg-purple-500/10",
    icon: <MessageCircle className="text-purple-400" size={28} />,
  },
  [RelationshipType.MARRIAGE]: {
    title: "Marriage",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    quote: "“A divine cosmic decree of permanent alignment, loyalty, and lifelong union.”",
    badgeBg: "bg-emerald-500/10",
    icon: <Award className="text-emerald-400" size={28} />,
  },
  [RelationshipType.ENMITY]: {
    title: "Enmity",
    gradient: "from-red-500 via-crimson-600 to-orange-600",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "shadow-red-500/20",
    quote: "“Electric friction and rival sparks. Are you mortal enemies, or secret admirers?”",
    badgeBg: "bg-red-500/10",
    icon: <AlertTriangle className="text-red-400" size={28} />,
  },
  [RelationshipType.SIBLING]: {
    title: "Sibling",
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
    quote: "“A double-star companionship characterized by endless teasing and unshakeable support.”",
    badgeBg: "bg-cyan-500/10",
    icon: <ShieldAlert className="text-cyan-400" size={28} />,
  },
};

export default function ResultView({ name1, name2, relationship, baseScore, mode, zodiacs, onReset }: ResultViewProps) {
  const [copied, setCopied] = useState(false);
  const [oracleVerdict, setOracleVerdict] = useState("");
  const [loadingOracle, setLoadingOracle] = useState(true);
  const [oracleError, setOracleError] = useState("");

  const theme = THEMES[relationship];

  // Calculate deterministic score based on names
  const getDeterministicOffset = (n1: string, n2: string) => {
    const combined = (n1.toLowerCase() + n2.toLowerCase()).split("").sort().join("");
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 11); // Deterministic offset (0 to 10)
  };

  const offset = getDeterministicOffset(name1, name2);
  let finalScore = baseScore + offset;
  if (finalScore > 100) finalScore = 100;

  // Average with zodiac if in zodiac mode
  if (mode === "zodiac" && zodiacs) {
    finalScore = Math.round((finalScore + zodiacs.score) / 2);
  }

  // Fetch cosmic advice from Express API (Gemini)
  useEffect(() => {
    let active = true;
    async function fetchVerdict() {
      try {
        setLoadingOracle(true);
        setOracleError("");
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name1,
            name2,
            relationship: theme.title,
            compatibilityScore: finalScore,
            zodiacs: zodiacs ? { sign1: zodiacs.sign1, sign2: zodiacs.sign2 } : undefined,
          }),
        });

        if (!res.ok) {
          throw new Error("The stars failed to align. API Error.");
        }

        const data = await res.json();
        if (active) {
          setOracleVerdict(data.verdict);
        }
      } catch (err) {
        console.error("Oracle fetch error:", err);
        if (active) {
          setOracleError("The celestial lines are currently busy. Try again soon!");
        }
      } finally {
        if (active) {
          setLoadingOracle(false);
        }
      }
    }

    fetchVerdict();
    return () => {
      active = false;
    };
  }, [name1, name2, relationship, finalScore, zodiacs]);

  // Actionable tips based on relationship
  const getTips = () => {
    switch (relationship) {
      case RelationshipType.FRIENDSHIP:
        return [
          "Organize an immediate gaming night or movie session.",
          "Keep high-fiving: you are an unbeatable duo of banter.",
          "Never stop sharing memes; it is the currency of your bond.",
        ];
      case RelationshipType.LOVE:
        return [
          "Write down a handwritten note expressing your warm feelings.",
          "Plan a sunset stroll or an unplanned coffee escape.",
          "You are highly compatible. Respect each other's stars!",
        ];
      case RelationshipType.AFFECTION:
        return [
          "Send them a quick, heartwarming check-in message today.",
          "Listen deeply next time they speak; your ears are magnets.",
          "A small thoughtful gift would go an incredibly long way.",
        ];
      case RelationshipType.MARRIAGE:
        return [
          "Start practicing your wedding dance (even if jokingly!).",
          "You are a rare celestial alignment. Guard this lock closely.",
          "Send them a ring emoji 💍 right now to lock in the destiny.",
        ];
      case RelationshipType.ENMITY:
        return [
          "Maintain a healthy distance, or buy them a peace-offering pastry.",
          "Challenge them to an intense rock-paper-scissors duel to break the tension.",
          "Remember: high friction often disguises intense unexpressed interest!",
        ];
      case RelationshipType.SIBLING:
        return [
          "Send them a playful annoying GIF immediately.",
          "Remember to cover for them when they get into trouble.",
          "Tease them lightheartedly, but always have their back in public.",
        ];
    }
  };

  const handleShare = () => {
    const text = `✨ COSMIC F.L.A.M.E.S REPORT ✨
💖 Names: ${name1} & ${name2}
🔮 Match Mode: ${mode === "classic" ? "Classic FLAMES" : mode === "zodiac" ? `Zodiac Match` : "Secret Crush"}
🌌 Cosmic Bond: ${relationship.toUpperCase()}
🔥 Compatibility Meter: ${finalScore}%
${mode === "zodiac" && zodiacs ? `🌟 Zodiac: ${zodiacs.sign1} + ${zodiacs.sign2} (${zodiacs.compatibility})\n` : ""}
🧬 "What to do next": ${getTips()[0]}

Check your cosmic connection in the FLAMES Game!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6" id="result-container">
      {/* Primary Result Card */}
      <div className={`relative overflow-hidden bg-slate-950/80 border ${theme.border} rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl ${theme.glow} transition-all duration-300`} id="primary-result-card">
        {/* Subtle background glow effect */}
        <div className={`absolute -right-16 -top-16 w-44 h-44 bg-gradient-to-br ${theme.gradient} rounded-full filter blur-[50px] opacity-15`}></div>

        <div className="flex flex-col items-center text-center space-y-5" id="result-header">
          {/* Top aesthetic badge */}
          <div className="flex items-center gap-1.5 py-1 px-3.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] text-slate-400 uppercase tracking-widest font-bold" id="badge-cosmic">
            <Sparkles size={11} className="text-yellow-400" />
            Cosmic Verdict
          </div>

          {/* Relationship Outcome */}
          <div className="space-y-2" id="outcome-group">
            <p className="text-xs text-slate-400 tracking-wider font-semibold">
              The bond between <span className="text-slate-100 font-bold">{name1}</span> and <span className="text-slate-100 font-bold">{name2}</span> is
            </p>
            <div className="flex items-center justify-center gap-3" id="outcome-display">
              {theme.icon}
              <h1 className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent uppercase tracking-wider filter drop-shadow`}>
                {relationship}
              </h1>
            </div>
            <p className="text-xs italic text-slate-400/90 max-w-sm mx-auto pt-1 font-medium">{theme.quote}</p>
          </div>

          {/* Separation Line */}
          <div className="w-full h-px bg-slate-900"></div>

          {/* Score Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-2" id="stats-grid">
            {/* Compatibility Ring */}
            <div className="flex flex-col items-center justify-center space-y-2 bg-slate-900/25 border border-slate-900 rounded-2xl p-4" id="stat-compatibility-meter">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compatibility Meter</span>
              <div className="relative flex items-center justify-center" id="score-ring">
                {/* SVG Circular Progress Bar */}
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#0f172a" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={`url(#gradient-${relationship})`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * finalScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id={`gradient-${relationship}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={relationship === RelationshipType.LOVE || relationship === RelationshipType.FRIENDSHIP ? "#f43f5e" : "#8b5cf6"} />
                      <stop offset="100%" stopColor={relationship === RelationshipType.LOVE || relationship === RelationshipType.FRIENDSHIP ? "#ec4899" : "#6366f1"} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center" id="score-text-label">
                  <span className="text-2xl font-black text-slate-100 font-sans tracking-tight">{finalScore}%</span>
                </div>
              </div>
            </div>

            {/* Zodiac Info or Summary */}
            <div className="flex flex-col items-center justify-center space-y-2 bg-slate-900/25 border border-slate-900 rounded-2xl p-4 text-center" id="stat-zodiac-details">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Astro Alignment</span>
              {mode === "zodiac" && zodiacs ? (
                <div className="space-y-1.5" id="astro-details-active">
                  <div className="flex justify-center gap-4 text-sm font-semibold text-slate-200">
                    <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800/40">{zodiacs.sign1}</span>
                    <span className="text-slate-500 self-center">&amp;</span>
                    <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800/40">{zodiacs.sign2}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-bold">{zodiacs.compatibility}</p>
                  <p className="text-[9px] text-slate-400">Astrological Base: {zodiacs.score}%</p>
                </div>
              ) : (
                <div className="space-y-1 py-1" id="astro-details-classic">
                  <p className="text-xs text-slate-300 font-semibold">Standard Matching</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
                    Pure alphabetical soul matching has calculated this connection. Upgrade to Zodiac mode next time to embed your solar signs!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cosmic Oracle AI Verdict Box */}
      <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative" id="oracle-box">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-4">
          <span className="text-lg">🔮</span>
          Cosmic Oracle&apos;s Verdict
        </h3>

        {loadingOracle ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3" id="oracle-loader">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 m-auto w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
              Consulting the stellar maps...
            </span>
          </div>
        ) : oracleError ? (
          <div className="text-xs text-slate-400 text-center py-4 px-2" id="oracle-error">
            <p className="font-semibold text-slate-300 mb-1">{oracleError}</p>
            <p className="text-[10px] text-slate-500">The stars remained silent this turn, but your connection is certain!</p>
          </div>
        ) : (
          <div className="text-xs leading-relaxed text-slate-300 space-y-3 font-sans pr-1" id="oracle-verdict-text">
            {oracleVerdict.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </div>

      {/* Actionable Tips Card */}
      <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-6 shadow-2xl backdrop-blur-xl" id="tips-box">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-4">
          <span className="text-lg">🧬</span>
          Celestial Recommendations
        </h3>
        <ul className="space-y-3 text-xs text-slate-300 font-sans" id="tips-list">
          {getTips().map((tip, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span className={`flex-shrink-0 w-5 h-5 rounded-full ${theme.badgeBg} flex items-center justify-center text-[10px] font-bold ${theme.text}`}>
                {i + 1}
              </span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions Panel */}
      <div className="flex gap-3 justify-center pt-2" id="actions-panel">
        <button
          type="button"
          id="play-again-btn"
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          Play Again
        </button>
        <button
          type="button"
          id="share-result-btn"
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider shadow-lg shadow-violet-500/10 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Share Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
