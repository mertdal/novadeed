import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StarData } from '../../types';

// Simplex 3D noise GLSL (Ashima / Stefan Gustavson)
const noiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
`;

const plasmaVertexShader = `
precision highp float;
precision highp int;
${noiseGLSL}

uniform float uTime;
uniform float uNoiseScale;
uniform float uNoiseIntensity;
uniform float uSeed; // Unique identifier to randomize shapes per star

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;
varying vec2 vUv;

float fbmV(vec3 x) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0);
  for (int i = 0; i < 4; ++i) {
    v += a * snoise(x);
    x = x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
  
  // Apply the unique seed to time and position, ensuring this star's shape and animation loop is completely distinct from others
  float t = uTime * 0.1 + uSeed;
  vec3 pos = position * uNoiseScale + vec3(uSeed * 13.0);
  
  // Violent displacement combining layered fBM and fast surface noise
  float d1 = fbmV(pos + vec3(t));
  float d2 = snoise(pos * 3.0 - vec3(t * 1.5));
  
  // Combine for jagged, fiery edge
  float displacement = (d1 * 1.5 + d2 * 0.5) * uNoiseIntensity;
  
  vDisplacement = displacement;
  
  vec3 newPosition = position + normal * displacement;
  vPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const plasmaFragmentShader = `
precision highp float;
precision highp int;
${noiseGLSL}

uniform float uTime;
uniform vec3 uColorHot;
uniform vec3 uColorMid;
uniform vec3 uColorCool;
uniform float uFresnelPower;
uniform float uSeed; // Injecting seed into Fragment for unique surface patterns

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;
varying vec2 vUv;

// Standard Fractional Brownian Motion
float fbm(vec3 x) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0);
  for (int i = 0; i < 5; ++i) {
    v += a * snoise(x);
    x = x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// Ridged fbm for sharp intersecting cracks
float ridgedFbm(vec3 x) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0);
  for (int i = 0; i < 4; ++i) {
    v += a * (1.0 - abs(snoise(x))); // 1-abs gives sharp ridges
    x = x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  float t = uTime * 0.2 + uSeed;
  
  // 1. Base Domain Warping (creates the swirling plasma/liquid gas look)
  vec3 coord = vPosition * 1.5;
  vec3 q = vec3(
    fbm(coord + vec3(t * 0.2, 0.0, 0.0)),
    fbm(coord + vec3(5.2, 1.3, t * 0.2)),
    fbm(coord + vec3(2.9, 7.4, t * 0.2))
  );
  
  vec3 r = vec3(
    fbm(coord + 4.0 * q + vec3(1.7, 9.2, t * 0.3)),
    fbm(coord + 4.0 * q + vec3(8.3, 2.8, t * 0.3)),
    fbm(coord + 4.0 * q + vec3(3.5, 6.1, t * 0.3))
  );
  
  // Smooth turbulent base
  float basePattern = fbm(coord + 4.0 * r);
  basePattern = basePattern * 0.5 + 0.5; // Map to 0-1

  // 2. Sunspots (deep dark cool patches)
  float spotNoise = snoise(vPosition * 1.2 + vec3(t * 0.1));
  float spots = smoothstep(0.3, 0.8, spotNoise);

  // 3. Filaments / Capillaries (bright intricate fiery cracks)
  vec3 filCoord = vPosition * 3.5 + vec3(t * 0.4);
  float filPattern = ridgedFbm(filCoord);
  float filaments = pow(filPattern * 1.2, 5.0); // Extreme contrast
  
  // 4. Edge Prominences / Flares (massive eruptions on the limbs)
  float flareNoise = snoise(vPosition * 2.0 + vec3(t * 0.5, 0.0, t * 0.3));
  float flare = smoothstep(0.5, 0.9, flareNoise);

  // COLOR MIXING MASTERCLASS
  // Deep regions are cool (dark red/brown), raised regions are mid (orange/yellow)
  vec3 color = mix(uColorCool * 0.5, uColorMid, basePattern);
  
  // Cut out the sunspots
  color = mix(uColorCool * 0.2, color, spots);
  
  // Add intense heat for standard surface storms/flares
  color = mix(color, uColorHot, flare * 0.6);
  
  // Düşük çarpan kullanarak parlaklığın tüm yüzeyi yutmasını (beyazlaşmayı) engelliyoruz
  color += uColorHot * filaments * 0.8;

  // 5. Fresnel Glow (Yıldızın kenar parlaması)
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), uFresnelPower * 0.8);
  
  // Edge parlamasını agresif 1.8'den 0.5'e çektik
  color += uColorHot * fresnel * 0.5;

  // Fiziksel patlama parlaklığını da dengeliyoruz, bembeyaz yapmasın.
  float dispBrightness = 1.0 + max(vDisplacement, 0.0) * 0.4;
  color *= dispBrightness;

  gl_FragColor = vec4(color, 1.0);
}
`;


import { getPaletteForStar } from '../../utils/colors';

interface Props {
  star: StarData;
  visible: boolean;
}

export default function PlasmaStarSphere({ star, visible }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const palette = useMemo(() => getPaletteForStar(star.id, star.spectralClass), [star.id, star.spectralClass]);

  const plasmaUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNoiseScale: { value: 1.8 },
      uNoiseIntensity: { value: 0.15 },
      uSeed: { value: (star.id * 73.19) % 1000.0 }, // Deterministic seed ensuring 100% unique topologies
      uColorHot: { value: new THREE.Color(palette.hot) },
      uColorMid: { value: new THREE.Color(palette.mid) },
      uColorCool: { value: new THREE.Color(palette.cool) },
      uFresnelPower: { value: 3.0 },
    }),
    [palette, star.id]
  );


  // Star visual size based on its catalog size
  const sphereRadius = Math.max(2, star.size * 1.2);

  useFrame(({ clock }) => {
    if (!visible) return;
    const t = clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.03;
      meshRef.current.rotation.x = Math.sin(t * 0.02) * 0.1;
    }
  });

  if (!visible) return null;

  return (
    <group position={[star.position.x, star.position.y, star.position.z]}>
      {/* 1. Main Plasma Sphere (Ana yıldız gövdesi) */}
      <mesh ref={meshRef} frustumCulled={false}>
        <sphereGeometry args={[sphereRadius, 256, 256]} /> {/* Yırtık kenarlar için yüksek poligon */}
        <shaderMaterial
          ref={materialRef}
          vertexShader={plasmaVertexShader}
          fragmentShader={plasmaFragmentShader}
          uniforms={plasmaUniforms}
        />
      </mesh>

      {/* Point light from the star */}
      <pointLight
        color={palette.mid}
        intensity={3}
        distance={sphereRadius * 30}
        decay={2}
      />
    </group>
  );
}
