'use client';

import { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { type Planet } from '@/lib/solar-data';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface Planet3DData {
  id: string;
  color: string;
  size: number;
  orbitRadius: number;   // semi-major axis (a)
  eccentricity: number;
  orbitSpeed: number;    // radians per second (visual)
  spinSpeed: number;     // self-rotation speed multiplier
  inclination: number;   // orbital tilt in radians
  orbitColor: string;
  texturePath: string;
  hasRings?: boolean;
  hasClouds?: boolean;
  emissive?: string;
  emissiveIntensity?: number;
}

// ------------------------------------------------------------------
// Planet data — eccentricities match real values, distances log-scaled
// The sun sits at the focus of each ellipse (offset by c = a * e)
// ------------------------------------------------------------------
const PLANET_3D_DATA: Planet3DData[] = [
  {
    id: 'mercury', color: '#b5b5b5', size: 0.18, orbitRadius: 2.4, eccentricity: 0.21,
    orbitSpeed: 0.8, spinSpeed: 0.5, inclination: 0.122, orbitColor: '#aaaaaa',
    texturePath: '/textures/mercury.jpg',
  },
  {
    id: 'venus', color: '#e8cda0', size: 0.30, orbitRadius: 3.2, eccentricity: 0.007,
    orbitSpeed: 0.5, spinSpeed: 0.2, inclination: 0.059, orbitColor: '#ddaa44',
    texturePath: '/textures/venus.jpg',
  },
  {
    id: 'earth', color: '#4B9CD3', size: 0.32, orbitRadius: 4.2, eccentricity: 0.017,
    orbitSpeed: 0.35, spinSpeed: 1.0, inclination: 0, orbitColor: '#4488ff',
    texturePath: '/textures/earth.jpg', hasClouds: true,
  },
  {
    id: 'mars', color: '#c1440e', size: 0.22, orbitRadius: 5.4, eccentricity: 0.093,
    orbitSpeed: 0.25, spinSpeed: 0.95, inclination: 0.033, orbitColor: '#ff6644',
    texturePath: '/textures/mars.jpg',
  },
  {
    id: 'jupiter', color: '#c88b3a', size: 0.80, orbitRadius: 7.2, eccentricity: 0.049,
    orbitSpeed: 0.15, spinSpeed: 2.4, inclination: 0.023, orbitColor: '#ffaa22',
    texturePath: '/textures/jupiter.jpg',
  },
  {
    id: 'saturn', color: '#e4d191', size: 0.65, orbitRadius: 9.2, eccentricity: 0.057,
    orbitSpeed: 0.10, spinSpeed: 2.2, inclination: 0.044, orbitColor: '#ffdd44',
    texturePath: '/textures/saturn.jpg', hasRings: true,
  },
  {
    id: 'uranus', color: '#7de8e8', size: 0.48, orbitRadius: 11.2, eccentricity: 0.046,
    orbitSpeed: 0.065, spinSpeed: 1.4, inclination: 0.014, orbitColor: '#44ffee',
    texturePath: '/textures/uranus.jpg',
  },
  {
    id: 'neptune', color: '#3f54ba', size: 0.45, orbitRadius: 13.0, eccentricity: 0.010,
    orbitSpeed: 0.045, spinSpeed: 1.5, inclination: 0.031, orbitColor: '#4455ff',
    texturePath: '/textures/neptune.jpg',
  },
];

// ------------------------------------------------------------------
// Audio helpers
// ------------------------------------------------------------------
function playWhoosh(): void {
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
    // AudioContext unavailable — silently skip
  }
}

let ambientCtx: AudioContext | null = null;

function startAmbientDrone(): void {
  if (typeof window === 'undefined') return;
  try {
    ambientCtx = new AudioContext();
    const osc = ambientCtx.createOscillator();
    const gain = ambientCtx.createGain();
    osc.connect(gain);
    gain.connect(ambientCtx.destination);
    osc.type = 'sine';
    osc.frequency.value = 55;
    gain.gain.setValueAtTime(0.04, ambientCtx.currentTime);
    osc.start();
  } catch {
    // ignore
  }
}

function stopAmbientDrone(): void {
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
// OrbitPath — TubeGeometry with AdditiveBlending
// The ellipse is centered at the focus offset so the sun (at origin)
// sits at one focus. Focus offset: cx = -c = -(a * e)
// ------------------------------------------------------------------
interface OrbitPathProps {
  a: number;
  b: number;
  c: number;  // focus offset (a * eccentricity)
  color: string;
}

function OrbitPath({ a, b, c, color }: OrbitPathProps) {
  const tube = useMemo(() => {
    // EllipseCurve center is at (-c, 0) so that the focus (sun) is at origin
    const curve = new THREE.EllipseCurve(-c, 0, a, b, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(128);
    const path = new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(p.x, 0, p.y)),
      true,
    );
    return new THREE.TubeGeometry(path, 128, 0.025, 8, true);
  }, [a, b, c]);

  return (
    <mesh geometry={tube}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ------------------------------------------------------------------
// Material components — each must be inside a Suspense boundary
// ------------------------------------------------------------------
interface TexturedMaterialProps {
  texturePath: string;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
}

function TexturedMaterial({ texturePath, color, emissive, emissiveIntensity }: TexturedMaterialProps) {
  const texture = useTexture(texturePath);
  return (
    <meshStandardMaterial
      map={texture}
      color={color}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissiveIntensity ?? 0}
      roughness={0.8}
    />
  );
}

function FallbackMaterial({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.8} />;
}

interface PlanetMaterialProps {
  data: Planet3DData;
}

function PlanetMaterial({ data }: PlanetMaterialProps) {
  return (
    <Suspense fallback={<FallbackMaterial color={data.color} />}>
      <TexturedMaterial
        texturePath={data.texturePath}
        color={data.color}
        emissive={data.emissive}
        emissiveIntensity={data.emissiveIntensity}
      />
    </Suspense>
  );
}

// ------------------------------------------------------------------
// Earth cloud layer
// ------------------------------------------------------------------
function EarthCloudsInner({ size }: { size: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const cloudTexture = useTexture('/textures/earth_clouds.jpg');

  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size * 1.02, 32, 32]} />
      <meshStandardMaterial
        map={cloudTexture}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
}

