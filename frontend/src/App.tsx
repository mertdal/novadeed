import { useStarStore } from './stores/useStarStore';
import { useAuthStore } from './stores/useAuthStore';
import { audioManager } from './services/audioManager';
import { useEffect } from 'react';
import Scene from './components/canvas/Scene';
import HUD from './components/ui/HUD';
import Crosshair from './components/ui/Crosshair';
import StarDrawer from './components/ui/StarDrawer';
import StarHistoryPanel from './components/ui/StarHistoryPanel';
import NavigationArrows from './components/ui/NavigationArrows';
import LandingPage from './components/ui/LandingPage';
import SearchBar from './components/ui/SearchBar';
import ActivityFeed from './components/ui/ActivityFeed';
import Dashboard from './components/ui/Dashboard';
import CertificateModal from './components/ui/CertificateModal';

function App() {
  const isFocusMode = useStarStore((s) => s.isFocusMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dashboardOpen = useStarStore((s) => s.dashboardOpen);
  const setDashboardOpen = useStarStore((s) => s.setDashboardOpen);
  const certStar = useStarStore((s) => s.certStar);
  const setCertStar = useStarStore((s) => s.setCertStar);

  const syncOwnedStars = useStarStore((s) => s.syncOwnedStars);
  const loadNasaData = useStarStore((s) => s.loadNasaData);
  const initGoogle = useAuthStore((s) => s.initGoogle);

  useEffect(() => {
    audioManager.init();
    loadNasaData(); // Ensure NASA data is loaded too
    initGoogle();    // Prepare Google Auth
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      syncOwnedStars();
    }
  }, [isAuthenticated, syncOwnedStars]);

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className={`app ${isFocusMode ? 'app--focus' : ''}`} id="app">
      {/* 3D Canvas */}
      <div className="canvas-wrapper" id="canvas-wrapper">
        <Scene />
      </div>

      {/* UI Overlays */}
      <HUD />
      <SearchBar />
      <ActivityFeed />

      {/* Show crosshair & nav arrows only in free navigation */}
      {!isFocusMode && (
        <>
          <Crosshair />
          <NavigationArrows />
        </>
      )}

      {/* Focus mode panels */}
      <StarHistoryPanel />
      <StarDrawer />

      {dashboardOpen && (
        <Dashboard onClose={() => setDashboardOpen(false)} />
      )}

      {certStar && (
        <CertificateModal star={certStar} onClose={() => setCertStar(null)} />
      )}
    </div>
  );
}

export default App;
