import type { StarData } from '../../types';

interface CertificateModalProps {
  star: StarData;
  onClose: () => void;
}

export default function CertificateModal({ star, onClose }: CertificateModalProps) {
  return (
    <div className="certificate-overlay">
      <div className="certificate-document">
        <div className="cert-border cert-border--tl" />
        <div className="cert-border cert-border--tr" />
        <div className="cert-border cert-border--bl" />
        <div className="cert-border cert-border--br" />

        <div className="cert-header">
          <div className="cert-logo">✦</div>
          <div className="cert-title-group">
            <h1 className="cert-title">CERTIFICATE OF REGISTRY</h1>
            <p className="cert-subtitle">INTERNATIONAL STAR DATABASE & NOVADEED PROTOCOL</p>
          </div>
        </div>

        <div className="cert-body">
          <p className="cert-intro">This is to certify the official assignment and registration of the star known as:</p>
          
          <div className="cert-star-name">
            {star.name.toUpperCase()}
          </div>

          <div className="cert-data-grid">
            <div className="cert-data-item">
              <span className="cert-data-label">COORDINATES</span>
              <span className="cert-data-value">X:{star.position.x.toFixed(1)} Y:{star.position.y.toFixed(1)} Z:{star.position.z.toFixed(1)}</span>
            </div>
            <div className="cert-data-item">
              <span className="cert-data-label">SPECTRAL CLASS</span>
              <span className="cert-data-value">{star.spectralClass}</span>
            </div>
            <div className="cert-data-item">
              <span className="cert-data-label">DISTANCE</span>
              <span className="cert-data-value">{star.distance.toFixed(1)} LIGHT YEARS</span>
            </div>
            <div className="cert-data-item">
              <span className="cert-data-label">REGISTRY ID</span>
              <span className="cert-data-value">ND-{star.id}-{(Math.random() * 1000).toFixed(0)}</span>
            </div>
          </div>

          <div className="cert-owner-section">
            <p className="cert-owner-label">OFFICIALLY REGISTERED TO</p>
            <h2 className="cert-owner-name">{star.ownerName || 'PENDING ASSIGNMENT'}</h2>
          </div>
        </div>

        <div className="cert-footer">
          <div className="cert-stamp">
             <svg width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="0.5" />
                <text x="50" y="52" fontSize="6" textAnchor="middle" fill="currentColor">NOVADEED SEAL</text>
             </svg>
          </div>
          <div className="cert-signatures">
            <div className="signature">
              <div className="sig-line">M. Dal</div>
              <span className="sig-label">Chief Registrar</span>
            </div>
            <div className="signature">
              <div className="sig-line">Automated Protocol 9.0</div>
              <span className="sig-label">Validation System</span>
            </div>
          </div>
        </div>
        
        <button className="cert-close-btn" onClick={onClose}>CLOSE DOCUMENT</button>
      </div>
      <div className="certificate-backdrop" onClick={onClose} />
    </div>
  );
}
