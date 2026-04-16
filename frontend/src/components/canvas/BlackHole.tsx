import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStarStore } from '../../stores/useStarStore';
import type { BlackHoleData } from '../../types';

/**
 * Accretion disk shader — glowing ring with Doppler shift simulation
 */
const diskVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const diskFragmentShader = `
  precision mediump float;
  
  uniform float uTime;
  uniform vec3 uColor;
  
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    
    // Ring shape with smooth edges
    float ring = smoothstep(0.3, 0.45, dist) * (1.0 - smoothstep(0.85, 1.0, dist));
    
    // Rotation animation
    float angle = atan(uv.y, uv.x) + uTime * 0.3;
    
    // Doppler effect: one side blue-shifted, other red-shifted
    float doppler = sin(angle) * 0.5 + 0.5;
    vec3 blueShift = vec3(0.3, 0.5, 1.0);
    vec3 redShift = vec3(1.0, 0.4, 0.1);
    vec3 dopplerColor = mix(blueShift, redShift, doppler);
    
    // Swirling turbulence
    float turbulence = sin(angle * 6.0 + uTime * 2.0) * 0.1 + 
                       sin(angle * 12.0 - uTime * 3.5) * 0.05;
    
    // Hot inner glow gradient 
    float innerGlow = smoothstep(0.7, 0.35, dist);
    vec3 hotColor = mix(dopplerColor, vec3(1.0, 0.95, 0.8), innerGlow * 0.6);
    
    // Final color with luminance variations
    vec3 color = hotColor * uColor * (1.0 + turbulence * 2.0);
    color += vec3(1.0, 0.8, 0.5) * innerGlow * 0.5; // hot core glow
    
    float alpha = ring * (0.7 + turbulence);
    alpha *= 1.0 + innerGlow * 0.3;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Gravitational lensing shader — distorts background around the black hole
 */
const lensingVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lensingFragmentShader = `
  precision mediump float;
  
  uniform float uTime;
  uniform float uIntensity;
  
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    
    // Einstein ring effect — bright ring at Schwarzschild radius
    float einsteinRing = exp(-pow((dist - 0.5) * 8.0, 2.0)) * uIntensity;
    
    // Inner darkness (event horizon)
    float eventHorizon = 1.0 - smoothstep(0.0, 0.2, dist);
    
    // Outer gravitational glow
    float glow = (1.0 / (dist * 4.0 + 0.1)) * 0.1 * uIntensity;
    glow *= (1.0 - eventHorizon);
    
    // Swirling photon sphere
    float angle = atan(uv.y, uv.x);
    float photonRing = exp(-pow((dist - 0.3) * 12.0, 2.0));
    photonRing *= (0.7 + 0.3 * sin(angle * 4.0 + uTime * 1.5));
    
    // Color: orange/gold Einstein ring + blue gravitational glow
    vec3 ringColor = vec3(1.0, 0.7, 0.2) * einsteinRing;
    vec3 glowColor = vec3(0.4, 0.6, 1.0) * glow;
    vec3 photonColor = vec3(1.0, 0.85, 0.5) * photonRing * 0.4;
    
    vec3 color = ringColor + glowColor + photonColor;
    
    // Black core
    color *= (1.0 - eventHorizon);
    
    float alpha = max(einsteinRing, max(glow, photonRing * 0.3));
    alpha = max(alpha, eventHorizon * 0.95); // Solid black center
    
    // Make center truly black
    if (eventHorizon > 0.5) {
      color = vec3(0.0);
    }
    
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

/**
 * Jet stream shader — relativistic jets from black hole poles
 */
const jetVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const jetFragmentShader = `
  precision mediump float;
  
  uniform float uTime;
  uniform vec3 uColor;
  
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Narrow horizontal beam
    float beam = exp(-pow(uv.y - 0.5, 2.0) * 80.0);
    
    // Taper towards edges
    float taper = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.6, uv.x);
    
    // Pulsing animation
    float pulse = 0.7 + 0.3 * sin(uv.x * 20.0 - uTime * 4.0);
    
    // Core brightness
    float core = exp(-pow(uv.y - 0.5, 2.0) * 200.0);
    
    vec3 color = uColor * beam * taper * pulse;
    color += vec3(0.8, 0.9, 1.0) * core * taper * 0.5; // white-hot core
    
    float alpha = beam * taper * pulse * 0.6;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

function BlackHoleEntity({ data }: { data: BlackHoleData }) {
  const groupRef = useRef<THREE.Group>(null!);
  const diskRef = useRef<THREE.ShaderMaterial>(null!);
  const lensingRef = useRef<THREE.ShaderMaterial>(null!);
  const jetRef1 = useRef<THREE.ShaderMaterial>(null!);
  const jetRef2 = useRef<THREE.ShaderMaterial>(null!);
  const { camera } = useThree();
  
  const hoverStar = useStarStore((s) => s.hoverStar);

  const diskUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#cc2200') },
  }), []);

  const lensingUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
  }), []);

  const jetUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#4488ff') },
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (diskRef.current) diskRef.current.uniforms.uTime.value = t;
    if (lensingRef.current) lensingRef.current.uniforms.uTime.value = t;
    if (jetRef1.current) jetRef1.current.uniforms.uTime.value = t;
    if (jetRef2.current) jetRef2.current.uniforms.uTime.value = t;

    // Billboard the lensing effect to always face camera
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const getBlackHoleMock = () => ({
    id: data.id,
    position: data.position.clone(),
    color: new THREE.Color('#000000'),
    size: data.size,
    name: data.name,
    price: 0,
    magnitude: -99,
    distance: 0,
    temperature: `${data.mass.toLocaleString()} M☉`,
    isOwned: true,
    ownerName: data.description,
    spectralClass: 'O' as const,
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'crosshair';
    hoverStar(getBlackHoleMock());
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    hoverStar(null);
  };

  const s = data.size;

  return (
    <group
      position={[data.position.x, data.position.y, data.position.z]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Event Horizon — pure black sphere */}
      <mesh>
        <sphereGeometry args={[s * 0.3, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Gravitational Lensing Effect — billboard */}
      <group ref={groupRef}>
        <mesh>
          <planeGeometry args={[s * 4, s * 4]} />
          <shaderMaterial
            ref={lensingRef}
            vertexShader={lensingVertexShader}
            fragmentShader={lensingFragmentShader}
            uniforms={lensingUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Accretion Disk — tilted ring */}
      <mesh rotation={[Math.PI / 2 + 0.3, 0, 0]}>
        <planeGeometry args={[s * 3.5, s * 3.5]} />
        <shaderMaterial
          ref={diskRef}
          vertexShader={diskVertexShader}
          fragmentShader={diskFragmentShader}
          uniforms={diskUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Relativistic Jets — top and bottom */}
      <mesh position={[0, s * 2.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[s * 4, s * 0.8]} />
        <shaderMaterial
          ref={jetRef1}
          vertexShader={jetVertexShader}
          fragmentShader={jetFragmentShader}
          uniforms={jetUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -s * 2.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <planeGeometry args={[s * 4, s * 0.8]} />
        <shaderMaterial
          ref={jetRef2}
          vertexShader={jetVertexShader}
          fragmentShader={jetFragmentShader}
          uniforms={jetUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light — subtle glow around the accretion disk */}
      <pointLight color="#ff6633" intensity={2} distance={s * 15} decay={2} />
    </group>
  );
}

export default function BlackHoles() {
  const blackHoles = useStarStore((s) => s.blackHoles);

  return (
    <group>
      {blackHoles.map((bh) => (
        <BlackHoleEntity key={bh.id} data={bh} />
      ))}
    </group>
  );
}
