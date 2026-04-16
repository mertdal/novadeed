import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStarStore } from '../../stores/useStarStore';

/**
 * Rayleigh Scattering Atmosphere Shader
 * Simulates physically-based atmospheric glow with sun-relative illumination
 */
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  precision mediump float;

  uniform vec3 uAtmosphereColor;
  uniform float uDensity;
  uniform float uFalloff;
  uniform vec3 uSunDirection;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    // View direction for Fresnel
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    
    // Fresnel — stronger glow at edges (limb)
    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
    fresnel = pow(fresnel, uFalloff);
    
    // Rayleigh scattering intensity — stronger when looking through more atmosphere
    float scattering = fresnel * uDensity;
    
    // Sun illumination — atmosphere brighter on sun-facing side
    float sunDot = max(dot(vNormal, uSunDirection), 0.0);
    float daylight = 0.4 + 0.6 * sunDot; // Never fully dark
    
    // Forward scattering — bright halo when backlit by sun
    float forwardScatter = pow(max(dot(viewDir, -uSunDirection), 0.0), 4.0);
    scattering += forwardScatter * 0.3 * uDensity;
    
    // Wavelength-dependent scattering (blue scatters more)
    vec3 scatterColor = uAtmosphereColor;
    scatterColor.b *= 1.3; // Blue channel boost for Rayleigh
    scatterColor.r *= 0.85;
    
    // Sunset coloring at the terminator (edge between day/night)
    float terminator = pow(1.0 - abs(sunDot), 3.0);
    vec3 sunsetColor = vec3(1.0, 0.4, 0.15);
    scatterColor = mix(scatterColor, sunsetColor, terminator * 0.3);
    
    vec3 finalColor = scatterColor * scattering * daylight;
    float alpha = scattering * daylight * 0.8;
    
    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 0.85));
  }
