import { Html } from '@react-three/drei';
import { useStarStore } from '../../stores/useStarStore';

export default function StarTooltip() {
  const hoveredStar = useStarStore((s) => s.hoveredStar);
  const isFocusMode = useStarStore((s) => s.isFocusMode);

  if (!hoveredStar || isFocusMode) return null;

  return (
    <Html
      position={hoveredStar.position}
      center
      style={{
        pointerEvents: 'none',
        transform: 'translate3d(15px, -20px, 0)',
        transition: 'all 0.1s ease',
      }}
      zIndexRange={[100, 0]}
    >
      <div 
        style={{
          background: 'rgba(2, 6, 23, 0.65)',
          border: '1px solid rgba(135, 206, 250, 0.3)',
          borderLeft: '3px solid rgba(135, 206, 250, 0.8)',
          color: '#fff',
          padding: '4px 10px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ color: '#87cefa', opacity: 0.8, marginRight: '6px' }}>[+]</span>
        {hoveredStar.name}
      </div>
    </Html>
  );
}
