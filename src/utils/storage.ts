import { Task } from '../types';

export const INITIAL_TASKS: Task[] = [
  // Quadrant 1: Urgent & Important (Do immediately - due today, tomorrow, or in 3 days)
  {
    id: 't-1',
    title: 'CS 401: Distributed Algorithms Exam',
    description: 'Covers Paxos, Raft, Byzantine consensus, and vector clocks. Need 4 focused review hours.',
    quadrant: 'q1',
    urgency: 95,
    importance: 98,
    effortHours: 6.0,
    category: 'exam',
    assignee: 'Self',
    assignedDate: '2026-10-25',
    dueDate: '2026-11-23', // in 2 days!
    tags: ['Exam', 'CS401', 'HighPriority'],
    completed: false,
    createdAt: '2026-10-25T08:00:00Z'
  },
  {
    id: 't-2',
    title: 'Machine Learning Assignment 3: Transformer Model',
    description: 'Implement multi-head attention and position embeddings from scratch in PyTorch. Assigned 2 weeks ago.',
    quadrant: 'q1',
    urgency: 92,
    importance: 90,
    effortHours: 8.5,
    category: 'assignment',
    assignee: 'Self',
    assignedDate: '2026-11-07',
    dueDate: '2026-11-24', // in 3 days!
    tags: ['Assignment', 'PyTorch', 'ML'],
    completed: false,
    createdAt: '2026-11-07T14:30:00Z'
  },
  {
    id: 't-3',
    title: 'Submit Operating Systems Lab 4 (Overdue)',
    description: 'Virtual memory paging simulation & page replacement algorithms (LRU, Clock).',
    quadrant: 'q1',
    urgency: 99,
    importance: 88,
    effortHours: 3.5,
    category: 'assignment',
    assignee: 'Self',
    assignedDate: '2026-11-01',
    dueDate: '2026-11-20', // Overdue by 1 day!
    tags: ['Lab', 'OS', 'Urgent'],
    completed: false,
    createdAt: '2026-11-01T10:00:00Z'
  },

  // Quadrant 2: Important, Not Urgent (Schedule for Later - given weeks ago, due in 1-4 weeks)
  {
    id: 't-4',
    title: 'Final Capstone Project: Autonomous Drone Delivery App',
    description: 'System design, pathfinding simulation, and final presentation slides. Assigned a month ago.',
    quadrant: 'q2',
    urgency: 45,
    importance: 96,
    effortHours: 28.0,
    category: 'project',
    assignee: 'Team Alpha',
    assignedDate: '2026-10-20',
    dueDate: '2026-12-08', // in ~17 days
    tags: ['Capstone', 'Robotics', 'Team'],
    completed: false,
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 't-5',
    title: 'Advanced Database Systems Midterm Prep',
    description: 'B+ Tree indexing, ACID concurrency control, and query optimization chapters.',
    quadrant: 'q2',
    urgency: 35,
    importance: 90,
    effortHours: 14.0,
    category: 'exam',
    assignee: 'Self',
    assignedDate: '2026-11-10',
    dueDate: '2026-12-14', // in ~23 days
    tags: ['Exam', 'Databases', 'StudyBlock'],
    completed: false,
    createdAt: '2026-11-10T11:00:00Z'
  },
  {
    id: 't-6',
    title: 'Weekly Workout & Sleep Consistency Habit',
    description: 'Daily 7-hour sleep window and aerobic interval sessions to sustain cognitive stamina.',
    quadrant: 'q2',
    urgency: 20,
    importance: 85,
    effortHours: 10.0,
    category: 'personal',
    assignee: 'Self',
    assignedDate: '2026-11-01',
    dueDate: '2026-11-30',
    tags: ['Health', 'Routine'],
    completed: false,
    createdAt: '2026-11-01T08:00:00Z'
  },

  // Quadrant 3: Urgent, Not Important (Delegate)
  {
    id: 't-7',
    title: 'Format Reference Citations for Study Group Slides',
    description: 'Standardize IEEE bibliography references and upload PDF to shared drive.',
    quadrant: 'q3',
    urgency: 80,
    importance: 32,
    effortHours: 3.5,
    category: 'assignment',
    assignee: 'Alex (Study Partner)',
    assignedDate: '2026-11-19',
    dueDate: '2026-11-23', // in 2 days
    tags: ['Formatting', 'Slides'],
    completed: false,
    createdAt: '2026-11-19T09:00:00Z'
  },
  {
    id: 't-8',
    title: 'Reply to Student Council Equipment Request',
    description: 'Confirm available audio-visual projectors for Friday campus event.',
    quadrant: 'q3',
    urgency: 75,
    importance: 25,
    effortHours: 2.0,
    category: 'work',
    assignee: 'Secretary',
    assignedDate: '2026-11-20',
    dueDate: '2026-11-22', // tomorrow
    tags: ['Email', 'Admin'],
    completed: false,
    createdAt: '2026-11-20T16:00:00Z'
  },

  // Quadrant 4: Neither Urgent Nor Important (Eliminate)
  {
    id: 't-9',
    title: 'Color-Coding Terminal Themes & Wallpapers',
    description: 'Endlessly tweaking syntax highlight palettes and desktop widget transparency.',
    quadrant: 'q4',
    urgency: 15,
    importance: 10,
    effortHours: 5.0,
    category: 'personal',
    assignee: 'Self',
    assignedDate: '2026-11-18',
    dueDate: '',
    tags: ['Procrastination', 'Distraction'],
    completed: false,
    createdAt: '2026-11-18T18:00:00Z'
  },
  {
    id: 't-10',
    title: 'Browsing Campus Forum Drama Threads',
    description: 'Scrolling unverified course review debates instead of reviewing lecture notes.',
    quadrant: 'q4',
    urgency: 25,
    importance: 12,
    effortHours: 6.5,
    category: 'personal',
    assignee: 'Self',
    assignedDate: '2026-11-19',
    dueDate: '',
    tags: ['TimeSink'],
    completed: false,
    createdAt: '2026-11-19T20:00:00Z'
  }
];

const STORAGE_KEY = 'archipelago_eisenhower_tasks_v2';

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tasks from localStorage', err);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function resetToSampleTasks(): Task[] {
  saveTasks(INITIAL_TASKS);
  return INITIAL_TASKS;
}
