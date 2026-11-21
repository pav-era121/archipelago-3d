import React, { useState, useEffect } from 'react';
import { Task, QuadrantType, TaskCategory, CATEGORY_META, QUADRANTS, getDaysUntilDue, computeAutoUrgency, formatDeadlineBadge } from '../types';
import { X, Sparkles, Clock, Calendar, BookmarkCheck, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  initialTask?: Task | null;
  defaultQuadrant?: QuadrantType;
  defaultDueDate?: string;
  defaultCategory?: TaskCategory;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultQuadrant = 'q1',
  defaultDueDate = '',
  defaultCategory = 'assignment'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('assignment');
  const [urgency, setUrgency] = useState(75);
  const [importance, setImportance] = useState(75);
  const [effortHours, setEffortHours] = useState(4.0);
  const [assignee, setAssignee] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [manualQuadrant, setManualQuadrant] = useState<QuadrantType | null>(null);
  const [autoEscalate, setAutoEscalate] = useState(true);

  // Calculate days remaining
  const daysRemaining = getDaysUntilDue(dueDate);
  const deadlineBadge = formatDeadlineBadge(daysRemaining);

  // Auto-calculated urgency and quadrant if enabled
  useEffect(() => {
    if (autoEscalate && dueDate) {
      const { urgency: dynamicUrgency, recommendedQuadrant } = computeAutoUrgency(daysRemaining, importance);
      setUrgency(dynamicUrgency);
      setManualQuadrant(recommendedQuadrant);
    }
  }, [dueDate, importance, autoEscalate, daysRemaining]);

  // Compute effective quadrant
  const autoQuadrant: QuadrantType =
    urgency >= 50
      ? importance >= 50
        ? 'q1'
        : 'q3'
      : importance >= 50
      ? 'q2'
      : 'q4';

  const effectiveQuadrant = manualQuadrant || autoQuadrant;
  const currentMeta = QUADRANTS[effectiveQuadrant];

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setCategory(initialTask.category || 'assignment');
      setUrgency(initialTask.urgency);
      setImportance(initialTask.importance);
      setEffortHours(initialTask.effortHours);
      setAssignee(initialTask.assignee || '');
      setAssignedDate(initialTask.assignedDate || '');
      setDueDate(initialTask.dueDate || '');
      setTagsInput(initialTask.tags.join(', '));
      setManualQuadrant(initialTask.quadrant);
      setAutoEscalate(false);
    } else {
      setTitle('');
      setDescription('');
      setCategory(defaultCategory);
      setAssignedDate(new Date().toISOString().split('T')[0]);
      setDueDate(defaultDueDate);
      setUrgency(defaultQuadrant === 'q1' || defaultQuadrant === 'q3' ? 80 : 30);
      setImportance(defaultQuadrant === 'q1' || defaultQuadrant === 'q2' ? 80 : 30);
      setEffortHours(4.0);
      setAssignee('');
      setTagsInput('');
      setManualQuadrant(defaultQuadrant);
      setAutoEscalate(true);
    }
  }, [initialTask, defaultQuadrant, defaultDueDate, defaultCategory, isOpen]);

  if (!isOpen) return null;

  // Preset Date Helper
  const setQuickDeadline = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const dateStr = d.toISOString().split('T')[0];
    setDueDate(dateStr);
    sound.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playClick();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description: description.trim(),
      quadrant: effectiveQuadrant,
      category,
      urgency,
      importance,
      effortHours: Math.max(0.25, Number(effortHours) || 1),
      assignee: assignee.trim() || undefined,
      assignedDate: assignedDate || undefined,
      dueDate: dueDate || undefined,
      tags,
      completed: initialTask ? initialTask.completed : false,
      completedAt: initialTask?.completedAt
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: currentMeta.color }}
            />
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialTask ? 'Edit Task Deliverable' : 'Create Task / Assignment / Exam'}
              </h2>
              <span className="text-xs text-slate-400">
                Target Island: <strong className="text-slate-200">{currentMeta.islandName}</strong> ({currentMeta.action})
              </span>
            </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Category Select Buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category Deliverable Type
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(CATEGORY_META) as TaskCategory[]).map((catKey) => {
                const meta = CATEGORY_META[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => {
                      sound.playClick();
                      setCategory(catKey);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base">{meta.icon}</span>
                    <span className="text-[11px] truncate w-full text-center">{meta.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Deliverable Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., CS 401 Final Exam Prep / Machine Learning Assignment 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description & Chapters / Rubric
            </label>
            <textarea
              rows={2}
              placeholder="Important notes, covered chapters, rubric links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            />
          </div>

          {/* Deadline Planning Section */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Target Completion Date & Deadline
              </span>
              {dueDate && (
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${deadlineBadge.colorClass}`}>
                  {deadlineBadge.text}
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setQuickDeadline(1)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDeadline(3)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setQuickDeadline(7)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
              >
                In 1 Week
              </button>
              <button
                type="button"
                onClick={() => setQuickDeadline(14)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
              >
                In 2 Weeks
              </button>
              <button
                type="button"
                onClick={() => setQuickDeadline(30)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
              >
                In 1 Month
              </button>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Given / Assigned Date
                </label>
                <input
                  type="date"
                  value={assignedDate}
                  onChange={(e) => setAssignedDate(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Due / Completion Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Auto-escalation switch */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={autoEscalate}
                  onChange={(e) => setAutoEscalate(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
                />
                <span className="font-medium">
                  Smart Urgency Auto-Escalation
                </span>
              </label>
              <span className="text-[10px] text-slate-400">
                Rises automatically as deadline approaches
              </span>
            </div>
          </div>

          {/* Matrix Coordinates (Urgency & Importance) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Priority Coordinates
              </span>
              <span
                className="px-2 py-0.5 rounded text-[11px] font-bold"
                style={{ backgroundColor: currentMeta.accentBg, color: currentMeta.color }}
              >
                Quadrant: {currentMeta.title}
              </span>
            </div>

            {/* Urgency Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Urgency Score</span>
                <span className="font-mono font-bold text-rose-400">{urgency}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={urgency}
                disabled={autoEscalate && !!dueDate}
                onChange={(e) => {
                  setAutoEscalate(false);
                  setUrgency(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-50"
              />
            </div>

            {/* Importance Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Importance Score (Grade Weight / Impact)</span>
                <span className="font-mono font-bold text-emerald-400">{importance}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={importance}
                onChange={(e) => setImportance(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Effort Hours & Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Estimated Effort (Hours) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="100"
                required
                value={effortHours}
                onChange={(e) => setEffortHours(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Maps to Z-Elevation in 3D Graph
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Assignee / Study Partner
              </label>
              <input
                type="text"
                placeholder="Self / Alex"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="Exam, CS401, FinalProject, Lab"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
            >
              {initialTask ? 'Save Changes' : 'Spawn Task into 3D Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
