import React from 'react';
import { Task, QuadrantType, QUADRANTS, CATEGORY_META, getDaysUntilDue, formatDeadlineBadge } from '../types';
import { X, CheckCircle, Trash2, Edit3, MoveRight, Clock, User, Calendar, Tag, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onMoveQuadrant: (taskId: string, targetQuadrant: QuadrantType) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onToggleComplete,
  onDelete,
  onEdit,
  onMoveQuadrant
}) => {
  if (!task) return null;

  const meta = QUADRANTS[task.quadrant];
  const catMeta = CATEGORY_META[task.category] || CATEGORY_META.assignment;
  const days = getDaysUntilDue(task.dueDate);
  const deadlineBadge = formatDeadlineBadge(days);

  const handleComplete = () => {
    if (!task.completed) {
      sound.playComplete();
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      sound.playClick();
    }
    onToggleComplete(task.id);
  };

  const handleEliminate = () => {
    sound.playEliminate();
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
        style={{ borderTop: `4px solid ${meta.color}` }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div className="space-y-1.5 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                <span>{catMeta.icon}</span>
                <span>{catMeta.label}</span>
              </span>

              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: meta.accentBg, color: meta.color }}
              >
                {meta.action}
              </span>

              <span className="text-xs text-slate-400">
                Island: {meta.islandName}
              </span>
            </div>
            <h2 className={`text-xl font-bold text-white ${task.completed ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="px-6 py-4 space-y-4">
          {/* Deadline Countdown Banner */}
          {task.dueDate && (
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              deadlineBadge.isUrgent
                ? 'bg-rose-950/30 border-rose-500/50'
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${deadlineBadge.isUrgent ? 'text-rose-400' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Target Completion: {task.dueDate}
                  </span>
                  {task.assignedDate && (
                    <span className="text-[10px] text-slate-400">
                      Given on {task.assignedDate}
                    </span>
                  )}
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${deadlineBadge.colorClass}`}>
                {deadlineBadge.text}
              </span>
            </div>
          )}

          {task.description && (
            <p className="text-sm text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              {task.description}
            </p>
          )}

          {/* 3D Coordinate Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Urgency (X-Axis)
              </span>
              <span className="text-lg font-bold font-mono text-rose-400">
                {task.urgency}%
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Importance (Y-Axis)
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {task.importance}%
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Effort (Z-Height)
              </span>
              <span className="text-lg font-bold font-mono text-sky-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {task.effortHours}h
              </span>
            </div>
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            {task.assignee && (
              <div className="flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-lg">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Assignee: <strong className="text-slate-200">{task.assignee}</strong></span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-500" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Island Transfer */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mb-2 block flex items-center gap-1.5">
              <MoveRight className="w-3.5 h-3.5 text-slate-400" />
              Teleport / Move to Another Island:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(QUADRANTS) as QuadrantType[]).map((qKey) => {
                const qMeta = QUADRANTS[qKey];
                const isCurrent = task.quadrant === qKey;
                return (
                  <button
                    key={qKey}
                    disabled={isCurrent}
                    onClick={() => {
                      sound.playTeleport();
                      onMoveQuadrant(task.id, qKey);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 border ${
                      isCurrent
                        ? 'opacity-40 border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: qMeta.color }} />
                    <span className="truncate">{qMeta.action.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleEliminate}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminate Task
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onEdit(task);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>

            <button
              onClick={handleComplete}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                task.completed
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {task.completed ? 'Mark Incomplete' : 'Complete Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
