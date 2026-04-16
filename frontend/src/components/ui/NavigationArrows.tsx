export default function NavigationArrows() {
  const handleMoveForward = () => {
    if ((window as any).__starbound_moveForward) {
      (window as any).__starbound_moveForward();
    }
  };

  const handleMoveBackward = () => {
    if ((window as any).__starbound_moveBackward) {
      (window as any).__starbound_moveBackward();
    }
  };

  return (
    <div className="nav-arrows" id="nav-arrows">
      <button
        className="nav-arrow nav-arrow--forward"
        id="nav-forward"
        onClick={handleMoveForward}
        title="[ THRUST_FWD ]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>
      <button
        className="nav-arrow nav-arrow--backward"
        id="nav-backward"
        onClick={handleMoveBackward}
        title="[ THRUST_BWD ]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <path d="M12 5v14" />
          <path d="M19 12l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
