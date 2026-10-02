import React, { useState } from "react";
import { Search, Trash2, Calendar, RefreshCw, Sparkles, Star, Heart } from "lucide-react";
import { MatchHistoryItem, RelationshipType } from "../types";

interface HistoryViewProps {
  history: MatchHistoryItem[];
  onClearAll: () => void;
  onDeleteOne: (id: string) => void;
  onReRun: (name1: string, name2: string) => void;
}

export default function HistoryView({ history, onClearAll, onDeleteOne, onReRun }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(
    (item) =>
      item.name1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.relationship.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analyze history stats
  const totalBonds = history.length;
  const getDominantOutcome = () => {
    if (history.length === 0) return "None Yet";
    const counts: { [key: string]: number } = {};
    history.forEach((item) => {
      counts[item.relationship] = (counts[item.relationship] || 0) + 1;
    });
    let maxCount = 0;
    let dominant = "None";
    Object.keys(counts).forEach((key) => {
      if (counts[key] > maxCount) {
        maxCount = counts[key];
        dominant = key;
      }
    });
    return dominant;
  };

  const getRelationshipColor = (rel: RelationshipType) => {
    switch (rel) {
      case RelationshipType.LOVE:
        return "text-pink-400 bg-pink-500/10 border-pink-500/20";
      case RelationshipType.MARRIAGE:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case RelationshipType.FRIENDSHIP:
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case RelationshipType.AFFECTION:
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case RelationshipType.ENMITY:
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case RelationshipType.SIBLING:
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6" id="history-container">
      {/* Telemetry Stats Headers */}
      {totalBonds > 0 && (
        <div className="grid grid-cols-2 gap-4" id="history-stats">
          <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Bonds Invoked</span>
            <span className="text-3xl font-black text-slate-100 flex items-center gap-1.5 font-mono">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              {totalBonds}
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Dominant Force</span>
            <span className="text-sm font-extrabold text-slate-200 truncate max-w-full uppercase tracking-wider flex items-center gap-1.5">
              <Heart size={14} className="text-pink-500 fill-pink-500" />
              {getDominantOutcome()}
            </span>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4" id="history-panel">
        <div className="flex items-center justify-between border-b border-slate-900 pb-4" id="history-header">
          <div className="flex items-center gap-2">
            <span className="text-base">📜</span>
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Chronicles of Destiny</h3>
              <p className="text-[10px] text-slate-400">Past relationship matches and records</p>
            </div>
          </div>
          {totalBonds > 0 && (
            <button
              type="button"
              id="clear-all-btn"
              onClick={() => {
                if (window.confirm("Are you sure you want to erase all chronicles from the cosmos?")) {
                  onClearAll();
                }
              }}
              className="text-[10px] font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 py-1.5 px-3 rounded-lg border border-red-500/20 transition-all uppercase cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search bar */}
        {totalBonds > 0 && (
          <div className="relative" id="history-search-group">
            <Search className="absolute left-3.5 top-3.5 text-slate-600" size={14} />
            <input
              type="text"
              id="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chronicles by name or bond..."
              className="w-full bg-slate-900/40 border border-slate-900/80 text-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs focus:outline-none focus:border-pink-500/50"
            />
          </div>
        )}

        {/* List Content */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1" id="history-scroll-list">
          {totalBonds === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-500" id="empty-history-state">
              <span className="text-3xl block">🌌</span>
              <p className="text-xs font-semibold">The Cosmic Chronicles are empty.</p>
              <p className="text-[10px]">Start matching names to document your celestial path!</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs" id="no-search-results">
              No cosmic coordinates matched your search.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group relative bg-slate-900/30 border border-slate-900/60 rounded-xl p-3 flex items-center justify-between hover:bg-slate-900/50 hover:border-slate-800/80 transition-all shadow-inner"
                id={`history-item-${item.id}`}
              >
                <div className="space-y-1 pr-4 max-w-[70%]" id={`history-meta-${item.id}`}>
                  {/* Names */}
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {item.name1} <span className="text-slate-500 font-normal">and</span> {item.name2}
                  </p>
                  
                  {/* Date & Zodiac sub info */}
                  <div className="flex items-center gap-2 text-[9px] text-slate-400" id={`history-sub-${item.id}`}>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    {item.zodiacs && (
                      <span className="bg-slate-950 px-1 rounded text-slate-400">
                        {item.zodiacs.sign1} + {item.zodiacs.sign2}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2" id={`history-actions-${item.id}`}>
                  {/* Score & Relationship badge */}
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className={`text-[10px] font-black uppercase tracking-wider py-0.5 px-2 rounded-md border ${getRelationshipColor(item.relationship)}`}>
                      {item.relationship}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-semibold">{item.score}% Match</span>
                  </div>

                  {/* Divider */}
                  <div className="h-6 w-px bg-slate-900"></div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id={`re-run-btn-${item.id}`}
                      onClick={() => onReRun(item.name1, item.name2)}
                      title="Re-run matching"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-850/50 transition-all cursor-pointer"
                    >
                      <RefreshCw size={11} />
                    </button>
                    <button
                      type="button"
                      id={`delete-btn-${item.id}`}
                      onClick={() => onDeleteOne(item.id)}
                      title="Delete entry"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 bg-slate-900 hover:bg-slate-850 border border-slate-850/50 transition-all cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
