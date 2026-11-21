export type QuadrantType = 'q1' | 'q2' | 'q3' | 'q4';

export type TaskCategory = 'assignment' | 'exam' | 'project' | 'work' | 'personal';

export interface QuadrantMeta {
  id: QuadrantType;
  title: string;
  action: string;
  subtitle: string;
  islandName: string;
  color: string;
  glowColor: string;
  accentBg: string;
  borderColor: string;
  position: [number, number, number];
  description: string;
  recommendedTimeShare: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: QuadrantType;
  urgency: number; // 0 - 100
  importance: number; // 0 - 100
  effortHours: number; // 0.5 - 50+ hours
  category: TaskCategory;
  assignee?: string;
  assignedDate?: string; // e.g. "2026-11-01" (when it was given)
  dueDate?: string; // e.g. "2026-11-24" (when it must be completed)
  tags: string[];
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export type ViewMode = 'archipelago' | 'graph3d' | 'matrix2d' | 'timeline';

export const QUADRANTS: Record<QuadrantType, QuadrantMeta> = {
  q1: {
    id: 'q1',
    title: 'Urgent & Important',
    action: 'DO IMMEDIATELY',
    subtitle: 'Crises, impending deadlines & today’s imperatives',
    islandName: 'Crimson Forge',
    color: '#ef4444',
    glowColor: '#f87171',
    accentBg: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    position: [7, 0, -7],
    description: 'Vital tasks demanding immediate action. Keep this list small to avoid burnout.',
    recommendedTimeShare: '20% - 25%'
  },
  q2: {
    id: 'q2',
    title: 'Important, Not Urgent',
    action: 'SCHEDULE FOR LATER',
    subtitle: 'Distant exams, long-term projects, study blocks & strategy',
    islandName: 'Emerald Oasis',
    color: '#10b981',
    glowColor: '#34d399',
    accentBg: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    position: [-7, 0, -7],
    description: 'The golden zone of advance planning. Schedule study blocks here before deadlines get urgent.',
    recommendedTimeShare: '60% - 70%'
  },
  q3: {
    id: 'q3',
    title: 'Urgent, Not Important',
    action: 'DELEGATE',
    subtitle: 'Interruptions, administrative chores & routine syncs',
    islandName: 'Aether Dispatch',
    color: '#f59e0b',
    glowColor: '#fbbf24',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    position: [7, 0, 7],
    description: 'Urgent items that do not build your core future. Delegate or streamline.',
    recommendedTimeShare: '10% - 15%'
  },
  q4: {
    id: 'q4',
    title: 'Neither Urgent Nor Important',
    action: 'ELIMINATE',
    subtitle: 'Procrastination, rabbit holes & low-value noise',
    islandName: 'Abyssal Void',
    color: '#a855f7',
    glowColor: '#c084fc',
    accentBg: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    position: [-7, 0, 7],
    description: 'Zero-value distractions. Eliminate without guilt.',
    recommendedTimeShare: '< 5%'
  }
};

export const CATEGORY_META: Record<TaskCategory, { label: string; icon: string; color: string }> = {
  assignment: { label: 'Assignment', icon: '📚', color: '#38bdf8' },
  exam: { label: 'Exam / Test', icon: '📝', color: '#f43f5e' },
  project: { label: 'Project Milestone', icon: '🚀', color: '#8b5cf6' },
  work: { label: 'Work', icon: '💼', color: '#f59e0b' },
  personal: { label: 'Personal', icon: '🌱', color: '#10b981' }
};

// Calculate days remaining from today (base date: current time)
export function getDaysUntilDue(dueDateStr?: string, referenceDate: Date = new Date()): number | null {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return null;

  // normalize to midnight to compare whole calendar days
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffMs = dueMidnight.getTime() - refMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export type DeadlineUrgencyTier = 'overdue' | 'today' | 'tomorrow' | 'within-3-days' | 'this-week' | 'next-week' | 'this-month' | 'distant' | 'none';

export function getDeadlineTier(days: number | null): DeadlineUrgencyTier {
  if (days === null) return 'none';
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 3) return 'within-3-days';
  if (days <= 7) return 'this-week';
  if (days <= 14) return 'next-week';
  if (days <= 30) return 'this-month';
  return 'distant';
}

export function formatDeadlineBadge(days: number | null): { text: string; colorClass: string; isUrgent: boolean } {
  if (days === null) {
    return { text: 'No Deadline', colorClass: 'text-slate-500 bg-slate-800/40', isUrgent: false };
  }
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      text: overdueDays === 1 ? 'Overdue 1 day!' : `Overdue ${overdueDays} days!`,
      colorClass: 'text-rose-300 bg-rose-500/20 border-rose-500/50 animate-pulse',
      isUrgent: true
    };
  }
  if (days === 0) {
    return { text: 'Due Today!', colorClass: 'text-rose-400 bg-rose-500/20 border-rose-500/60 font-bold', isUrgent: true };
  }
  if (days === 1) {
    return { text: 'Due Tomorrow', colorClass: 'text-amber-300 bg-amber-500/20 border-amber-500/50', isUrgent: true };
  }
  if (days <= 3) {
    return { text: `Due in ${days} days`, colorClass: 'text-amber-400 bg-amber-500/15 border-amber-500/40', isUrgent: true };
  }
  if (days <= 7) {
    return { text: `In ${days} days (This Week)`, colorClass: 'text-sky-300 bg-sky-500/15 border-sky-500/30', isUrgent: false };
  }
  if (days <= 14) {
    return { text: `In ${days} days (~2 wks)`, colorClass: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', isUrgent: false };
  }
  return { text: `In ${days} days`, colorClass: 'text-slate-300 bg-slate-800 border-slate-700', isUrgent: false };
}

// Smart Dynamic Urgency Escalation:
// Given a distant deadline (e.g. given a month ago), as time passes and the deadline approaches,
// its urgency dynamically rises so tasks automatically transition from Q2 (Schedule) into Q1 (Do Immediately).
export function computeAutoUrgency(days: number | null, baseImportance: number): { urgency: number; recommendedQuadrant: QuadrantType } {
  if (days === null) {
    return { urgency: 30, recommendedQuadrant: baseImportance >= 50 ? 'q2' : 'q4' };
  }

  let urgency = 20;
  if (days < 0) urgency = 99; // overdue!
  else if (days === 0) urgency = 98; // due today
  else if (days === 1) urgency = 92; // due tomorrow
  else if (days <= 3) urgency = 85;
  else if (days <= 7) urgency = 72;
  else if (days <= 14) urgency = 55;
  else if (days <= 21) urgency = 40;
  else urgency = 20; // distant

  const isUrgent = urgency >= 50;
  const isImportant = baseImportance >= 50;

  const quadrant: QuadrantType =
    isUrgent && isImportant
      ? 'q1'
      : !isUrgent && isImportant
      ? 'q2'
      : isUrgent && !isImportant
      ? 'q3'
      : 'q4';

  return { urgency, recommendedQuadrant: quadrant };
}
