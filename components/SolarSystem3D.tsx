'use client';

import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { type Planet } from '@/lib/solar-data';

// ------------------------------------------------------------------
// Planet orbital data (log-compressed distances for visibility)
// ------------------------------------------------------------------
interface Planet3DData {
  id: string;
  color: string;
  size: number;
  orbitRadius: number;
  eccentricity: number;
  orbitSpeed: number;  // divided by 30 in useFrame so Earth ~30s orbit
  rotSpeed: number;
  hasRings?: boolean;
}

const PLANET_3D_DATA: Planet3DData[] = [
  { id: 'mercury', color: '#b5b5b5', size: 0.15, orbitRadius: 2.2, eccentricity: 0.21,  orbitSpeed: 4.15,  rotSpeed: 0.017 },
  { id: 'venus',   color: '#e8cda0', size: 0.28, orbitRadius: 3.0, eccentricity: 0.007, orbitSpeed: 1.62,  rotSpeed: 0.004 },
  { id: 'earth',   color: '#4B9CD3', size: 0.30, orbitRadius: 3.9, eccentricity: 0.017, orbitSpeed: 1.0,   rotSpeed: 1.0   },
  { id: 'mars',    color: '#c1440e', size: 0.22, orbitRadius: 4.9, eccentricity: 0.093, orbitSpeed: 0.53,  rotSpeed: 0.97  },
  { id: 'jupiter', color: '#c88b3a', size: 0.72, orbitRadius: 6.5, eccentricity: 0.049, orbitSpeed: 0.084, rotSpeed: 2.4   },
  { id: 'saturn',  color: '#e4d191', size: 0.60, orbitRadius: 8.2, eccentricity: 0.057, orbitSpeed: 0.034, rotSpeed: 2.2, hasRings: true },
  { id: 'uranus',  color: '#7de8e8', size: 0.42, orbitRadius: 10.0,eccentricity: 0.046, orbitSpeed: 0.012, rotSpeed: 1.4   },
  { id: 'neptune', color: '#3f54ba', size: 0.40, orbitRadius: 11.5,eccentricity: 0.010, orbitSpeed: 0.006, rotSpeed: 1.5   },
]

// ------------------------------------------------------------------
// Whoosh sound effect
// ------------------------------------------------------------------
function playWhoosh() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // ignore if AudioContext not available
  }
}

// ------------------------------------------------------------------
// Ambient space drone
// ------------------------------------------------------------------
let ambientCtx: AudioContext | null = null;
function startAmbientDrone() {
  if (typeof window === 'undefined') return;
  try {
    ambientCtx = new AudioContext();
    const osc = ambientCtx.createOscillator();
    const gain = ambientCtx.createGain();
    osc.connect(gain);
    gain.connect(ambientCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = 55; // low A
    gain.gain.setValueAtTime(0.04, ambientCtx.currentTime);
    osc.start();
  } catch {
    // ignore
  }
}
function stopAmbientDrone() {
  try {
    if (ambientCtx) {
      ambientCtx.close();
      ambientCtx = null;
    }
  } catch {
    // ignore
  }
}

// ------------------------------------------------------------------
// Orbit path line
// ------------------------------------------------------------------
function OrbitPath({ a, b }: { a: number; b: number }) {
  const lineMesh = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * 2 * Math.PI;
      pts.push(new THREE.Vector3(a * Math.cos(theta), 0, b * Math.sin(theta)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: 'white', transparent: true, opacity: 0.12 });
    return new THREE.Line(geo, mat);
  }, [a, b]);

  return <primitive object={lineMesh} />;
}

// ------------------------------------------------------------------
// Individual planet mesh
// ------------------------------------------------------------------
interface PlanetMeshProps {
  data: Planet3DData;
  onSelect: (id: string) => void;
}

