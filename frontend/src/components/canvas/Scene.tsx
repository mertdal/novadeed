import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Preload } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import StarField from './StarField';
import Planets from './Planets';
import CameraControls from './CameraControls';
import StarTooltip from './StarTooltip';
import BlackHoles from './BlackHole';
import { useStarStore } from '../../stores/useStarStore';

export default function Scene() {
  const loadNasaData = useStarStore((s) => s.loadNasaData);

  // Load NASA real data on mount (background, non-blocking)
  useEffect(() => {
    loadNasaData();
  }, [loadNasaData]);

  return (
    <Canvas
      camera={{
        position: [-167.6, -4.3, 372.5],
        fov: 75,
        near: 0.1,
        far: 10000,
      }}
      gl={{
        antialias: true,
        toneMapping: 0, // No tone mapping for space
        alpha: false,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000000',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000005');
      }}
      onPointerMissed={(e) => {
        // Exit focus on click-to-empty space
        if (e.button === 0 && (window as any).__starbound_exitFocus) {
          (window as any).__starbound_exitFocus();
        }
      }}
    >
      <Suspense fallback={null}>
        {/* Background starfield (distant tiny stars for depth) */}
        <Stars
          radius={3000}
          depth={100}
          count={4000}
          factor={3}
          saturation={0.3}
          fade
          speed={0.3}
        />

        {/* Ambient light for minimal visibility */}
        <ambientLight intensity={0.15} />

        {/* Directional "sun" light */}
        <directionalLight position={[100, 50, 100]} intensity={1.5} color="#fff8e7" />

        {/* Our interactive star field */}
        <StarField />

        {/* Solar system planets */}
        <Planets />

        {/* Black Holes */}
        <BlackHoles />

        {/* Tooltip Overlay */}
        <StarTooltip />

        {/* Camera controls */}
        <CameraControls />

        {/* Post processing — Bloom only (CA and SMAA removed for FPS) */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.6}
          />
        </EffectComposer>

        <Preload all />
      </Suspense>
    </Canvas>
  );
}