`;

interface AtmosphereDef {
  color: string;
  density: number;
  falloff: number;
}

interface PlanetDef {
  id: number;
  name: string;
  size: number;
  distance: number;
  speed: number;
  color: string;
  texture: string;
  temperature: string;
  hasRing?: boolean;
  ringTexture?: string;
  atmosphere?: AtmosphereDef;
}

const SOLAR_SYSTEM: PlanetDef[] = [
  { id: 9000, name: 'Sun', size: 20, distance: 0, speed: 0, color: '#ffcc00', texture: '/textures/sun.jpg', temperature: '5,778 K (Surface)' },
  { id: 9001, name: 'Mercury', size: 1.6, distance: 30, speed: 0.8, color: '#aaaaaa', texture: '/textures/mercury.jpg', temperature: '430°C / -180°C' },
  { id: 9002, name: 'Venus', size: 3.0, distance: 50, speed: 0.6, color: '#e6c280', texture: '/textures/venus.jpg', temperature: '471°C',
    atmosphere: { color: '#ffddaa', density: 1.8, falloff: 2.0 } },
  { id: 9003, name: 'Earth', size: 3.2, distance: 75, speed: 0.5, color: '#4488ff', texture: '/textures/earth.jpg', temperature: '15°C',
    atmosphere: { color: '#4488ff', density: 1.2, falloff: 2.5 } },
  { id: 9004, name: 'Mars', size: 2.2, distance: 105, speed: 0.4, color: '#ff5533', texture: '/textures/mars.jpg', temperature: '-65°C',
    atmosphere: { color: '#ff8855', density: 0.4, falloff: 3.0 } },
  { id: 9005, name: 'Ceres', size: 0.8, distance: 130, speed: 0.35, color: '#888888', texture: '/textures/moon.jpg', temperature: '-105°C' },
  { id: 9006, name: 'Jupiter', size: 9.0, distance: 170, speed: 0.2, color: '#d39c7e', texture: '/textures/jupiter.jpg', temperature: '-110°C',
    atmosphere: { color: '#d4a574', density: 0.6, falloff: 2.2 } },
  { id: 9007, name: 'Saturn', size: 7.6, distance: 230, speed: 0.15, color: '#ead6b8', texture: '/textures/saturn.jpg', temperature: '-140°C', hasRing: true, ringTexture: '/textures/saturn_ring.png',
    atmosphere: { color: '#ead6b8', density: 0.5, falloff: 2.3 } },
  { id: 9008, name: 'Uranus', size: 5.2, distance: 280, speed: 0.1, color: '#ace5ee', texture: '/textures/uranus.jpg', temperature: '-195°C',
    atmosphere: { color: '#88ddee', density: 0.7, falloff: 2.0 } },
  { id: 9009, name: 'Neptune', size: 5.0, distance: 330, speed: 0.08, color: '#5b5ddf', texture: '/textures/neptune.jpg', temperature: '-200°C',
    atmosphere: { color: '#4455dd', density: 0.8, falloff: 2.0 } },
  { id: 9010, name: 'Pluto', size: 1.0, distance: 370, speed: 0.06, color: '#dddddd', texture: '/textures/moon.jpg', temperature: '-225°C' },
];

function AtmosphereShell({ size, atmosphere }: { size: number; atmosphere: AtmosphereDef }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = {
    uAtmosphereColor: { value: new THREE.Color(atmosphere.color) },
    uDensity: { value: atmosphere.density },
    uFalloff: { value: atmosphere.falloff },
    uSunDirection: { value: new THREE.Vector3(1, 0.3, 0).normalize() },
  };

  return (
    <mesh scale={1.12}>
      <sphereGeometry args={[size, 24, 24]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function PlanetRing({ size, ringTexture }: { size: number; ringTexture: string }) {
  const tex = useTexture(ringTexture);

  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);

  return (
    <mesh rotation={[-Math.PI / 2 + 0.3, 0, 0]}>
      <ringGeometry args={[size * 0.1, size * 2.5, 64]} />
      <meshBasicMaterial map={tex} color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.65} />
    </mesh>
  );
}

function PlanetNode({ data }: { data: PlanetDef }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const focusStar = useStarStore((s) => s.focusStar);
  const hoverStar = useStarStore((s) => s.hoverStar);

  const textureMap = data.texture ? useTexture(data.texture) : null;
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }

    if (data.speed > 0 && groupRef.current) {
      angleRef.current -= delta * (data.speed * 0.05);
      groupRef.current.position.x = Math.cos(angleRef.current) * data.distance;
      groupRef.current.position.z = Math.sin(angleRef.current) * data.distance;
    }
  });

  const getPlanetMock = () => {
    return {
      id: data.id,
      position: new THREE.Vector3().copy(groupRef.current.position),
      color: new THREE.Color(data.color),
      size: data.size,
      name: data.name,
      price: 0,
      magnitude: 0,
      distance: 0,
      temperature: data.temperature,
      isOwned: true,
      ownerName: 'HUMANITY',
      spectralClass: 'E_PLANET' as const,
    };
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    focusStar(getPlanetMock());
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'crosshair';
    hoverStar(getPlanetMock());
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    hoverStar(null);
  };

  return (
    <group ref={groupRef} position={[data.distance, 0, 0]} onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[data.size, 64, 64]} />
        {textureMap ? (
          <meshStandardMaterial map={textureMap} />
        ) : (
          <meshStandardMaterial color={data.color} />
        )}
      </mesh>

      {/* Rayleigh Scattering Atmosphere */}
      {data.atmosphere && (
        <AtmosphereShell size={data.size} atmosphere={data.atmosphere} />
      )}

      {/* Saturn's Rings */}
      {data.hasRing && data.ringTexture && <PlanetRing size={data.size} ringTexture={data.ringTexture} />}
    </group>
  );
}

export default function Planets() {
  return (
    <group>
      {/* Central lighting to simulate the Sun illuminating the planets */}
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffffff" distance={600} decay={1.5} />

      {/* Render all celestial bodies in the solar system array */}
      {SOLAR_SYSTEM.map((planet) => (
        <PlanetNode key={planet.id} data={planet} />
      ))}
    </group>
  );
}