function PlanetMesh({ data, onSelect }: PlanetMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const planetRef = useRef<THREE.Mesh>(null!);
  const timeOffset = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(false);
  const pulseTime = useRef(0);
  const currentScale = useRef(1);

  const a = data.orbitRadius;
  const b = data.orbitRadius * Math.sqrt(1 - data.eccentricity * data.eccentricity);

  useFrame((_, delta) => {
    timeOffset.current += delta * (data.orbitSpeed / 30);
    const theta = timeOffset.current;
    const x = a * Math.cos(theta);
    const z = b * Math.sin(theta);
    groupRef.current.position.set(x, 0, z);

    planetRef.current.rotation.y += delta * data.rotSpeed * 0.5;

    // Scale lerp for hover
    const targetScale = hovered ? 1.3 : 1.0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.15);

    // Pulse after click
    if (pulse) {
      pulseTime.current += delta * 4;
      const ps = 1.0 + 0.4 * Math.abs(Math.sin(pulseTime.current));
      groupRef.current.scale.setScalar(ps);
      if (pulseTime.current > Math.PI) {
        setPulse(false);
        pulseTime.current = 0;
        groupRef.current.scale.setScalar(1);
      }
    } else {
      groupRef.current.scale.setScalar(currentScale.current);
    }
  });

  const handleClick = useCallback(() => {
    playWhoosh();
    setPulse(true);
    pulseTime.current = 0;
    onSelect(data.id);
  }, [data.id, onSelect]);

  return (
    <>
      <OrbitPath a={a} b={b} />
      <group ref={groupRef}>
        <mesh
          ref={planetRef}
          onClick={handleClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <sphereGeometry args={[data.size, 32, 32]} />
          <meshStandardMaterial
            color={data.color}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Saturn rings */}
        {data.hasRings && (
          <mesh rotation={[Math.PI / 2.5, 0, 0.3]}>
            <torusGeometry args={[data.size * 1.9, data.size * 0.28, 2, 64]} />
            <meshStandardMaterial
              color="#c2b280"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Planet label */}
        <Text
          position={[0, data.size + 0.35, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="bottom"
        >
          {data.id.charAt(0).toUpperCase() + data.id.slice(1)}
        </Text>
      </group>
    </>
  );
}

// ------------------------------------------------------------------
// Sun
// ------------------------------------------------------------------
function Sun() {
  const sunRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    sunRef.current.scale.setScalar(1 + 0.03 * Math.sin(clock.getElapsedTime() * 0.8));
  });

  return (
    <group>
      {/* Core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#FDB813" emissive="#FF6600" emissiveIntensity={0.8} />
      </mesh>
      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[1.85, 32, 32]} />
        <meshStandardMaterial color="#FF6600" transparent opacity={0.12} side={THREE.FrontSide} />
      </mesh>
      {/* Point light */}
      <pointLight color="#FDB813" intensity={3} distance={200} />
    </group>
  );
}

// ------------------------------------------------------------------
// Scene (inside Canvas)
// ------------------------------------------------------------------
interface SceneProps {
  onSelectPlanet: (id: string) => void;
}

function Scene({ onSelectPlanet }: SceneProps) {
  return (
    <>
      <color attach="background" args={['#000008']} />
      <ambientLight intensity={0.15} />
      <Stars radius={120} depth={50} count={4000} factor={4} saturation={0.5} />
      <Sun />
      {PLANET_3D_DATA.map(p => (
        <PlanetMesh key={p.id} data={p} onSelect={onSelectPlanet} />
      ))}
      <OrbitControls
        minDistance={3}
        maxDistance={40}
        enablePan={false}
        makeDefault
      />
    </>
  );
}

// ------------------------------------------------------------------
// Exported component
// ------------------------------------------------------------------
interface SolarSystem3DProps {
  onSelectPlanet: (id: string) => void;
  planets: Planet[];
}

export default function SolarSystem3D({ onSelectPlanet, planets: _planets }: SolarSystem3DProps) {
  useEffect(() => {
    startAmbientDrone();
    return () => stopAmbientDrone();
  }, []);

  return (
    <div style={{ width: '100%', height: '420px' }}>
      <Canvas
        camera={{ position: [0, 12, 18], fov: 60 }}
        style={{ background: 'transparent', touchAction: 'none' }}
        gl={{ antialias: true }}
      >
        <Scene onSelectPlanet={onSelectPlanet} />
      </Canvas>
    </div>
  );
}
