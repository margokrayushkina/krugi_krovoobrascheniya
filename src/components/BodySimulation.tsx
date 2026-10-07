import { useState, useRef, useEffect, useCallback } from 'react';
import { organData, OrganInfo } from '../data';
import { InfoPanel } from './InfoPanel';
import { ControlPanel } from './ControlPanel';

interface BodySimulationProps {
  onOpenGlossary: () => void;
  onOpenQuiz: () => void;
}

interface Particle {
  id: number;
  progress: number;
  pathIndex: number;
  speed: number;
  oxygenated: boolean;
}

// Path definitions (normalized coordinates 0-1, matching SVG viewBox 0 0 100 100)
const bloodPaths = [
  // Small circle: Right Ventricle → Lungs → Left Atrium
  { 
    points: [
      {x: 46, y: 52}, // right ventricle
      {x: 44, y: 44}, // up
      {x: 40, y: 36}, // to left lung
      {x: 35, y: 32}, // lung
      {x: 38, y: 36}, // from lung
      {x: 48, y: 40}, // pulmonary veins
      {x: 54, y: 42}, // left atrium
    ],
    startOxygenated: false,
    changeAt: 0.45,
  },
  // Small circle right side
  {
    points: [
      {x: 46, y: 52},
      {x: 48, y: 44},
      {x: 55, y: 36},
      {x: 62, y: 32},
      {x: 60, y: 36},
      {x: 55, y: 40},
      {x: 54, y: 42},
    ],
    startOxygenated: false,
    changeAt: 0.45,
  },
  // Large circle: Left Ventricle → Brain → back
  {
    points: [
      {x: 56, y: 52}, // left ventricle
      {x: 58, y: 44}, // aorta up
      {x: 56, y: 34}, // up
      {x: 52, y: 20}, // to brain
      {x: 50, y: 14}, // brain
      {x: 52, y: 20}, // from brain
      {x: 54, y: 30}, // down
      {x: 50, y: 40}, // back
      {x: 46, y: 44}, // right atrium
    ],
    startOxygenated: true,
    changeAt: 0.5,
  },
  // Large circle: Left Ventricle → Right arm
  {
    points: [
      {x: 56, y: 50},
      {x: 60, y: 44},
      {x: 66, y: 42},
      {x: 72, y: 46},
      {x: 78, y: 54},
      {x: 76, y: 58},
      {x: 70, y: 54},
      {x: 64, y: 50},
      {x: 58, y: 48},
      {x: 50, y: 46},
      {x: 46, y: 44},
    ],
    startOxygenated: true,
    changeAt: 0.5,
  },
  // Large circle: Left Ventricle → Left arm
  {
    points: [
      {x: 54, y: 50},
      {x: 48, y: 44},
      {x: 40, y: 42},
      {x: 32, y: 46},
      {x: 26, y: 54},
      {x: 28, y: 58},
      {x: 34, y: 54},
      {x: 40, y: 50},
      {x: 46, y: 48},
      {x: 48, y: 46},
    ],
    startOxygenated: true,
    changeAt: 0.5,
  },
  // Large circle: Left Ventricle → Legs → back
  {
    points: [
      {x: 54, y: 55},
      {x: 52, y: 62},
      {x: 50, y: 70},
      {x: 48, y: 78},
      {x: 44, y: 86},
      {x: 42, y: 92},
      {x: 44, y: 86},
      {x: 46, y: 78},
      {x: 48, y: 70},
      {x: 48, y: 62},
      {x: 47, y: 50},
      {x: 46, y: 44},
    ],
    startOxygenated: true,
    changeAt: 0.55,
  },
  // Large circle: Left Ventricle → Organs → back
  {
    points: [
      {x: 56, y: 54},
      {x: 58, y: 58},
      {x: 62, y: 60},
      {x: 60, y: 65},
      {x: 56, y: 68},
      {x: 52, y: 72},
      {x: 50, y: 68},
      {x: 48, y: 62},
      {x: 47, y: 55},
      {x: 46, y: 48},
    ],
    startOxygenated: true,
    changeAt: 0.5,
  },
];

