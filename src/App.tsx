import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Task, QuadrantType, ViewMode, TaskCategory } from './types';
import { loadTasks, saveTasks, resetToSampleTasks } from './utils/storage';
import { sound } from './utils/audio';
import { ArchipelagoScene } from './components/ArchipelagoScene';
import { GraphScene } from './components/GraphScene';
import { Matrix2DView } from './components/Matrix2DView';
import { TimelinePlannerView } from './components/TimelinePlannerView';
import { Navbar } from './components/Navbar';
import { AnalyticsHUD } from './components/AnalyticsHUD';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { HelpModal } from './components/HelpModal';
import { Move, MousePointerClick } from 'lucide-react';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('archipelago');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultQuadrant, setDefaultQuadrant] = useState<QuadrantType>('q1');
  const [defaultDueDate, setDefaultDueDate] = useState<string>('');
  const [defaultCategory, setDefaultCategory] = useState<TaskCategory>('assignment');
  const [focusedQuadrant, setFocusedQuadrant] = useState<QuadrantType | null>(null);
  const [filterQuadrant, setFilterQuadrant] = useState<QuadrantType | 'all'>('all');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  // Task Operations
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      const updated = tasks.map((t) =>
        t.id === editingTask.id ? { ...t, ...taskData } : t
      );
      updateTasks(updated);
      setSelectedTask(updated.find((t) => t.id === editingTask.id) || null);
      setEditingTask(null);
    } else {
      const newTask: Task = {
        ...taskData,
        id: `t-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      updateTasks([newTask, ...tasks]);
      sound.playTeleport();
    }
  };

  const handleToggleComplete = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    updateTasks(updated);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated.find((t) => t.id === taskId) || null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    updateTasks(updated);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleMoveQuadrant = (taskId: string, targetQuadrant: QuadrantType) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, quadrant: targetQuadrant };
      }
      return t;
    });
    updateTasks(updated);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(updated.find((t) => t.id === taskId) || null);
    }
  };

  const handleResetData = () => {
    const reset = resetToSampleTasks();
    setTasks(reset);
    setSelectedTask(null);
    sound.playComplete();
  };

  const handleOpenCreateWithDate = (dateStr: string, category: TaskCategory = 'assignment') => {
    setEditingTask(null);
    setDefaultDueDate(dateStr);
    setDefaultCategory(category);
    setIsCreateOpen(true);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Navigation & Mobile Bottom Bar */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedTask(null);
        }}
        onOpenCreate={() => {
          setEditingTask(null);
          setDefaultQuadrant('q1');
          setDefaultDueDate('');
          setDefaultCategory('assignment');
          setIsCreateOpen(true);
        }}
        onResetData={handleResetData}
        onOpenHelp={() => setIsHelpOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          sound.setMuted(next);
        }}
        tasks={tasks}
      />

      {/* Main View Area */}
      {currentView === 'timeline' ? (
        <div className="pt-14 md:pt-20 pb-16 md:pb-0 h-full overflow-y-auto">
          <TimelinePlannerView
            tasks={tasks}
            onSelectTask={(task) => setSelectedTask(task)}
            onOpenCreateWithDate={handleOpenCreateWithDate}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      ) : currentView === 'matrix2d' ? (
        <div className="pt-14 md:pt-20 pb-16 md:pb-0 h-full overflow-y-auto">
          <Matrix2DView
            tasks={tasks}
            onSelectTask={(task) => setSelectedTask(task)}
            onOpenCreate={(quadrant) => {
              setEditingTask(null);
              setDefaultQuadrant(quadrant);
              setDefaultDueDate('');
              setIsCreateOpen(true);
            }}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      ) : (
        <div className="w-full h-full pb-14 md:pb-0 touch-none">
          <Canvas
            shadows
            style={{ touchAction: 'none' }}
            camera={{
              position: currentView === 'graph3d' ? [18, 16, 22] : [0, 18, 28],
              fov: 45
            }}
            gl={{ antialias: true }}
          >
            {currentView === 'archipelago' ? (
              <ArchipelagoScene
                tasks={tasks}
                onSelectTask={(task) => setSelectedTask(task)}
                selectedTaskId={selectedTask?.id}
                focusedQuadrant={focusedQuadrant}
                onFocusQuadrant={(quadrant) => setFocusedQuadrant(quadrant)}
                onQuickMoveTask={handleMoveQuadrant}
              />
            ) : (
              <GraphScene
                tasks={tasks}
                onSelectTask={(task) => setSelectedTask(task)}
                selectedTaskId={selectedTask?.id}
                filterQuadrant={filterQuadrant}
              />
            )}
          </Canvas>

          {/* Right Floating Collapsible Analytics HUD */}
          <AnalyticsHUD
            tasks={tasks}
            filterQuadrant={filterQuadrant}
            onFilterChange={setFilterQuadrant}
            isGraphMode={currentView === 'graph3d'}
          />

          {/* Bottom Left 3D Viewport Controls Hint (Hidden on mobile) */}
          <div className="hidden sm:flex absolute bottom-5 left-5 z-20 items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <Move className="w-3 h-3 text-indigo-400" />
              <span>Drag to Orbit</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Pinch to Zoom</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-3 h-3 text-sky-400" />
              <span>Click to Inspect</span>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultQuadrant={defaultQuadrant}
        defaultDueDate={defaultDueDate}
        defaultCategory={defaultCategory}
      />

      {/* Task Detail Inspector Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDeleteTask}
        onEdit={(task) => {
          setSelectedTask(null);
          setEditingTask(task);
          setIsCreateOpen(true);
        }}
        onMoveQuadrant={handleMoveQuadrant}
      />

      {/* Guide / Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
