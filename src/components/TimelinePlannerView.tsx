import React, { useState, useMemo } from 'react';
import { Task, TaskCategory, CATEGORY_META, QUADRANTS, getDaysUntilDue, formatDeadlineBadge } from '../types';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus, Filter, Sparkles, BookOpen, ChevronRight, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface TimelinePlannerViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenCreateWithDate: (dateStr: string, category?: TaskCategory) => void;
  onToggleComplete: (taskId: string) => void;
}

export const TimelinePlannerView: React.FC<TimelinePlannerViewProps> = ({
  tasks,
  onSelectTask,
  onOpenCreateWithDate,
  onToggleComplete
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (hideCompleted && t.completed) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      return true;
    });
  }, [tasks, selectedCategory, hideCompleted]);

  // Group tasks into chronological coming days buckets
  const buckets = useMemo(() => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const tomorrow: Task[] = [];
    const next3Days: Task[] = [];
    const thisWeek: Task[] = [];
    const nextTwoWeeks: Task[] = [];
    const thisMonth: Task[] = [];
    const distant: Task[] = [];
    const noDeadline: Task[] = [];

    filteredTasks.forEach((t) => {
      const days = getDaysUntilDue(t.dueDate);
      if (days === null) {
        noDeadline.push(t);
      } else if (days < 0) {
        overdue.push(t);
      } else if (days === 0) {
        today.push(t);
      } else if (days === 1) {
        tomorrow.push(t);
      } else if (days <= 3) {
        next3Days.push(t);
      } else if (days <= 7) {
        thisWeek.push(t);
      } else if (days <= 14) {
        nextTwoWeeks.push(t);
      } else if (days <= 30) {
        thisMonth.push(t);
      } else {
        distant.push(t);
      }
    });

    // Sort by due date within buckets
    const sortByDueDate = (a: Task, b: Task) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    };

    return {
      overdue: overdue.sort(sortByDueDate),
      today: today.sort(sortByDueDate),
      tomorrow: tomorrow.sort(sortByDueDate),
      next3Days: next3Days.sort(sortByDueDate),
      thisWeek: thisWeek.sort(sortByDueDate),
      nextTwoWeeks: nextTwoWeeks.sort(sortByDueDate),
      thisMonth: thisMonth.sort(sortByDueDate),
      distant: distant.sort(sortByDueDate),
      noDeadline
    };
  }, [filteredTasks]);

  // Summary counts
  const urgentCount = buckets.overdue.length + buckets.today.length + buckets.tomorrow.length + buckets.next3Days.length;
  const midRangeCount = buckets.nextTwoWeeks.length + buckets.thisMonth.length;

  const renderTaskCard = (task: Task) => {
    const days = getDaysUntilDue(task.dueDate);
    const badge = formatDeadlineBadge(days);
    const qMeta = QUADRANTS[task.quadrant];
    const catMeta = CATEGORY_META[task.category] || CATEGORY_META.assignment;

    return (
      <div
        key={task.id}
        onClick={() => {
          sound.playClick();
          onSelectTask(task);
        }}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
          task.completed
            ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
            : badge.isUrgent
            ? 'bg-slate-900/90 hover:bg-slate-850 border-rose-900/50 hover:border-rose-500 shadow-lg shadow-rose-950/20'
            : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 hover:border-slate-600'
        }`}
      >
        <div>
          {/* Top metadata tags */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-800/80 text-slate-200 border border-slate-700/60 flex items-center gap-1">
                <span>{catMeta.icon}</span>
                <span>{catMeta.label}</span>
              </span>

              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase"
                style={{ backgroundColor: qMeta.accentBg, color: qMeta.color }}
              >
                {qMeta.action.split(' ')[0]}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              className={`p-1 rounded-md transition-colors ${
                task.completed
                  ? 'text-emerald-400'
                  : 'text-slate-500 hover:text-emerald-400'
              }`}
              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <h4 className={`text-sm font-bold text-slate-100 group-hover:text-white transition-colors ${
            task.completed ? 'line-through text-slate-400' : ''
          }`}>
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Bottom Deadline & Runway Info */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {/* Deadline badge */}
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.colorClass}`}>
              {badge.text}
            </span>
            {task.dueDate && (
              <span className="text-[11px] text-slate-400 font-mono">
                ({task.dueDate})
              </span>
            )}
          </div>

          {/* Effort hours */}
          <div className="flex items-center gap-1 font-mono text-sky-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{task.effortHours}h</span>
          </div>
        </div>

        {/* Assigned Date Runway Notice */}
        {task.assignedDate && (
          <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
            <span>Given on: {task.assignedDate}</span>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (
    title: string,
    subtitle: string,
    tasksList: Task[],
    headerColor: string,
    icon: React.ReactNode,
    defaultDateStr?: string
  ) => {
    if (tasksList.length === 0) return null;

    const totalHours = tasksList.reduce((acc, t) => acc + t.effortHours, 0);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${headerColor} text-white`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">{title}</h3>
                <span className="px-2 py-0.2 rounded-full bg-slate-800 text-xs text-slate-300 font-mono">
                  {tasksList.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Total: <strong className="text-sky-400">{totalHours.toFixed(1)}h</strong>
            </span>
            {defaultDateStr && (
              <button
                onClick={() => onOpenCreateWithDate(defaultDateStr)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title={`Add task for ${title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasksList.map(renderTaskCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              Coming Days & Deadline Radar
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Anti-Forgetfulness Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Never let distant assignments, exams, or projects sneak up on you. View your daily runway, upcoming milestones, and schedule study blocks well before deadlines hit crisis mode.
          </p>
        </div>

        {/* Quick Alert Stats */}
        <div className="flex items-center gap-3 shrink-0">
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/40 px-3.5 py-2 rounded-xl text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <strong className="block font-bold">{urgentCount} Tasks Due Soon</strong>
                <span className="text-[10px] text-rose-400">Due within 3 days or overdue</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-indigo-300 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <strong className="block font-bold">{midRangeCount} Mid-Range Horizons</strong>
              <span className="text-[10px] text-indigo-400">Due in 2 to 4 weeks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Category & Completion */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Filter by:
          </span>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Deadlines ({tasks.length})
          </button>

          {(Object.keys(CATEGORY_META) as TaskCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const isSelected = selectedCategory === cat;
            const count = tasks.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-600 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
            />
            <span>Hide completed</span>
          </label>
        </div>
      </div>

      {/* Chronological Sections */}
      <div className="space-y-8 pb-12">
        {/* Overdue */}
        {renderSection(
          '🚨 Overdue & Immediate Attention',
          'Past deadline! Resolve or officially re-negotiate these immediately to stop mental leakage.',
          buckets.overdue,
          'bg-rose-600',
          <AlertTriangle className="w-4 h-4" />
        )}

        {/* Due Today */}
        {renderSection(
          '⚡ Due Today (Imperative Completion)',
          'Today’s highest priority deliverables. Must be finalized before end of day.',
          buckets.today,
          'bg-rose-500',
          <Clock className="w-4 h-4" />
        )}

        {/* Due Tomorrow */}
        {renderSection(
          '🌅 Due Tomorrow',
          'Lock these in now so you don’t pull a panicked all-nighter tomorrow.',
          buckets.tomorrow,
          'bg-amber-600',
          <Calendar className="w-4 h-4" />
        )}

        {/* Next 3 Days */}
        {renderSection(
          '📅 Coming in 2 - 3 Days',
          'Imminent deliverables. Start drafting and refining today.',
          buckets.next3Days,
          'bg-amber-500',
          <Calendar className="w-4 h-4" />
        )}

        {/* This Week */}
        {renderSection(
          '🗓️ Coming in 4 - 7 Days (This Coming Week)',
          'Assignments and tests arriving later this week. Block out prep time now.',
          buckets.thisWeek,
          'bg-sky-600',
          <Calendar className="w-4 h-4" />
        )}

        {/* Next 1-2 Weeks */}
        {renderSection(
          '🚀 Coming in 8 - 14 Days (Next 2 Weeks)',
          'Mid-range assignments and exams. Great candidates for Q2 deep-work study sessions.',
          buckets.nextTwoWeeks,
          'bg-indigo-600',
          <BookOpen className="w-4 h-4" />
        )}

        {/* Next Month */}
        {renderSection(
          '🌱 Long-Range Horizons (15 - 30 Days Out)',
          'Big semester projects, term papers, and final exams given weeks ago. Keep them in sight!',
          buckets.thisMonth,
          'bg-emerald-600',
          <Award className="w-4 h-4" />
        )}

        {/* Distant */}
        {renderSection(
          '🔮 Distant Horizons (> 30 Days)',
          'Long-term goals and future semester milestones.',
          buckets.distant,
          'bg-slate-700',
          <Calendar className="w-4 h-4" />
        )}

        {/* Undated */}
        {renderSection(
          '📥 Backlog (No Deadline Set)',
          'Tasks without a specified target date. Consider adding a date to prevent procrastination.',
          buckets.noDeadline,
          'bg-slate-800',
          <Calendar className="w-4 h-4" />
        )}
      </div>
    </div>
  );
};
