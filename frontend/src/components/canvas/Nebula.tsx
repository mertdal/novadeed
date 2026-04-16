import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hubble-style nebula clouds — PERFORMANCE OPTIMIZED
 * Uses simplified 2-octave noise with minimal domain warping.
 */

const nebulaVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Lightweight fragment shader: 2-octave noise, no domain warping
const nebulaFragmentShader = `
  precision mediump float;

  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uDensity;
  uniform float uOpacity;

  varying vec2 vUv;

  // Simple hash-based noise (much cheaper than simplex)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // 2-octave FBM (was 5 — huge perf save)
  float fbm(vec2 p) {
    float v = 0.0;
    v += 0.5 * noise(p); p *= 2.01;
    v += 0.25 * noise(p);
    return v;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    float falloff = 1.0 - smoothstep(0.2, 1.0, dist);

    float t = uTime * 0.006;
    vec2 coord = uv * uDensity;

    // Simple pattern — single fbm call + offset
    float pattern = fbm(coord + vec2(t, t * 0.7));
    pattern = pattern * 0.5 + 0.5;

    // Color mixing
    vec3 color = mix(uColor1, uColor2, pattern);
    color = mix(color, uColor3, (1.0 - pattern) * 0.3);

    float alpha = pattern * falloff * uOpacity;
    alpha *= smoothstep(0.1, 0.4, pattern);

    gl_FragColor = vec4(color, alpha);
  }
`;

interface NebulaCloudDef {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color1: string;
  color2: string;
  color3: string;
  density: number;
  opacity: number;
}

// Reduced to 3 nebulae (was 6)
const NEBULAE: NebulaCloudDef[] = [
  {
    position: [600, 150, -500],
    rotation: [0.2, 0.5, 0.1],
    scale: 400,
    color1: '#1a0533',
    color2: '#ff3366',
    color3: '#4488ff',
    density: 1.2,
    opacity: 0.18,
  },
  {
    position: [-500, -200, 600],
    rotation: [-0.3, 1.2, 0.4],
    scale: 350,
    color1: '#0a1628',
    color2: '#22aaff',
    color3: '#66ffcc',
    density: 1.0,
    opacity: 0.15,
  },
  {
    position: [-400, 300, -600],
    rotation: [0.1, -0.8, 0.3],
    scale: 450,
    color1: '#0d0028',
    color2: '#9933ff',
    color3: '#ff44aa',
    density: 0.9,
    opacity: 0.16,
  },
];

function NebulaCloud({ data }: { data: NebulaCloudDef }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(data.color1) },
      uColor2: { value: new THREE.Color(data.color2) },
      uColor3: { value: new THREE.Color(data.color3) },
      uDensity: { value: data.density },
      uOpacity: { value: data.opacity },
    }),
    [data]
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={nebulaVertexShader}
        fragmentShader={nebulaFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function Nebula() {
  return (
    <group>
      {NEBULAE.map((nebula, i) => (
        <NebulaCloud key={i} data={nebula} />
      ))}
    </group>
  );
}
