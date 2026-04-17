import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from '../../services/translations';
import { useStarStore } from '../../stores/useStarStore';
import { audioManager } from '../../services/audioManager';
import { useState } from 'react';

export default function HUD() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useTranslation(language);

  const cameraPosition = useStarStore((s) => s.cameraPosition);
  const isFocusMode = useStarStore((s) => s.isFocusMode);
  const focusedStar = useStarStore((s) => s.focusedStar);
  const setDashboardOpen = useStarStore((s) => s.setDashboardOpen);

  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioManager.setMute(next);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
    audioManager.playBlip();
  };

  return (
    <div className={`hud ${isFocusMode ? 'hud--focus' : ''}`} id="hud">
      {/* Top left: Logo */}
      <div className="hud-logo" id="hud-logo">
        <div className="hud-logo-icon">✦</div>
        <div className="hud-logo-text">
          <span className="hud-logo-title">NOVADEED</span>
          <span className="hud-logo-subtitle">{t.star_navigation}</span>
        </div>
      </div>

      {/* Bottom left: Coordinates */}
      <div className="hud-coords" id="hud-coords">
        <div className="hud-coords-title">
          {isFocusMode && focusedStar
            ? `${focusedStar.isOwned ? t.orbiting : 'VIEWING'}: ${focusedStar.name}`
            : t.navigation}
        </div>
        <div className="hud-coords-grid">
          <div className="hud-coord">
            <span className="hud-coord-axis">X</span>
            <span className="hud-coord-value">{cameraPosition[0].toFixed(1)}</span>
          </div>
          <div className="hud-coord">
            <span className="hud-coord-axis">Y</span>
            <span className="hud-coord-value">{cameraPosition[1].toFixed(1)}</span>
          </div>
          <div className="hud-coord">
            <span className="hud-coord-axis">Z</span>
            <span className="hud-coord-value">{cameraPosition[2].toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Top right: Info */}
      <div className="hud-controls">
        <button 
          className="hud-lang-btn attr-mono" 
          onClick={toggleLanguage}
          title={language === 'en' ? 'Switch to Turkish' : 'İngilizce\'ye Geç'}
        >
          {language === 'tr' ? '🇹🇷 TR' : '🇺🇸 EN'}
        </button>

        {!isFocusMode && (
          <button 
             className="hud-profile-btn" 
             onClick={() => { audioManager.playBlip(); setDashboardOpen(true); }}
             title="Open Profile Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        )}
          
        <button className="hud-mute-btn" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          )}
        </button>
      </div>

      {/* Bottom center: Navigation hints */}
      {!isFocusMode && (
        <div className="hud-hint" id="hud-hint">
          <span>[LMB] {t.pan_alignment}</span>
          <span className="hud-hint-divider">/</span>
          <span>[SCROLL] {t.telemetry_zoom}</span>
          <span className="hud-hint-divider">/</span>
          <span>[W/A/S/D] {t.thruster}</span>
          <span className="hud-hint-divider">/</span>
          <span>[LMB_TARGET] {t.acquire_data}</span>
        </div>
      )}
    </div>
  );
}

