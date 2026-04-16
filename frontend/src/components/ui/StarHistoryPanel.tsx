import { useStarStore } from '../../stores/useStarStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { STAR_LORE, DEFAULT_LORE } from '../../services/loreTranslations';

export default function StarHistoryPanel() {
  const language = useLanguageStore((s) => s.language);
  const focusedStar = useStarStore((s) => s.focusedStar);
  const isFocusMode = useStarStore((s) => s.isFocusMode);

  if (!isFocusMode || !focusedStar) return null;

  // Get localized lore or fallback to localized default
  const loreData = STAR_LORE[focusedStar.name] || DEFAULT_LORE;
  const lore = loreData[language];

  return (
    <div className="history-panel" id="history-panel">
      <div className="history-panel-inner">
        <div className="history-section">
          <h3 className="history-section-title attr-mono" style={{ color: 'var(--color-text-muted)' }}>
            [ {language === 'tr' ? 'LOG.01_MİTOLOJİ' : 'LOG.01_MYTHOS'} ]
          </h3>
          <p className="history-section-text">{lore.mythology}</p>
        </div>

        <div className="history-divider" style={{ borderBottom: '1px dashed var(--color-panel-border)', background: 'transparent' }} />

        <div className="history-section">
          <h3 className="history-section-title attr-mono" style={{ color: 'var(--color-text-muted)' }}>
            [ {language === 'tr' ? 'LOG.02_KEŞİF' : 'LOG.02_DISCOVERY'} ]
          </h3>
          <p className="history-section-text">{lore.discovery}</p>
        </div>

        <div className="history-divider" style={{ borderBottom: '1px dashed var(--color-panel-border)', background: 'transparent' }} />

        <div className="history-section">
          <h3 className="history-section-title attr-mono" style={{ color: 'var(--color-text-muted)' }}>
            [ {language === 'tr' ? 'LOG.03_ANALİZ' : 'LOG.03_ANALYSIS'} ]
          </h3>
          <p className="history-section-text">{lore.significance}</p>
        </div>
      </div>
    </div>
  );
}
