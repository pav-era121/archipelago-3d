import React from 'react';
import { ViewMode, Task, getDaysUntilDue } from '../types';
import { Plus, Volume2, VolumeX, HelpCircle, RotateCcw, Box, BarChart3, LayoutGrid, Calendar, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenCreate: () => void;
  onResetData: () => void;
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  tasks: Task[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenCreate,
  onResetData,
  onOpenHelp,
  isMuted,
  onToggleMute,
  tasks
}) => {
  // Count urgent upcoming deadlines (due in <= 3 days or overdue)
  const urgentDeadlineCount = React.useMemo(() => {
    return tasks.filter((t) => {
      if (t.completed) return false;
      const days = getDaysUntilDue(t.dueDate);
      return days !== null && days <= 3;
    }).length;
  }, [tasks]);

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-6 py-3 flex items-center justify-between pointer-events-auto bg-slate-950/40 backdrop-blur-sm border-b border-slate-800/40">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-white/20">
          <Box className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold tracking-wider uppercase text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Archipelago 3D
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v1.1
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Eisenhower Matrix & Deadline Radar
          </p>
        </div>
      </div>

      {/* Central View Switcher */}
      <div className="flex items-center bg-slate-900/85 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-xl">
        <button
          onClick={() => {
            sound.playSwoosh();
            onViewChange('archipelago');
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'archipelago'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Archipelago 3D</span>
        </button>

        <button
          onClick={() => {
            sound.playSwoosh();
            onViewChange('timeline');
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
            currentView === 'timeline'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Coming Days</span>
          {urgentDeadlineCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono">
              {urgentDeadlineCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sound.playSwoosh();
            onViewChange('graph3d');
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'graph3d'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>3D Scatter Graph</span>
        </button>

        <button
          onClick={() => {
            sound.playSwoosh();
            onViewChange('matrix2d');
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'matrix2d'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>2D Board</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Urgent Deadline Notification Pill */}
        {urgentDeadlineCount > 0 && (
          <button
            onClick={() => {
              sound.playClick();
              onViewChange('timeline');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium hover:bg-rose-500/25 transition-colors animate-pulse"
            title="Click to view urgent upcoming deliverables"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-bold">{urgentDeadlineCount} Due Soon</span>
          </button>
        )}

        {/* Reset Sample Data */}
        <button
          onClick={() => {
            sound.playClick();
            if (window.confirm('Reset tasks back to default sample portfolio?')) {
              onResetData();
            }
          }}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
          title="Reset to sample dataset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Audio Mute */}
        <button
          onClick={() => {
            onToggleMute();
          }}
          className={`p-2 rounded-xl border transition-colors shadow-sm ${
            isMuted
              ? 'bg-slate-900/80 border-slate-800 text-slate-500'
              : 'bg-slate-900/80 border-slate-800 text-indigo-400 hover:text-indigo-300'
          }`}
          title={isMuted ? 'Unmute spatial SFX' : 'Mute spatial SFX'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Help Guide */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenHelp();
          }}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
          title="Guide & Matrix Overview"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Add Task Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenCreate();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {tasks.length}
          </span>
        </button>
      </div>
    </header>
  );
};
