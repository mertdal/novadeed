export default function Crosshair() {
  return (
    <div className="crosshair-container" id="crosshair">
      <div className="crosshair">
        <div className="crosshair-line crosshair-line--top" />
        <div className="crosshair-line crosshair-line--right" />
        <div className="crosshair-line crosshair-line--bottom" />
        <div className="crosshair-line crosshair-line--left" />
        <div className="crosshair-dot" />
      </div>
    </div>
  );
}
