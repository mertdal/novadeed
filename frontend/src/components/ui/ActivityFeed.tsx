import { useEffect, useState } from 'react';
import { getAllOwnedStars } from '../../services/api';
import type { OwnedStarDto } from '../../services/api';
import { useStarStore } from '../../stores/useStarStore';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<OwnedStarDto[]>([]);
  const isFocusMode = useStarStore((s) => s.isFocusMode);
  const focusStar = useStarStore((s) => s.focusStar);
  const stars = useStarStore((s) => s.stars);

  const fetchActivities = async () => {
    try {
      const data = await getAllOwnedStars();
      // Only keep the latest 5 for the feed
      setActivities(data.slice(0, 5));
    } catch (e) {
      console.error('Failed to fetch activity feed', e);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleFlyTo = (catalogId: number) => {
    const star = stars.find((s) => s.id === catalogId);
    if (star) {
      focusStar(star);
    }
  };

  // Do not show activity feed in focus mode or if empty
  if (isFocusMode || activities.length === 0) return null;

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <span className="pulsing-dot" />
        <span className="activity-feed-title">LIVE FEED</span>
      </div>
      <div className="activity-feed-list">
        {activities.map((act) => (
          <div key={act.id} className="activity-item" onClick={() => handleFlyTo(act.starCatalogId)}>
            <div className="activity-item-icon">✦</div>
            <div className="activity-item-content">
              <span className="activity-user">{act.ownerName}</span>
              <span className="activity-text">claimed</span>
              <span className="activity-star">{act.name}</span>
            </div>
            <div className="activity-item-time">
               {new Date(act.purchasedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
