import React from 'react';
import { X, HelpCircle, Compass, BarChart3, Layers, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Archipelago 3D & Spatial Analytics Guide</h2>
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

        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Section 1: The Eisenhower Matrix */}
          <div>
            <h3 className="font-bold text-white flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              1. The 4 Eisenhower Quadrants (The Islands)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-900/40">
                <span className="font-bold text-rose-400 block mb-1">
                  Q1: Crimson Forge — Do Immediately
                </span>
                <p className="text-slate-400">
                  Urgent & Important. Crises, production bugs, impending deadlines. Handle first to avoid catastrophic failure.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-900/40">
                <span className="font-bold text-emerald-400 block mb-1">
                  Q2: Emerald Oasis — Schedule for Later
                </span>
                <p className="text-slate-400">
                  Important, Not Urgent. High-leverage compounders: strategy, personal health, architecture, learning. The key to long-term success.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-900/40">
                <span className="font-bold text-amber-400 block mb-1">
                  Q3: Aether Dispatch — Delegate
                </span>
                <p className="text-slate-400">
                  Urgent, Not Important. Busywork, routine meetings, formatting. Delegate to team members, automate, or outsource.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-900/40">
                <span className="font-bold text-purple-400 block mb-1">
                  Q4: Abyssal Void — Eliminate
                </span>
                <p className="text-slate-400">
                  Neither Urgent nor Important. Mindless rabbit holes, trivial tweaks, distractions. Cut ruthlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Spatial 3D Analytics Graph */}
          <div>
            <h3 className="font-bold text-white flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              2. Reading the 3D Scatter & Cluster Graph
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Most task apps flatten your work into 2D checkboxes. This app projects your tasks into a 3D coordinate volume:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-rose-400 block">X-Axis</strong>
                <span className="text-slate-400 text-[11px]">Urgency (0 → 100)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-emerald-400 block">Y-Axis</strong>
                <span className="text-slate-400 text-[11px]">Importance (0 → 100)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-sky-400 block">Z-Height (Elevation)</strong>
                <span className="text-slate-400 text-[11px]">Actual Effort / Hours Logged</span>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
              <strong className="text-slate-200 block">What the Cluster Clouds Reveal:</strong>
              <p className="text-slate-400">
                • <strong>Effort Traps:</strong> If the Q3 (Delegate) or Q4 (Eliminate) cluster has high Z-height, you are pouring vital team hours into low-value noise.
              </p>
              <p className="text-slate-400">
                • <strong>Strategic ROI:</strong> High Z-height clusters in Q2 signify disciplined, compounding investments in your future.
              </p>
            </div>
          </div>

          {/* Section 3: Navigation Controls */}
          <div>
            <h3 className="font-bold text-white flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-amber-400" />
              3. 3D Camera & Interaction Controls
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-slate-200 block">Rotate / Orbit:</strong>
                <span>Left Click + Drag</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-slate-200 block">Pan Camera:</strong>
                <span>Right Click + Drag</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-slate-200 block">Zoom In / Out:</strong>
                <span>Mouse Scroll Wheel / Pinch</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
