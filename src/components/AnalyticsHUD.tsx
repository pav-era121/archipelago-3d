import React, { useState } from 'react';
import { Task, QuadrantType, QUADRANTS } from '../types';
import { AlertTriangle, TrendingUp, Clock, PieChart, Filter, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface AnalyticsHUDProps {
  tasks: Task[];
  filterQuadrant: QuadrantType | 'all';
  onFilterChange: (quadrant: QuadrantType | 'all') => void;
  isGraphMode: boolean;
}

export const AnalyticsHUD: React.FC<AnalyticsHUDProps> = ({
  tasks,
  filterQuadrant,
  onFilterChange,
  isGraphMode
}) => {
  // Collapsed by default on mobile / small screens, expanded on desktop
  const [isExpanded, setIsExpanded] = useState(false);

  // Aggregate effort hours
  const stats = React.useMemo(() => {
    let totalHours = 0;
    const hoursByQuadrant: Record<QuadrantType, number> = { q1: 0, q2: 0, q3: 0, q4: 0 };
    const countByQuadrant: Record<QuadrantType, number> = { q1: 0, q2: 0, q3: 0, q4: 0 };

    tasks.forEach((t) => {
      totalHours += t.effortHours;
      hoursByQuadrant[t.quadrant] += t.effortHours;
      countByQuadrant[t.quadrant] += 1;
    });

    const safeTotal = totalHours || 1;
    const q1Share = (hoursByQuadrant.q1 / safeTotal) * 100;
    const q2Share = (hoursByQuadrant.q2 / safeTotal) * 100;
    const q3Share = (hoursByQuadrant.q3 / safeTotal) * 100;
    const q4Share = (hoursByQuadrant.q4 / safeTotal) * 100;

    let alignmentScore = 40;
    if (q2Share >= 40) alignmentScore += 30;
    else if (q2Share >= 25) alignmentScore += 15;

    if (q4Share <= 10) alignmentScore += 20;
    else alignmentScore -= Math.min(25, q4Share);

    if (q3Share <= 20) alignmentScore += 10;
    else alignmentScore -= 10;

    alignmentScore = Math.max(10, Math.min(98, Math.round(alignmentScore)));

    const warnings: string[] = [];
    const praise: string[] = [];

    if (q4Share > 15) {
      warnings.push(`Time Drain: ${q4Share.toFixed(0)}% effort in Q4 (Eliminate)!`);
    }
    if (q3Share > 30) {
      warnings.push(`Delegation Gap: ${q3Share.toFixed(0)}% in Q3 busywork.`);
    }
    if (q1Share > 45) {
      warnings.push(`Firefighting Risk: ${q1Share.toFixed(0)}% in Q1 crisis mode.`);
    }
    if (q2Share >= 45) {
      praise.push(`Strategic Engine: ${q2Share.toFixed(0)}% in Q2 growth!`);
    }

    return {
      totalHours,
      hoursByQuadrant,
      countByQuadrant,
      shares: { q1: q1Share, q2: q2Share, q3: q3Share, q4: q4Share },
      alignmentScore,
      warnings,
      praise
    };
  }, [tasks]);

  return (
    <div className="absolute top-16 md:top-20 right-3 md:right-4 z-20 flex flex-col items-end pointer-events-auto max-w-[calc(100vw-24px)] md:max-w-sm">
      {/* Toggle Pill Button (Always visible, small, never hides 3D scene) */}
      <button
        onClick={() => {
          sound.playClick();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 backdrop-blur-md border border-slate-700/80 shadow-xl text-xs text-slate-200 transition-all active:scale-95 mb-2"
      >
        <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
        <span className="font-semibold text-[11px]">Analytics</span>
        <span
          className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
            stats.alignmentScore >= 75
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : stats.alignmentScore >= 50
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}
        >
          {stats.alignmentScore}% Score
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {/* Expanded Panel (Only shown when user toggles it open) */}
      {isExpanded && (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-xs space-y-3 w-[330px] md:w-80 max-h-[75vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
                Effort vs. Impact
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{stats.totalHours.toFixed(1)}h</span>
            </div>
          </div>

          {/* Priority Alignment Health Indicator */}
          <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">
                Alignment Score
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {stats.alignmentScore >= 75
                  ? 'High Focus'
                  : stats.alignmentScore >= 50
                  ? 'Moderate'
                  : 'Priority Drift'}
              </span>
            </div>
            <div
              className={`text-base font-bold font-mono px-2 py-0.5 rounded-lg border ${
                stats.alignmentScore >= 75
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : stats.alignmentScore >= 50
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {stats.alignmentScore}%
            </div>
          </div>

          {/* Quadrant Effort Distribution Bars */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] text-slate-400 uppercase">
              <span>Effort (Z-Height)</span>
              <span>Share</span>
            </div>

            {(Object.keys(QUADRANTS) as QuadrantType[]).map((qKey) => {
              const meta = QUADRANTS[qKey];
              const share = stats.shares[qKey];
              const hours = stats.hoursByQuadrant[qKey];
              return (
                <div key={qKey} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 font-medium text-slate-200">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      {meta.title.split(',')[0]}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {hours.toFixed(1)}h ({share.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, share)}%`,
                        backgroundColor: meta.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Alerts / Advice */}
          {stats.warnings.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-2 text-[11px] text-rose-300 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div>{stats.warnings[0]}</div>
            </div>
          )}

          {stats.praise.length > 0 && (
            <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-2 text-[11px] text-emerald-300 flex items-start gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>{stats.praise[0]}</div>
            </div>
          )}

          {/* Quadrant Filter in Graph Mode */}
          {isGraphMode && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter 3D:
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onFilterChange('all')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    filterQuadrant === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                {(Object.keys(QUADRANTS) as QuadrantType[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => onFilterChange(q)}
                    className={`px-1 py-0.5 rounded text-[10px] font-mono uppercase ${
                      filterQuadrant === q
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={{
                      color: filterQuadrant === q ? QUADRANTS[q].color : undefined
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
