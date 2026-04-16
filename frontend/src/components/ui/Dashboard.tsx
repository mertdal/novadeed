import { useEffect, useState } from 'react';
import { getOwnedStars } from '../../services/api';
import type { OwnedStarDto } from '../../services/api';
import { useStarStore } from '../../stores/useStarStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from '../../services/translations';

interface DashboardProps {
  onClose: () => void;
}

export default function Dashboard({ onClose }: DashboardProps) {
  const language = useLanguageStore((s) => s.language);
  const t = useTranslation(language);
  const [myStars, setMyStars] = useState<OwnedStarDto[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const stars = useStarStore((s) => s.stars);
  const focusStar = useStarStore((s) => s.focusStar);
  const setCertStar = useStarStore((s) => s.setCertStar);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const fetchMyStars = async () => {
      try {
        const data = await getOwnedStars();
        setMyStars(data);
      } catch (e) {
        console.error('Dashboard fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyStars();
  }, []);

  const handleFlyTo = (catalogId: number) => {
    const star = stars.find((s) => s.id === catalogId);
    if (star) {
      focusStar(star);
      onClose();
    }
  };

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-content" id="dashboard-modal">
        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="dashboard-header">
          <div className="dashboard-user-info">
            <div className="dashboard-avatar">
              {user?.name.charAt(0)}
            </div>
            <div className="auth-header" style={{ paddingLeft: '16px', marginBottom: 0 }}>
              <h2 className="auth-title" style={{ fontSize: '24px' }}>{user?.name}</h2>
              <p className="auth-desc">{user?.email} // ACCESS_LEVEL: EXPLORER</p>
            </div>
          </div>
          <button className="logout-btn btn-technical" onClick={logout}>{t.logout}</button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-label">{t.stars_owned}</span>
            <span className="stat-value">{myStars.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t.rank}</span>
            <span className="stat-value" style={{ fontSize: '18px', color: 'var(--color-accent)' }}>{t.stellar_explorer}</span>
          </div>
        </div>

        <div className="dashboard-section">
          <h3 className="auth-desc" style={{ color: '#475569', marginBottom: '8px' }}>[ {t.my_collection} ]</h3>
          
          {loading ? (
             <div className="dashboard-loading auth-desc">{t.syncing}</div>
          ) : myStars.length === 0 ? (
            <div className="dashboard-empty">
               <p className="auth-desc">{t.no_stars_yet}</p>
               <button className="landing-btn landing-btn--primary" onClick={onClose} style={{ padding: '8px 16px' }}>
                 {t.explore_cosmos}
               </button>
            </div>
          ) : (
            <div className="dashboard-grid custom-scrollbar">
              {myStars.map((s) => {
                const catalogStar = stars.find(st => st.id === s.starCatalogId);
                return (
                  <div key={s.id} className="owned-star-card" onClick={() => handleFlyTo(s.starCatalogId)}>
                    <div className="owned-star-header">
                      <span className="owned-star-name">{s.name}</span>
                      <span className="owned-star-date">{new Date(s.purchasedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR')}</span>
                    </div>
                    
                    <div className="owned-star-coords">
                      ID: {s.starCatalogId} // {catalogStar?.spectralClass || 'STAR'} CLASS
                    </div>
                    
                    <div className="owned-star-actions">
                      <button className="dashboard-action-link btn-technical" onClick={(e) => { e.stopPropagation(); handleFlyTo(s.starCatalogId); }}>
                        {t.fly_to}
                      </button>
                      {catalogStar && (
                        <button className="dashboard-action-link btn-technical" onClick={(e) => { e.stopPropagation(); setCertStar(catalogStar); }}>
                          {t.certificate}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-backdrop" onClick={onClose} />
    </div>
  );
}
