import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStarStore } from '../../stores/useStarStore';
import PlasmaStarSphere from './PlasmaStarSphere';

// Shader — preserves star spectral colors, no blowout to white
const starVertexShader = `
  precision highp float;
  precision highp int;

  attribute float aSize;
  attribute vec3 aColor;
  attribute float aFlicker;
  attribute float aType;
  
  varying vec3 vColor;
  varying float vFlicker;
  varying float vType;
  
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uGlobalOpacity;
  
  void main() {
    vColor = aColor;
    vFlicker = aFlicker;
    vType = aType;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Different pulse rates based on type
    float pulseSpeed = (aType == 2.0) ? 0.8 : (aType == 1.0) ? 2.5 : 1.5;
    float flicker = 1.0 + sin(uTime * aFlicker * pulseSpeed + aFlicker * 50.0) * 0.06;
    
    gl_PointSize = aSize * uPixelRatio * flicker * (800.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 2.0, 60.0);
    
    // Dim stars in focus mode
    gl_PointSize *= uGlobalOpacity;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = `
  precision highp float;
  precision highp int;

  varying vec3 vColor;
  varying float vFlicker;
  varying float vType;
  
  uniform float uTime;
  uniform float uGlobalOpacity;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float core = 0.0;
    float glow = 0.0;
    float halo = 0.0;

    // --- VARIANT LOGIC ---
    
    if (vType == 1.0) { // TYPE 1: Hot/Blue Sharp Stars
      core = 1.0 - smoothstep(0.0, 0.12, dist);
      glow = 1.0 - smoothstep(0.0, 0.4, dist);
      // Extra crisp flare
      halo = 1.0 - smoothstep(0.4, 0.5, dist);
      glow = pow(glow, 3.0) + halo * 0.2;
    } 
    else if (vType == 2.0) { // TYPE 2: Cool/Red Gigantic/Soft Stars
      core = 1.0 - smoothstep(0.0, 0.25, dist);
      glow = 1.0 - smoothstep(0.0, 0.5, dist);
      glow = pow(glow, 1.5); // Softer curve
    }
    else if (vType == 3.0) { // TYPE 3: Exotic/Exoplanet Stars
      core = 1.0 - smoothstep(0.0, 0.18, dist);
      glow = 1.0 - smoothstep(0.0, 0.5, dist);
      // Layered halo ring effect
      float ring = smoothstep(0.35, 0.4, dist) * (1.0 - smoothstep(0.42, 0.45, dist));
      glow = pow(glow, 2.0) + ring * 0.5;
    }
    else { // TYPE 0: Standard/Classic Stars
      core = 1.0 - smoothstep(0.0, 0.18, dist);
      glow = 1.0 - smoothstep(0.0, 0.5, dist);
      glow = pow(glow, 2.0);
    }
    
    // --- COLOR BLENDING ---
    
    // Mix white heavily into the core
    vec3 coreColor = mix(vColor * 1.1, vec3(1.0), core * 0.7);
    vec3 glowColor = mix(vColor, vec3(1.0), 0.3);
    
    // Type 1 gets more blue chromatic bias in glow
    if (vType == 1.0) glowColor = mix(glowColor, vec3(0.5, 0.8, 1.0), 0.2);
    
    vec3 color = coreColor * core + glowColor * glow * 0.3;
    float alpha = (core + glow * 0.4) * uGlobalOpacity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function StarField() {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { camera, gl } = useThree();

  // Subscribe to stars array
  const stars = useStarStore((s) => s.stars);
  const starsRef = useRef(stars);
  starsRef.current = stars;

  const focusedStar = useStarStore((s) => s.focusedStar);
  const isFocusMode = useStarStore((s) => s.isFocusMode);

  const currentOpacity = useRef(1);

  const raycaster = useMemo(() => {
    const rc = new THREE.Raycaster();
    rc.params.Points = { threshold: 15 };
    return rc;
  }, []);

  // Map spectral classes to Type IDs
  const getStarType = (spectralClass: string): number => {
    if (['O', 'B', 'E_PURPLE'].includes(spectralClass)) return 1; // Hot/Sharp
    if (['M', 'E_PINK'].includes(spectralClass)) return 2; // Cool/Soft
    if (['E_GREEN', 'E_PLANET'].includes(spectralClass)) return 3; // Exotic
    return 0; // Standard (G, K, A, F)
  };

  // Build buffer geometry
  const geometry = useMemo(() => {
    const count = stars.length;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const flickers = new Float32Array(count);
    const types = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const star = stars[i];
      pos[i * 3] = star.position.x;
      pos[i * 3 + 1] = star.position.y;
      pos[i * 3 + 2] = star.position.z;

      colors[i * 3] = star.color.r;
      colors[i * 3 + 1] = star.color.g;
      colors[i * 3 + 2] = star.color.b;

      sizes[i] = star.size;
      flickers[i] = 0.3 + (i * 17 % 100) / 100 * 1.5;
      types[i] = getStarType(star.spectralClass);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aFlicker', new THREE.BufferAttribute(flickers, 1));
    geo.setAttribute('aType', new THREE.BufferAttribute(types, 1));

    return geo;
  }, [stars]);

  // Animate — pure GPU, no React state updates
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();

      // Smooth opacity transition for isolation mode
      const target = isFocusMode ? 0.05 : 1.0;
      currentOpacity.current += (target - currentOpacity.current) * 0.04;
      materialRef.current.uniforms.uGlobalOpacity.value = currentOpacity.current;
    }
  });

  // Interaction handlers — native DOM to avoid R3F default raycast overhead
  useEffect(() => {
    const canvas = gl.domElement;
    let lastHoverTime = 0;
    const mouseDownPos = { x: 0, y: 0 };

    const getIntersectedStar = (e: MouseEvent) => {
      const mouse = new THREE.Vector2();
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (pointsRef.current) {
        const intersects = raycaster.intersectObject(pointsRef.current);
        if (intersects.length > 0) {
          const idx = intersects[0].index;
          const stars = starsRef.current;
          if (idx !== undefined && idx < stars.length) {
            return stars[idx];
          }
        }
      }
      return null;
    };

    const onMouseDown = (e: MouseEvent) => {
      mouseDownPos.x = e.clientX;
      mouseDownPos.y = e.clientY;
    };

    const onClick = (e: MouseEvent) => {
      if (useStarStore.getState().isFocusMode) return;

      // Calculate distance from mousedown to ensure it's a click, not a drag release
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 5) return; // Ignore if moved more than 5 pixels (drag)
      
      const star = getIntersectedStar(e);
      if (star) {
        useStarStore.getState().focusStar(star);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (useStarStore.getState().isFocusMode) return;
      
      const now = performance.now();
      if (now - lastHoverTime > 50) { // Throttle to ~20FPS for hover
        lastHoverTime = now;
        const star = getIntersectedStar(e);
        const currentHover = useStarStore.getState().hoveredStar;
        
        if (star && (!currentHover || currentHover.id !== star.id)) {
          document.body.style.cursor = 'crosshair';
          useStarStore.getState().hoverStar(star);
        } else if (!star && currentHover) {
          document.body.style.cursor = 'auto';
          useStarStore.getState().hoverStar(null);
        }
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove);
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [camera, gl, raycaster]);

  const shaderUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uGlobalOpacity: { value: 1.0 },
    }),
    []
  );

  return (
    <group>
      {/* Point cloud stars — NO onPointerMove (kills performance) */}
      <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={starVertexShader}
          fragmentShader={starFragmentShader}
          uniforms={shaderUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Plasma sphere for focused star - Exclude Solar System Planets */}
      {focusedStar && focusedStar.spectralClass !== 'E_PLANET' && (
        <PlasmaStarSphere star={focusedStar} visible={isFocusMode} />
      )}
    </group>
  );
}
