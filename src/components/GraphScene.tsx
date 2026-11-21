import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Task, QuadrantType, QUADRANTS } from '../types';
import { sound } from '../utils/audio';

interface GraphSceneProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  filterQuadrant: QuadrantType | 'all';
}

// Convert 0..100 scores and effort hours to 3D Scene space
// X = Urgency (-10 to +10, center at 50)
// Z = Importance (-10 to +10, center at 50)
// Y = Effort Hours (0 to 12, max 40 hours)
export function mapTaskTo3D(urgency: number, importance: number, effortHours: number): [number, number, number] {
  const x = ((urgency - 50) / 50) * 10;
  const z = ((importance - 50) / 50) * 10;
  const clampedHours = Math.max(0.5, Math.min(45, effortHours));
  const y = (clampedHours / 40) * 12; // 0..40h -> 0..12 units
  return [x, y, z];
}

// Drop-pin line connecting floor to elevated 3D node
const TaskDropPin: React.FC<{
  position: [number, number, number];
  color: string;
  isHovered: boolean;
}> = ({ position, color, isHovered }) => {
  const [x, y, z] = position;
  const pinHeight = Math.max(0.01, y);

  return (
    <group>
      {/* Vertical Pin 3D Cylinder */}
      <mesh position={[x, pinHeight / 2, z]}>
        <cylinderGeometry args={[0.025, 0.025, pinHeight, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.9 : 0.35}
        />
      </mesh>

      {/* Ground Projection Circle */}
      <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.35, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.8 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// 3D Elevated Task Sphere Node
const TaskNode3D: React.FC<{
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ task, isSelected, onSelect }) => {
  const meta = QUADRANTS[task.quadrant];
  const [x, y, z] = mapTaskTo3D(task.urgency, task.importance, task.effortHours);
  const [hovered, setHovered] = React.useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = y + Math.sin(t * 2 + x) * 0.08;
    }
  });

  // Radius scales slightly with effort hours
  const sphereRadius = Math.max(0.35, Math.min(0.7, 0.3 + (task.effortHours / 40) * 0.35));

  return (
    <group position={[x, 0, z]}>
      {/* Drop Pin to ground */}
      <TaskDropPin position={[0, y, 0]} color={meta.color} isHovered={hovered || isSelected} />

      {/* Floating 3D Node Sphere */}
      <mesh
        ref={meshRef}
        position={[0, y, 0]}
        scale={isSelected ? [1.35, 1.35, 1.35] : hovered ? [1.2, 1.2, 1.2] : [1, 1, 1]}
        onClick={(e) => {
          e.stopPropagation();
          sound.playClick();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[sphereRadius, 24, 24]} />
        <meshStandardMaterial
          color={task.completed ? '#475569' : meta.color}
          emissive={task.completed ? '#1e293b' : meta.glowColor}
          emissiveIntensity={isSelected ? 1.9 : hovered ? 1.4 : 0.65}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Tooltip on Hover or Selection */}
      {(hovered || isSelected) && (
        <Html position={[0, y + 0.8, 0]} center distanceFactor={22} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="cursor-pointer bg-slate-900/95 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-slate-700 min-w-[200px] text-xs pointer-events-auto"
            style={{ borderLeft: `4px solid ${meta.color}` }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-slate-100 truncate">{task.title}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: meta.accentBg, color: meta.color }}
              >
                {task.quadrant.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Urgency</span>
                <span className="font-mono font-semibold text-rose-400">{task.urgency}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Importance</span>
                <span className="font-mono font-semibold text-emerald-400">{task.importance}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">Effort</span>
                <span className="font-mono font-semibold text-amber-400">{task.effortHours} hrs</span>
              </div>
            </div>
            {task.assignee && (
              <div className="mt-1.5 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Assignee:</span>
                <span className="text-slate-200 font-medium">{task.assignee}</span>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Quadrant Cluster Cloud (Volumetric translucent aura highlighting effort concentration)
const QuadrantClusterCloud: React.FC<{
  quadrant: QuadrantType;
  tasks: Task[];
}> = ({ quadrant, tasks }) => {
  const meta = QUADRANTS[quadrant];

  const cluster = useMemo(() => {
    if (tasks.length === 0) return null;

    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let totalHours = 0;

    tasks.forEach((t) => {
      const [x, y, z] = mapTaskTo3D(t.urgency, t.importance, t.effortHours);
      sumX += x;
      sumY += y;
      sumZ += z;
      totalHours += t.effortHours;
    });

    const count = tasks.length;
    const avgX = sumX / count;
    const avgY = sumY / count;
    const avgZ = sumZ / count;

    // Radius computed from variance
    let maxDist = 1.8;
    tasks.forEach((t) => {
      const [x, y, z] = mapTaskTo3D(t.urgency, t.importance, t.effortHours);
      const dist = Math.hypot(x - avgX, y - avgY, z - avgZ);
      if (dist > maxDist) maxDist = dist;
    });

    return {
      center: [avgX, avgY, avgZ] as [number, number, number],
      radius: Math.min(6, maxDist + 1.2),
      totalHours,
      count
    };
  }, [tasks]);

  const cloudRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (cloudRef.current) {
      const t = state.clock.getElapsedTime();
      cloudRef.current.rotation.y = t * 0.15;
    }
  });

  if (!cluster) return null;

  return (
    <group position={cluster.center}>
      {/* Translucent Cluster Sphere Envelope */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[cluster.radius, 16, 16]} />
        <meshStandardMaterial
          color={meta.color}
          transparent
          opacity={0.12}
          roughness={0.9}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cluster Centroid Label */}
      <Html position={[0, cluster.radius * 0.65, 0]} center distanceFactor={28}>
        <div
          className="px-2 py-1 rounded-md text-[10px] font-mono shadow-md backdrop-blur-md border border-slate-700/60 whitespace-nowrap"
          style={{ backgroundColor: meta.accentBg, color: meta.color }}
        >
          {meta.action}: {cluster.totalHours.toFixed(1)}h ({cluster.count} tasks)
        </div>
      </Html>
    </group>
  );
};

export const GraphScene: React.FC<GraphSceneProps> = ({
  tasks,
  onSelectTask,
  selectedTaskId,
  filterQuadrant
}) => {
  const visibleTasks = useMemo(() => {
    if (filterQuadrant === 'all') return tasks;
    return tasks.filter((t) => t.quadrant === filterQuadrant);
  }, [tasks, filterQuadrant]);

  const tasksByQuadrant = useMemo(() => {
    const map: Record<QuadrantType, Task[]> = { q1: [], q2: [], q3: [], q4: [] };
    visibleTasks.forEach((t) => {
      map[t.quadrant].push(t);
    });
    return map;
  }, [visibleTasks]);

  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        maxDistance={50}
        minDistance={8}
        maxPolarAngle={Math.PI / 2.05} // keep above ground
      />

      <ambientLight intensity={0.7} />
      <directionalLight position={[15, 30, 20]} intensity={1.2} />
      <directionalLight position={[-15, 10, -15]} intensity={0.4} color="#6366f1" />

      {/* 3D Base Quadrant Floor Grid (Eisenhower Matrix ground plane) */}
      <group position={[0, 0, 0]}>
        {/* Q1: Urgent (>50) & Important (>50) -> (+X, +Z) */}
        <mesh position={[5, 0, 5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>

        {/* Q2: Not Urgent (<50) & Important (>50) -> (-X, +Z) */}
        <mesh position={[-5, 0, 5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>

        {/* Q3: Urgent (>50) & Not Important (<50) -> (+X, -Z) */}
        <mesh position={[5, 0, -5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>

        {/* Q4: Not Urgent (<50) & Not Important (<50) -> (-X, -Z) */}
        <mesh position={[-5, 0, -5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>

        {/* Quadrant Ground Floor Labels */}
        <Text position={[5, 0.05, 5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.7} color="#ef4444" fillOpacity={0.6}>
          Q1: DO IMMEDIATELY
        </Text>
        <Text position={[-5, 0.05, 5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.7} color="#10b981" fillOpacity={0.6}>
          Q2: SCHEDULE (GROWTH)
        </Text>
        <Text position={[5, 0.05, -5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.7} color="#f59e0b" fillOpacity={0.6}>
          Q3: DELEGATE
        </Text>
        <Text position={[-5, 0.05, -5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.7} color="#a855f7" fillOpacity={0.6}>
          Q4: ELIMINATE
        </Text>

        {/* Grid Lines on Floor */}
        <gridHelper args={[20, 20, '#475569', '#1e293b']} position={[0, 0.01, 0]} />
      </group>

      {/* Axis Lines and Markings */}
      {/* X-Axis: URGENCY (Left = 0, Right = 100) */}
      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 21]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <Text position={[11, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#e2e8f0">
          Urgency: 100 →
        </Text>
        <Text position={[-11, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#94a3b8">
          ← Urgency: 0
        </Text>
      </group>

      {/* Z-Axis: IMPORTANCE (Front = 100, Back = 0) */}
      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 21]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        <Text position={[0, 0.1, 11]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#e2e8f0">
          Importance: 100 ↑
        </Text>
        <Text position={[0, 0.1, -11]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#94a3b8">
          ↓ Importance: 0
        </Text>
      </group>

      {/* Y-Axis: VERTICAL EFFORT HOURS TOWER (0h to 40h) */}
      <group position={[0, 6, 0]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Height rings for 10h, 20h, 30h, 40h */}
        {[10, 20, 30, 40].map((hours) => {
          const yPos = (hours / 40) * 12 - 6; // relative to center at 6
          return (
            <group key={hours} position={[0, yPos, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.15, 0.22, 16]} />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
              </mesh>
              <Text position={[0.7, 0, 0]} fontSize={0.35} color="#38bdf8">
                {hours}h Effort
              </Text>
            </group>
          );
        })}
      </group>

      {/* Volumetric Cluster Clouds per Quadrant */}
      {(Object.keys(QUADRANTS) as QuadrantType[]).map((qKey) => (
        <QuadrantClusterCloud key={qKey} quadrant={qKey} tasks={tasksByQuadrant[qKey]} />
      ))}

      {/* 3D Elevated Task Nodes */}
      {visibleTasks.map((task) => (
        <TaskNode3D
          key={task.id}
          task={task}
          isSelected={selectedTaskId === task.id}
          onSelect={() => onSelectTask(task)}
        />
      ))}
    </>
  );
};