function interpolatePath(points: {x: number; y: number}[], progress: number) {
  const totalSegments = points.length - 1;
  const segmentProgress = progress * totalSegments;
  const segIdx = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const segFrac = segmentProgress - segIdx;
  
  const p1 = points[segIdx];
  const p2 = points[Math.min(segIdx + 1, points.length - 1)];
  
  return {
    x: p1.x + (p2.x - p1.x) * segFrac,
    y: p1.y + (p2.y - p1.y) * segFrac,
  };
}

export function BodySimulation({ onOpenGlossary, onOpenQuiz }: BodySimulationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganInfo | null>(null);
  const [heartbeatPhase, setHeartbeatPhase] = useState(0);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(isPaused);
  const speedRef = useRef(speed);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    const particlesPerPath = 8;
    let id = 0;
    
    for (let pathIdx = 0; pathIdx < bloodPaths.length; pathIdx++) {
      for (let i = 0; i < particlesPerPath; i++) {
        newParticles.push({
          id: id++,
          progress: i / particlesPerPath,
          pathIndex: pathIdx,
          speed: 0.003 + Math.random() * 0.001,
          oxygenated: bloodPaths[pathIdx].startOxygenated,
        });
      }
    }
    setParticles(newParticles);
  }, []);

  // Heartbeat sound
  const playHeartbeat = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    // Resume AudioContext if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(60, now);
    osc1.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(50, now + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(25, now + 0.3);
    gain2.gain.setValueAtTime(0.2, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.35);
  }, []);

  useEffect(() => {
    if (soundEnabled && !isPaused) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
          playHeartbeat();
        }
      }, 1000);
    }
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [soundEnabled, isPaused, playHeartbeat]);

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPausedRef.current) {
        // Heartbeat visual
        setHeartbeatPhase(prev => (prev + delta * 0.004) % (Math.PI * 2));

        setParticles(prev => prev.map(p => {
          let newProgress = p.progress + p.speed * speedRef.current * (delta / 16);
          let newOxygenated = p.oxygenated;
          
          if (newProgress >= 1) {
            newProgress -= 1;
          }
          
          const path = bloodPaths[p.pathIndex];
          if (newProgress >= path.changeAt && p.progress < path.changeAt) {
            newOxygenated = !path.startOxygenated;
          }
          if (newProgress < 0.05 && p.progress > 0.9) {
            newOxygenated = path.startOxygenated;
          }
          
          return { ...p, progress: newProgress, oxygenated: newOxygenated };
        }));
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleOrganClick = (organId: string) => {
    const organ = organData[organId];
    if (organ) {
      setSelectedOrgan(organ);
    }
  };

  const heartScale = 1 + Math.sin(heartbeatPhase) * 0.03;

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3e] to-[#0d1b2a]">
      {/* Title */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
          🫀 Кровообращение человека
        </h1>
        <p className="text-xs md:text-sm text-blue-300 mt-1">Нажимай на органы, чтобы узнать о них!</p>
      </div>

      {/* Legend */}
      <div className="absolute top-14 right-4 z-20 bg-black/40 backdrop-blur-sm rounded-lg p-2 md:p-3 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#FF4444] shadow-[0_0_6px_#FF4444]"></div>
          <span className="text-xs md:text-sm text-white">Артериальная кровь (O₂)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4444FF] shadow-[0_0_6px_#4444FF]"></div>
          <span className="text-xs md:text-sm text-white">Венозная кровь (CO₂)</span>
        </div>
      </div>

      {/* Main SVG */}
      <div className="flex-1 relative overflow-hidden">
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="bodyGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#2a2a4a" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background glow */}
          <rect x="0" y="0" width="100" height="100" fill="url(#bodyGlow)"/>

          {/* Body outline */}
          <g opacity="0.25">
            {/* Head */}
            <ellipse cx="50" cy="14" rx="7" ry="8" fill="#d4a574" stroke="#8B6914" strokeWidth="0.3"/>
            {/* Neck */}
            <rect x="47" y="21" width="6" height="4" fill="#d4a574" stroke="#8B6914" strokeWidth="0.2"/>
            {/* Torso */}
            <path d="M 38 25 Q 35 35 36 50 Q 37 65 40 75 L 60 75 Q 63 65 64 50 Q 65 35 62 25 Z" 
                  fill="#d4a574" stroke="#8B6914" strokeWidth="0.3" opacity="0.5"/>
            {/* Left arm */}
            <path d="M 38 27 Q 30 30 24 40 Q 20 50 22 58 Q 23 62 25 60 Q 28 52 32 42 Q 35 35 38 32" 
                  fill="#d4a574" stroke="#8B6914" strokeWidth="0.3" opacity="0.4"/>
            {/* Right arm */}
            <path d="M 62 27 Q 70 30 76 40 Q 80 50 78 58 Q 77 62 75 60 Q 72 52 68 42 Q 65 35 62 32" 
                  fill="#d4a574" stroke="#8B6914" strokeWidth="0.3" opacity="0.4"/>
            {/* Left leg */}
            <path d="M 42 75 Q 40 82 39 90 Q 38 95 40 97 Q 42 97 43 95 Q 44 88 45 80 Q 46 76 46 75" 
                  fill="#d4a574" stroke="#8B6914" strokeWidth="0.3" opacity="0.4"/>
            {/* Right leg */}
            <path d="M 58 75 Q 60 82 61 90 Q 62 95 60 97 Q 58 97 57 95 Q 56 88 55 80 Q 54 76 54 75" 
                  fill="#d4a574" stroke="#8B6914" strokeWidth="0.3" opacity="0.4"/>
          </g>

          {/* Blood vessels */}
          <g opacity="0.5" filter="url(#glow)">
            {/* Aorta */}
            <path d="M 56 52 Q 58 44 56 34 Q 53 22 50 16" fill="none" stroke="#FF4444" strokeWidth="0.7" opacity="0.6"/>
            {/* Pulmonary artery */}
            <path d="M 46 50 Q 43 42 38 34 Q 35 30 34 30" fill="none" stroke="#4444FF" strokeWidth="0.7" opacity="0.6"/>
            <path d="M 46 50 Q 50 42 58 34 Q 62 30 64 30" fill="none" stroke="#4444FF" strokeWidth="0.7" opacity="0.6"/>
            {/* Vena cava */}
            <path d="M 46 44 Q 45 52 46 62 Q 46 72 46 78" fill="none" stroke="#4444FF" strokeWidth="0.5" opacity="0.5"/>
            {/* To arms */}
            <path d="M 58 44 Q 65 42 72 46 Q 78 52 78 56" fill="none" stroke="#FF4444" strokeWidth="0.4" opacity="0.5"/>
            <path d="M 42 44 Q 35 42 28 46 Q 22 52 22 56" fill="none" stroke="#FF4444" strokeWidth="0.4" opacity="0.5"/>
            {/* To organs */}
            <path d="M 56 56 Q 60 58 62 60" fill="none" stroke="#FF4444" strokeWidth="0.4" opacity="0.5"/>
            <path d="M 56 60 Q 56 65 54 68" fill="none" stroke="#FF4444" strokeWidth="0.4" opacity="0.5"/>
            {/* To legs */}
            <path d="M 50 72 Q 46 80 42 88" fill="none" stroke="#FF4444" strokeWidth="0.4" opacity="0.5"/>
            <path d="M 50 72 Q 54 80 58 88" fill="none" stroke="#FF4444" strokeWidth="0.4" opacity="0.5"/>
            {/* From legs back */}
            <path d="M 42 88 Q 44 80 46 72 Q 46 62 46 50" fill="none" stroke="#4444FF" strokeWidth="0.4" opacity="0.5"/>
            <path d="M 58 88 Q 56 80 54 72 Q 50 62 48 50" fill="none" stroke="#4444FF" strokeWidth="0.4" opacity="0.5"/>
          </g>

          {/* Heart */}
          <g transform={`translate(50, 49) scale(${heartScale}) translate(-50, -49)`}>
            {/* Heart outline */}
            <path d="M 50 38 Q 42 36 40 42 Q 38 48 42 54 Q 46 58 50 60 Q 54 58 58 54 Q 62 48 60 42 Q 58 36 50 38 Z" 
                  fill="#6B0000" stroke="#3a0000" strokeWidth="0.5"/>
            {/* Divider */}
            <line x1="50" y1="38" x2="50" y2="60" stroke="#2a0000" strokeWidth="0.4"/>
            <line x1="40" y1="49" x2="60" y2="49" stroke="#2a0000" strokeWidth="0.4"/>
            
            {/* Right Atrium */}
            <rect x="41" y="39" width="8.5" height="9.5" fill="#4444FF" opacity="0.7" rx="1.5"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => handleOrganClick('rightAtrium')}/>
            
            {/* Right Ventricle */}
            <rect x="41" y="49.5" width="8.5" height="9" fill="#3333CC" opacity="0.7" rx="1.5"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => handleOrganClick('rightVentricle')}/>
            
            {/* Left Atrium */}
            <rect x="50.5" y="39" width="8.5" height="9.5" fill="#FF4444" opacity="0.7" rx="1.5"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => handleOrganClick('leftAtrium')}/>
            
            {/* Left Ventricle */}
            <rect x="50.5" y="49.5" width="8.5" height="9" fill="#CC2222" opacity="0.7" rx="1.5"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => handleOrganClick('leftVentricle')}/>
            
            {/* Heart labels */}
            {showLabels && (
              <g>
                <text x="45" y="45" textAnchor="middle" fontSize="2.2" fill="white" fontWeight="bold" pointerEvents="none">ПП</text>
                <text x="45" y="55" textAnchor="middle" fontSize="2.2" fill="white" fontWeight="bold" pointerEvents="none">ПЖ</text>
                <text x="55" y="45" textAnchor="middle" fontSize="2.2" fill="white" fontWeight="bold" pointerEvents="none">ЛП</text>
                <text x="55" y="55" textAnchor="middle" fontSize="2.2" fill="white" fontWeight="bold" pointerEvents="none">ЛЖ</text>
              </g>
            )}
          </g>

          {/* Organs */}
          {/* Brain */}
          <g className="cursor-pointer" onClick={() => handleOrganClick('brain')}>
            <ellipse cx="50" cy="13" rx="5.5" ry="4.5" fill="#FFB6C1" opacity="0.6" 
                     className="hover:opacity-100 transition-opacity"/>
            <path d="M 46 12 Q 48 10 50 12 Q 52 10 54 12" fill="none" stroke="#cc8899" strokeWidth="0.3"/>
            {showLabels && <text x="50" y="8" textAnchor="middle" fontSize="2.5" fill="white" fontWeight="bold" className="drop-shadow">Мозг</text>}
          </g>

          {/* Lungs */}
          <g className="cursor-pointer" onClick={() => handleOrganClick('lungs')}>
            <ellipse cx="36" cy="36" rx="5" ry="7" fill="#FFB6C1" opacity="0.5" 
                     className="hover:opacity-90 transition-opacity"/>
            <ellipse cx="64" cy="36" rx="5" ry="7" fill="#FFB6C1" opacity="0.5" 
                     className="hover:opacity-90 transition-opacity"/>
            {showLabels && <text x="36" y="37" textAnchor="middle" fontSize="2.2" fill="white" fontWeight="bold" className="drop-shadow">Лёгкое</text>}
            {showLabels && <text x="64" y="37" textAnchor="middle" fontSize="2.2" fill="white" fontWeight="bold" className="drop-shadow">Лёгкое</text>}
          </g>

          {/* Liver */}
          <g className="cursor-pointer" onClick={() => handleOrganClick('liver')}>
            <path d="M 55 57 Q 60 56 64 58 Q 65 61 62 62 Q 58 63 55 61 Z" fill="#8B4513" opacity="0.7" 
                  className="hover:opacity-100 transition-opacity"/>
            {showLabels && <text x="60" y="60" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold" className="drop-shadow">Печень</text>}
          </g>

          {/* Kidneys */}
          <g className="cursor-pointer" onClick={() => handleOrganClick('kidneys')}>
            <ellipse cx="42" cy="63" rx="2.5" ry="3.5" fill="#8B0000" opacity="0.6" 
                     className="hover:opacity-100 transition-opacity"/>
            <ellipse cx="58" cy="63" rx="2.5" ry="3.5" fill="#8B0000" opacity="0.6" 
                     className="hover:opacity-100 transition-opacity"/>
            {showLabels && <text x="42" y="68" textAnchor="middle" fontSize="1.8" fill="white" fontWeight="bold" className="drop-shadow">Почка</text>}
            {showLabels && <text x="58" y="68" textAnchor="middle" fontSize="1.8" fill="white" fontWeight="bold" className="drop-shadow">Почка</text>}
          </g>

          {/* Intestines */}
          <g className="cursor-pointer" onClick={() => handleOrganClick('intestines')}>
            <ellipse cx="50" cy="70" rx="6" ry="3" fill="#DEB887" opacity="0.5" 
                     className="hover:opacity-90 transition-opacity"/>
            <path d="M 45 69 Q 47 71 50 69 Q 53 71 55 69" fill="none" stroke="#aa8855" strokeWidth="0.3"/>
            {showLabels && <text x="50" y="74" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold" className="drop-shadow">Кишечник</text>}
          </g>

          {/* Muscles (legs) */}
          <g className="cursor-pointer" onClick={() => handleOrganClick('muscles')}>
            <rect x="38" y="78" width="4" height="10" rx="2" fill="#CD5C5C" opacity="0.5" 
                  className="hover:opacity-90 transition-opacity"/>
            <rect x="58" y="78" width="4" height="10" rx="2" fill="#CD5C5C" opacity="0.5" 
                  className="hover:opacity-90 transition-opacity"/>
            {showLabels && <text x="40" y="93" textAnchor="middle" fontSize="1.8" fill="white" fontWeight="bold" className="drop-shadow">Мышцы</text>}
            {showLabels && <text x="60" y="93" textAnchor="middle" fontSize="1.8" fill="white" fontWeight="bold" className="drop-shadow">Мышцы</text>}
          </g>

          {/* Circle labels */}
          {showLabels && (
            <g>
              <text x="22" y="50" textAnchor="middle" fontSize="2.3" fill="#88aaff" fontWeight="bold" opacity="0.8">
                Малый круг
              </text>
              <text x="78" y="50" textAnchor="middle" fontSize="2.3" fill="#ff8888" fontWeight="bold" opacity="0.8">
                Большой круг
              </text>
            </g>
          )}

          {/* Blood particles */}
          {particles.map(particle => {
            const path = bloodPaths[particle.pathIndex];
            const pos = interpolatePath(path.points, particle.progress);
            const color = particle.oxygenated ? '#FF4444' : '#4444FF';
            const glowColor = particle.oxygenated ? 'rgba(255,68,68,0.6)' : 'rgba(68,68,255,0.6)';
            
            return (
              <g key={particle.id}>
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r="1.2" 
                  fill={color}
                  opacity="0.9"
                  style={{ filter: `drop-shadow(0 0 1.5px ${glowColor})` }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info Panel */}
      {selectedOrgan && (
        <InfoPanel 
          organ={selectedOrgan} 
          onClose={() => setSelectedOrgan(null)} 
        />
      )}

      {/* Control Panel */}
      <ControlPanel
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        speed={speed}
        onSpeedChange={setSpeed}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenGlossary={onOpenGlossary}
        onOpenQuiz={onOpenQuiz}
      />
    </div>
  );
}