function EarthClouds({ size }: { size: number }) {
  return (
    <Suspense fallback={null}>
      <EarthCloudsInner size={size} />
    </Suspense>
  );
}

// ------------------------------------------------------------------
// Saturn rings — RingGeometry with corrected UVs
// ------------------------------------------------------------------
function RingMaterial() {
  const ringTex = useTexture('/textures/saturn_ring.png');
  return (
    <meshBasicMaterial
      map={ringTex}
      transparent
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

function SaturnRings({ size }: { size: number }) {
  const ringGeo = useMemo(() => {
    const inner = size * 1.4;
    const outer = size * 2.4;
    const geo = new THREE.RingGeometry(inner, outer, 128);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      const normalizedR = (r - inner) / (outer - inner);
      uv.setXY(i, normalizedR, 1);
    }
    return geo;
  }, [size]);

  return (
    <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0.3]}>
      <Suspense
        fallback={
          <meshBasicMaterial
            color="#c2b280"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        }
      >
        <RingMaterial />
      </Suspense>
    </mesh>
  );
}

// ------------------------------------------------------------------
// Sun — textured, pulsing, bloom-triggering
// ------------------------------------------------------------------
function SunTextured() {
  const sunTex = useTexture('/textures/sun.jpg');
  return (
    <meshStandardMaterial
      map={sunTex}
      emissive="#ff6600"
      emissiveIntensity={2.5}
    />
  );
}

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    sunRef.current.scale.setScalar(1 + 0.03 * Math.sin(clock.getElapsedTime() * 0.8));
  });

  return (
    <group>
      {/* Core sphere */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <Suspense
          fallback={
            <meshStandardMaterial
              color="#FDB813"
              emissive="#FF6600"
              emissiveIntensity={2.5}
            />
          }
        >
          <SunTextured />
        </Suspense>
      </mesh>

      {/* Outer glow halo */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      <pointLight color="#FDB813" intensity={4} distance={250} />
    </group>
  );
}

// ------------------------------------------------------------------
// Individual planet
// ------------------------------------------------------------------
interface PlanetMeshProps {
  data: Planet3DData;
  onSelect: (id: string) => void;
}

function PlanetMesh({ data, onSelect }: PlanetMeshProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  // Start at a random angle so planets are spread out
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1);

  // Ellipse axes — sun at one focus
  const a = data.orbitRadius;           // semi-major axis
  const ecc = data.eccentricity;
  const b = a * Math.sqrt(1 - ecc * ecc); // semi-minor axis
  const c = a * ecc;                    // focus distance from center

  // Curve centered at (-c, 0) so the right focus sits at origin (sun)
  const curve = useMemo(
    () => new THREE.EllipseCurve(-c, 0, a, b, 0, Math.PI * 2, false, 0),
    [a, b, c],
  );

  useFrame((_, delta) => {
    angleRef.current += delta * data.orbitSpeed;
    const t = ((angleRef.current % (Math.PI * 2)) + Math.PI * 2) / (Math.PI * 2);
    const point = curve.getPoint(t % 1);
    groupRef.current.position.set(point.x, 0, point.y);

    // Self-rotation
    meshRef.current.rotation.y += delta * data.spinSpeed * 0.5;

    // Smooth hover scale
    const target = hovered ? 1.4 : 1.0;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, target, 0.12);
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  const label = data.id.charAt(0).toUpperCase() + data.id.slice(1);

  return (
    <>
      <OrbitPath a={a} b={b} c={c} color={data.orbitColor} />
      <group ref={groupRef} rotation={[data.inclination, 0, 0]}>
        <mesh
          ref={meshRef}
          onClick={() => {
            playWhoosh();
            onSelect(data.id);
          }}
          onPointerEnter={() => { setHovered(true); }}
          onPointerLeave={() => { setHovered(false); }}
        >
          <sphereGeometry args={[data.size, 64, 64]} />
          <PlanetMaterial data={data} />
        </mesh>

        {data.hasRings && <SaturnRings size={data.size} />}
        {data.hasClouds && <EarthClouds size={data.size} />}

        <Text
          position={[0, data.size + 0.4, 0]}
          fontSize={0.28}
          color="white"
          anchorX="center"
          anchorY="bottom"
          renderOrder={1}
        >
          {label}
        </Text>
      </group>
    </>
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
      <color attach="background" args={['#000510']} />
      <ambientLight intensity={0.08} />
      <Stars radius={200} depth={80} count={6000} factor={5} saturation={0} fade />

      <Suspense fallback={null}>
        <Sun />
        {PLANET_3D_DATA.map(p => (
          <PlanetMesh key={p.id} data={p} onSelect={onSelectPlanet} />
        ))}
      </Suspense>

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          radius={0.8}
          mipmapBlur
        />
      </EffectComposer>

      <OrbitControls
        minDistance={4}
        maxDistance={50}
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
    return () => { stopAmbientDrone(); };
  }, []);

  return (
    <div style={{ width: '100%', height: '420px' }}>
      <Canvas
        camera={{ position: [0, 18, 24], fov: 55 }}
        style={{ background: 'transparent', touchAction: 'none' }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene onSelectPlanet={onSelectPlanet} />
      </Canvas>
    </div>
  );
}
