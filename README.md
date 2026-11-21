# Archipelago 3D: Eisenhower Matrix & Spatial Effort Analytics

A spatial 3D task prioritization and analytics application built with **React**, **Three.js / React Three Fiber (R3F)**, **Drei**, and **Tailwind CSS**.

---

## 🌟 Core Features

### 1. The Floating 4-Quadrant Archipelago (3D Scene)
Each quadrant of the classic Eisenhower Decision Matrix is manifested as a distinct thematic floating island in 3D space:
- 🌋 **Crimson Forge (Q1 - Do Immediately):** Urgent & Important tasks (crises, core deadlines, hotfixes).
- 🌿 **Emerald Oasis (Q2 - Schedule for Later):** Important, Not Urgent tasks (strategy, long-term compounders, self-care, architecture).
- 🛸 **Aether Dispatch (Q3 - Delegate):** Urgent, Not Important tasks (administrative requests, routine meetings, formatting).
- 🌌 **Abyssal Void (Q4 - Eliminate):** Neither Urgent nor Important (time-sinks, mindless distractions).

Tasks reside as **interactive 3D crystal totems** on each island, complete with effort badges, status indicators, and inspection popovers.

### 2. Time-Investment vs. Impact 3D Scatter & Cluster Graph
A spatial analytics mode that transforms standard flat task tracking into a 3D coordinate volume:
- **X-Axis:** Urgency Score (0 → 100)
- **Y-Axis:** Importance Score (0 → 100)
- **Z-Axis (Vertical Elevation):** Actual Effort / Hours Logged (0 → 40h+)
- **Drop-Pins:** Vertical 3D projection pins connect elevated task spheres to their ground-plane coordinates.
- **Volumetric Cluster Clouds:** Translucent 3D glowing hulls enclose tasks in each quadrant, calculating the center of gravity and total hours.
  - Instantly reveals **Effort Traps** (when high hours are dumped into Q3 or Q4).
  - Highlights **Strategic Compounding** (when high hours are allocated to Q2).

### 3. Comprehensive Task Management & Audio Synthesis
- **Dynamic Quadrant Recommendation:** Sliders for Urgency and Importance automatically suggest the target quadrant.
- **Zero-Dependency Web Audio Synth:** Real-time spatial sound effects for clicking, teleporting tasks between islands, completing goals, and disintegrating eliminated items.
- **2D Hybrid Kanban Board:** Quick list/card view for high-speed input and multi-task reviews.
- **Local Persistence:** All tasks and progress are stored safely in browser `localStorage`.

---

## 🚀 Running the App

```bash
# Navigate to the project directory
cd archipelago-eisenhower-3d

# Start the Vite development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🎮 Controls

- **Orbit / Rotate:** Left-click + drag
- **Pan Camera:** Right-click + drag
- **Zoom In / Out:** Mouse scroll wheel / Pinch
- **Inspect:** Click on any island, 3D totem, or cluster sphere
