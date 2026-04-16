import { useState } from 'react';
import { useStarStore } from '../../stores/useStarStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from '../../services/translations';
import { purchaseStar } from '../../services/api';
import { audioManager } from '../../services/audioManager';
import type { StarData } from '../../types';

interface PurchaseModalProps {
  star: StarData;
}

export default function PurchaseModal({ star }: PurchaseModalProps) {
  const language = useLanguageStore((s) => s.language);
  const t = useTranslation(language);

  const user = useAuthStore((s) => s.user);
  const closePurchaseModal = useStarStore((s) => s.closePurchaseModal);
  const syncOwnedStars = useStarStore((s) => s.syncOwnedStars);
  const markStarOwned = useStarStore((s) => s.markStarOwned);
  
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [starName, setStarName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ownerName.trim() || !starName.trim() || !email.trim()) return;

    setIsPurchasing(true);
    setError(null);
    audioManager.playBlip();

    try {
      await purchaseStar({
        starCatalogId: star.id,
        starName: star.name,
        customName: starName,
        price: star.price,
      });

      markStarOwned(star.id, ownerName);
      await syncOwnedStars();
      
      setIsPurchasing(false);
      setPurchaseComplete(true);
      audioManager.playChime();

      setTimeout(() => {
        setPurchaseComplete(false);
        closePurchaseModal();
      }, 3000);
    } catch (err: any) {
      console.error('Purchase failed', err);
      setError(err.message || t.error);
      setIsPurchasing(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={closePurchaseModal}>
      <div className="auth-modal purchase-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={closePurchaseModal}>✕</button>

        {!purchaseComplete ? (
          <>
            <div className="auth-header">
              <h2 className="auth-title">{t.purchase_star}</h2>
              <p className="auth-desc">TARGET: {star.name} // FEE: ${star.price}</p>
            </div>

            <form className="auth-form" onSubmit={handlePurchase}>
              <div className="auth-field">
                <label className="auth-label">{t.owner_name_label}</label>
                <input
                  className="auth-input"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">{t.custom_name_label}</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder={star.name}
                  value={starName}
                  onChange={(e) => setStarName(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">{t.email_label}</label>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {star.isRealData && (
                <div className="attr-badge attr-badge--nasa" style={{ marginBottom: '16px' }}>
                  <span>🛰️</span> {t.nasa_real_data}
                </div>
              )}
              <div className="auth-divider">
                <span>{t.total}: ${star.price}</span>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button className="auth-submit" type="submit" disabled={isPurchasing}>
                {isPurchasing ? t.purchasing : t.confirm_purchase}
              </button>
            </form>
          </>
        ) : (
          <div className="purchase-success">
            <div className="success-icon" style={{ fontSize: '48px', color: 'var(--color-accent)', marginBottom: '16px', textAlign: 'center' }}>✓</div>
            <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '8px' }}>{t.success}</h3>
            <p style={{ color: '#64748b', textAlign: 'center', fontSize: '14px' }}>{t.registry_stored}</p>
          </div>
        )}
      </div>
    </div>
  );
}
