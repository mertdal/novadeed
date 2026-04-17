import { useStarStore } from '../../stores/useStarStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from '../../services/translations';
import type { TranslationKeys } from '../../services/translations';
import { STAR_LORE, DEFAULT_LORE } from '../../services/loreTranslations';
import PurchaseModal from './PurchaseModal';

const spectralKeyMap: Record<string, TranslationKeys> = {
  O: 'spectral_blue_supergiant',
  B: 'spectral_blue_white_giant',
  A: 'spectral_white_star',
  F: 'spectral_yellow_white_star',
  G: 'spectral_yellow_dwarf',
  K: 'spectral_orange_dwarf',
  M: 'spectral_red_dwarf',
};

export default function StarDrawer() {
  const language = useLanguageStore((s) => s.language);
  const t = useTranslation(language);

  const focusedStar = useStarStore((s) => s.focusedStar);
  const isFocusMode = useStarStore((s) => s.isFocusMode);
  const exitFocus = useStarStore((s) => s.exitFocus);
  const openPurchaseModal = useStarStore((s) => s.openPurchaseModal);
  const purchaseModalOpen = useStarStore((s) => s.purchaseModalOpen);

  if (!isFocusMode || !focusedStar) return null;

  const isBlackHole = focusedStar.id >= 8000 && focusedStar.id < 9000;
  const isNasaStar = focusedStar.isRealData === true;
  
  const spectralName = focusedStar.spectralClass 
    ? (t[spectralKeyMap[focusedStar.spectralClass] || 'class'] as string)
    : '';

  const loreData = STAR_LORE[focusedStar.name] || DEFAULT_LORE;
  const lore = loreData[language];

  return (
    <div className={`attr-panel ${focusedStar ? 'attr-panel--open' : ''}`} id="star-drawer">
      <div className="attr-panel-inner">
        <button className="attr-back" onClick={exitFocus}>
          <span>←</span> {t.close_drawer} [ESC]
        </button>

        <h3 className="attr-star-name">{focusedStar.name}</h3>
        
        <p className="attr-star-class">
          {isBlackHole
            ? t.black_hole
            : `${spectralName} · ${t.class} ${focusedStar.spectralClass}`}
        </p>

        {/* Data source badges */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {isNasaStar && (
            <div className="attr-badge attr-badge--nasa">
              <span>🛰️</span> {t.nasa_real_data}
            </div>
          )}
          {isBlackHole && (
            <div className="attr-badge attr-badge--blackhole">
              <span>🕳️</span> {t.singularity}
            </div>
          )}
        </div>

        {/* Attributes Grid */}
        <div className="attr-grid">
          <div className="attr-card">
            <div className="attr-card-label">{t.star_id}</div>
            <div className="attr-card-value attr-mono">#{focusedStar.id}</div>
          </div>
          <div className="attr-card">
            <div className="attr-card-label">{t.distance}</div>
            <div className="attr-card-value attr-mono">{Math.round(focusedStar.distance * 3.26)} LY</div>
          </div>
          <div className="attr-card">
            <div className="attr-card-label">{t.magnitude}</div>
            <div className="attr-card-value attr-mono">{focusedStar.magnitude.toFixed(2)} mag</div>
          </div>
          <div className="attr-card">
            <div className="attr-card-label">{t.spectral_class}</div>
            <div className="attr-card-value attr-mono">{focusedStar.spectralClass}</div>
          </div>
        </div>

        {/* Status */}
        {!isBlackHole && (
          <div
            className={`attr-status ${focusedStar.isOwned ? 'attr-status--owned' : 'attr-status--available'}`}
          >
            {focusedStar.isOwned ? t.status_classified : t.status_unclaimed}
          </div>
        )}

        {/* Owner info */}
        {!isBlackHole && focusedStar.isOwned && focusedStar.ownerName && (
          <div className="attr-owner">
            <span className="attr-owner-label">{t.named_by}</span>
            <span className="attr-owner-name">{focusedStar.ownerName}</span>
          </div>
        )}

        {/* Purchase */}
        {!isBlackHole && (
          <div className="attr-purchase">
            <div className="attr-price">
              <span className="attr-price-label attr-mono text-xs text-slate-500">[ {t.registration_fee} ]</span>
              <span className="attr-price-value">${focusedStar.price}</span>
            </div>

            {!focusedStar.isOwned ? (
              <button className="attr-buy-btn attr-mono" id="attr-buy-btn" onClick={openPurchaseModal}>
                <span>[ {t.claim_this_star.toUpperCase()} ]</span>
              </button>
            ) : (
              <button className="attr-buy-btn attr-buy-btn--disabled attr-mono" disabled>
                <span>[ {t.already_owned.toUpperCase()} ]</span>
              </button>
            )}
          </div>
        )}

        {/* Localized Lore Section (Integrated into the same panel) */}
        <div className="attr-lore-section" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', marginTop: '32px', paddingTop: '16px' }}>
          <div className="history-section">
            <h3 className="history-section-title attr-mono" style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginBottom: '8px' }}>
              [ {language === 'tr' ? 'LOG.01_MİTOLOJİ' : 'LOG.01_MYTHOS'} ]
            </h3>
            <p className="history-section-text" style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px' }}>{lore.mythology}</p>
          </div>

          <div className="history-section">
            <h3 className="history-section-title attr-mono" style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginBottom: '8px' }}>
              [ {language === 'tr' ? 'LOG.02_KEŞİF' : 'LOG.02_DISCOVERY'} ]
            </h3>
            <p className="history-section-text" style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px' }}>{lore.discovery}</p>
          </div>

          <div className="history-section">
            <h3 className="history-section-title attr-mono" style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginBottom: '8px' }}>
              [ {language === 'tr' ? 'LOG.03_ANALİZ' : 'LOG.03_ANALYSIS'} ]
            </h3>
            <p className="history-section-text" style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>{lore.significance}</p>
          </div>
        </div>
      </div>

      {purchaseModalOpen && <PurchaseModal star={focusedStar} />}
    </div>
  );
}
