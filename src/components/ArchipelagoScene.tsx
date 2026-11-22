import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Task, QuadrantType, QUADRANTS, CATEGORY_META, getDaysUntilDue, formatDeadlineBadge } from '../types';
import { sound } from '../utils/audio';

interface ArchipelagoSceneProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  focusedQuadrant: QuadrantType | null;
  onFocusQuadrant: (quadrant: QuadrantType | null) => void;
  onQuickMoveTask: (taskId: string, targetQuadrant: QuadrantType) => void;
}

// Procedural Floating Island Geometry
const IslandMesh: React.FC<{
  type: QuadrantType;
  position: [number, number, number];
  isFocused: boolean;
  onSelect: () => void;
}> = ({ type, position, isFocused, onSelect }) => {
  const meta = QUADRANTS[type];
  const islandRef = useRef<THREE.Group>(null);

  // Subtle floating idle motion
  useFrame((state) => {
    if (islandRef.current) {
      const t = state.clock.getElapsedTime();
      const offset = type === 'q1' ? 0 : type === 'q2' ? 1.5 : type === 'q3' ? 3.0 : 4.5;
      islandRef.current.position.y = position[1] + Math.sin(t * 0.8 + offset) * 0.25;
    }
  });

  return (
    <group
      ref={islandRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        sound.playClick();
        onSelect();
      }}
    >
      {/* Island Base Rock (Inverted Cone / Plateau) */}
      <mesh castShadow receiveShadow position={[0, -0.6, 0]}>
        <cylinderGeometry args={[3.2, 0.4, 2.2, 8]} />
        <meshStandardMaterial
          color={type === 'q1' ? '#261b1b' : type === 'q2' ? '#1b2a22' : type === 'q3' ? '#28231a' : '#221b2b'}
          roughness={0.85}
          metalness={0.2}
          flatShading
        />
      </mesh>

      {/* Island Top Crust (Thematic surface) */}
      <mesh receiveShadow position={[0, 0.52, 0]}>
        <cylinderGeometry args={[3.25, 3.2, 0.25, 8]} />
        <meshStandardMaterial
          color={type === 'q1' ? '#3d1616' : type === 'q2' ? '#18472f' : type === 'q3' ? '#4a3b1d' : '#2d1947'}
          roughness={0.7}
        />
      </mesh>

      {/* Thematic Island Centerpiece Feature */}
      {type === 'q1' && (
        // Volcanic Lava Caldera & Crimson Spire
        <group position={[0, 0.65, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <torusGeometry args={[1.2, 0.2, 8, 16]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <circleGeometry args={[1.1, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color="#f87171"
              emissive="#ef4444"
              emissiveIntensity={1.2}
              wireframe
            />
          </mesh>
          <pointLight color="#ef4444" intensity={2.5} distance={6} />
        </group>
      )}

      {type === 'q2' && (
        // Emerald Crystal Monolith & Serene Haven
        <group position={[0, 0.65, 0]}>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[0.45, 1.8, 6]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
          {/* Surrounding mini crystals */}
          {[-0.8, 0.8].map((x, idx) => (
            <mesh key={idx} position={[x, 0.4, 0.3 * (idx === 0 ? 1 : -1)]} rotation={[0.2, 0.4 * idx, -0.2]}>
              <coneGeometry args={[0.2, 0.8, 5]} />
              <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.5} />
            </mesh>
          ))}
          <pointLight color="#10b981" intensity={2.2} distance={6} />
        </group>
      )}

      {type === 'q3' && (
        // Aether Dispatch Drone Beacon & Landing Rings
        <group position={[0, 0.65, 0]}>
          <mesh position={[0, 0.02, 0]}>
            <ringGeometry args={[0.8, 1.4, 16]} />
            <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.1, 0.18, 1.6, 6]} />
            <meshStandardMaterial color="#78350f" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.65, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={1.5} />
          </mesh>
          <pointLight color="#f59e0b" intensity={2.0} distance={6} />
        </group>
      )}

      {type === 'q4' && (
        // Cosmic Singularity / Void Rift Altar
        <group position={[0, 0.65, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <torusGeometry args={[0.9, 0.08, 12, 24]} />
            <meshStandardMaterial color="#c084fc" emissive="#8b5cf6" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial color="#090514" />
          </mesh>
          <pointLight color="#a855f7" intensity={2.2} distance={6} />
        </group>
      )}

      {/* Floating Island Label */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[0, 2.6, 0]}>
          <Text
            fontSize={0.42}
            color={meta.color}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
          >
            {meta.action}
          </Text>
          <Text
            position={[0, -0.38, 0]}
            fontSize={0.24}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            {meta.islandName}
          </Text>
        </group>
      </Float>

      {/* Focus Highlight Aura */}
      {isFocused && (
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.4, 3.7, 32]} />
          <meshBasicMaterial color={meta.color} side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

// 3D Task Totem / Crystal perched on an island
const TaskTotem: React.FC<{
  task: Task;
  index: number;
  total: number;
  islandPosition: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}> = ({ task, index, total, islandPosition, isSelected, onSelect }) => {
  const meta = QUADRANTS[task.quadrant];
  const catMeta = CATEGORY_META[task.category] || CATEGORY_META.assignment;
  const days = getDaysUntilDue(task.dueDate);
  const deadlineBadge = formatDeadlineBadge(days);
  const totemRef = useRef<THREE.Group>(null);

  // Position tasks in a pleasing ring around the island center
  const radius = total === 1 ? 1.6 : Math.min(2.2, 1.4 + total * 0.12);
  const angle = (index / Math.max(1, total)) * Math.PI * 2 + 0.3;
  const x = islandPosition[0] + Math.cos(angle) * radius;
  const z = islandPosition[2] + Math.sin(angle) * radius;
  const basePosY = islandPosition[1] + 0.65;

  useFrame((state) => {
    if (totemRef.current) {
      const t = state.clock.getElapsedTime();
      totemRef.current.position.y = basePosY + Math.sin(t * 1.5 + index * 0.7) * 0.12;
      totemRef.current.rotation.y = t * 0.5 + index;
    }
  });

  return (
    <group
      ref={totemRef}
      position={[x, basePosY, z]}
      onClick={(e) => {
        e.stopPropagation();
        sound.playClick();
        onSelect();
      }}
    >
      {/* 3D Crystal / Monolith */}
      <mesh castShadow scale={isSelected ? [1.35, 1.35, 1.35] : [1, 1, 1]}>
        <dodecahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial
          color={task.completed ? '#64748b' : deadlineBadge.isUrgent ? '#f43f5e' : meta.color}
          emissive={task.completed ? '#334155' : deadlineBadge.isUrgent ? '#ef4444' : meta.glowColor}
          emissiveIntensity={isSelected ? 1.9 : deadlineBadge.isUrgent ? 1.4 : 0.65}
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* Warning Alert Halo if Due Soon */}
      {deadlineBadge.isUrgent && !task.completed && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.52, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Floating 2.5D Badge Billboard */}
      <Html
        position={[0, 0.7, 0]}
        center
        distanceFactor={22}
        zIndexRange={[100, 0]}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onSelect();
          }}
          className={`cursor-pointer px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl backdrop-blur-md shadow-xl border transition-all duration-200 select-none whitespace-nowrap text-[11px] sm:text-xs flex flex-col gap-0.5 ${
            isSelected
              ? 'bg-slate-900/95 border-white text-white scale-110 ring-2 ring-white/50'
              : task.completed
              ? 'bg-slate-950/80 border-slate-700/60 text-slate-400 opacity-75'
              : deadlineBadge.isUrgent
              ? 'bg-slate-950/90 border-rose-500/80 text-white shadow-rose-950/40 ring-1 ring-rose-500/30'
              : 'bg-slate-950/85 hover:bg-slate-900 border-slate-700/70 hover:border-slate-500 text-slate-100'
          }`}
          style={{ borderColor: isSelected ? meta.color : undefined }}
        >
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="text-[10px] sm:text-xs">{catMeta.icon}</span>
            <span className={`font-semibold max-w-[100px] sm:max-w-[130px] truncate ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </span>
            <span className="px-1 py-0.2 rounded bg-slate-800 text-[9px] sm:text-[10px] text-slate-300 font-mono">
              {task.effortHours}h
            </span>
          </div>

          {/* Deadline Countdown Tag */}
          {task.dueDate && (
            <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] pt-0.5 border-t border-slate-800/80">
              <span className={`font-medium ${deadlineBadge.isUrgent ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                {deadlineBadge.text}
              </span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

export const ArchipelagoScene: React.FC<ArchipelagoSceneProps> = ({
  tasks,
  onSelectTask,
  selectedTaskId,
  focusedQuadrant,
  onFocusQuadrant
}) => {
  const controlsRef = useRef<any>(null);

  // Group tasks by quadrant
  const tasksByQuadrant = useMemo(() => {
    const map: Record<QuadrantType, Task[]> = { q1: [], q2: [], q3: [], q4: [] };
    tasks.forEach((t) => {
      map[t.quadrant].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        maxDistance={45}
        minDistance={8}
        maxPolarAngle={Math.PI / 2.05} // prevent going below sea level
      />

      {/* Atmospheric Lighting */}
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[15, 25, 12]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-15, 10, -12]} intensity={0.3} color="#60a5fa" />

      {/* Sky / Cloud Dust Layer */}
      <fog attach="fog" args={['#020617', 25, 55]} />

      {/* Central Ethereal Core / Void Center */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 12, 32]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 4 Thematic Floating Islands */}
      {(Object.keys(QUADRANTS) as QuadrantType[]).map((qKey) => {
        const meta = QUADRANTS[qKey];
        return (
          <IslandMesh
            key={qKey}
            type={qKey}
            position={meta.position}
            isFocused={focusedQuadrant === qKey}
            onSelect={() => {
              if (focusedQuadrant === qKey) {
                onFocusQuadrant(null);
              } else {
                onFocusQuadrant(qKey);
              }
            }}
          />
        );
      })}

      {/* 3D Task Totems Perched on Each Island */}
      {(Object.keys(tasksByQuadrant) as QuadrantType[]).map((qKey) => {
        const islandMeta = QUADRANTS[qKey];
        const islandTasks = tasksByQuadrant[qKey];

        return islandTasks.map((task, idx) => (
          <TaskTotem
            key={task.id}
            task={task}
            index={idx}
            total={islandTasks.length}
            islandPosition={islandMeta.position}
            isSelected={selectedTaskId === task.id}
            onSelect={() => onSelectTask(task)}
          />
        ));
      })}
    </>
  );
};
