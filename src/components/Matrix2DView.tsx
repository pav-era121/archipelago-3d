import React from 'react';
import { Task, QuadrantType, QUADRANTS } from '../types';
import { Plus, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface Matrix2DViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenCreate: (quadrant: QuadrantType) => void;
  onToggleComplete: (taskId: string) => void;
}

export const Matrix2DView: React.FC<Matrix2DViewProps> = ({
  tasks,
  onSelectTask,
  onOpenCreate,
  onToggleComplete
}) => {
  const tasksByQuadrant: Record<QuadrantType, Task[]> = {
    q1: tasks.filter((t) => t.quadrant === 'q1'),
    q2: tasks.filter((t) => t.quadrant === 'q2'),
    q3: tasks.filter((t) => t.quadrant === 'q3'),
    q4: tasks.filter((t) => t.quadrant === 'q4')
  };

  const renderQuadrantCard = (qKey: QuadrantType) => {
    const meta = QUADRANTS[qKey];
    const qTasks = tasksByQuadrant[qKey];
    const totalHours = qTasks.reduce((acc, t) => acc + t.effortHours, 0);

    return (
      <div
        key={qKey}
        className="flex flex-col bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden"
        style={{ borderTop: `4px solid ${meta.color}` }}
      >
        {/* Quadrant Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <h3 className="font-bold text-white text-sm">{meta.title}</h3>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{meta.action}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">{totalHours.toFixed(1)}h total</span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onOpenCreate(qKey);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Add task to this quadrant"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Task List */}
        <div className="p-3 flex-1 overflow-y-auto space-y-2.5 min-h-[220px]">
          {qTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
              <p>No tasks in this quadrant</p>
              <button
                onClick={() => onOpenCreate(qKey)}
                className="mt-2 text-indigo-400 hover:underline"
              >
                + Add first task
              </button>
            </div>
          ) : (
            qTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTask(t);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none group ${
                  t.completed
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/60 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-sm font-semibold text-slate-100 group-hover:text-white transition-colors ${
                      t.completed ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {t.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(t.id);
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      t.completed
                        ? 'text-emerald-400 hover:text-slate-400'
                        : 'text-slate-500 hover:text-emerald-400'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>

                {t.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {t.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{t.effortHours}h</span>
                    {t.assignee && (
                      <span className="text-slate-500 ml-1">@{t.assignee}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-rose-400">U:{t.urgency}</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-[10px] text-emerald-400">I:{t.importance}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto max-w-7xl mx-auto flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Eisenhower Matrix Overview</span>
          </h2>
          <p className="text-xs text-slate-400">
            Urgent vs. Important decision grid. Keep Q1 small, invest heavily in Q2, delegate Q3, and eliminate Q4.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {renderQuadrantCard('q1')}
        {renderQuadrantCard('q2')}
        {renderQuadrantCard('q3')}
        {renderQuadrantCard('q4')}
      </div>
    </div>
  );
};
