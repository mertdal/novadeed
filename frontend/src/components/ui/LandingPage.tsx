import { useAuthStore } from '../../stores/useAuthStore';
import { useState, useEffect } from 'react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from '../../services/translations';

export default function LandingPage() {
  const language = useLanguageStore((s) => s.language);
  const t = useTranslation(language);
  
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  const openSignIn = useAuthStore((s) => s.openSignIn);
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const showAuthModal = useAuthStore((s) => s.showAuthModal);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // Try to restore session on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="landing" id="landing-page">
      {/* Top right language selector */}
      <div className="landing-top-right">
        <button 
          className="hud-lang-btn attr-mono" 
          onClick={toggleLanguage}
          style={{ background: 'rgba(2, 6, 23, 0.4)', borderColor: 'rgba(56, 189, 248, 0.3)' }}
        >
          {language.toUpperCase()}
        </button>
      </div>
      {/* Animated star background */}
      <div className="landing-stars">
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={i}
            className="landing-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Radial gradient overlay */}
      <div className="landing-glow" />

      {/* Main content */}
      <div className="landing-content">
        <div className="landing-logo">✦</div>
        <h1 className="landing-title">
          {t.explore_universe} <span className="landing-title-accent">{t.universe}</span>
        </h1>
        <p className="landing-subtitle">
          {t.landing_subtitle}
        </p>

        <div className="landing-buttons">
          <button className="landing-btn landing-btn--primary" id="landing-signup" onClick={openSignUp}>
            <span>{t.initialize_join}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="landing-btn landing-btn--secondary" id="landing-signin" onClick={openSignIn}>
            <span>{t.resume_session}</span>
          </button>
        </div>

        <div className="landing-stats">
          <div className="landing-stat">
            <span className="landing-stat-value">274+</span>
            <span className="landing-stat-label">{language === 'en' ? 'Stars' : 'Yıldız'}</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-value">NASA</span>
            <span className="landing-stat-label">{language === 'en' ? 'Real Data' : 'Gerçek Veri'}</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-value">3D</span>
            <span className="landing-stat-label">{language === 'en' ? 'Navigation' : 'Navigasyon'}</span>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal />}
    </div>
  );
}

function AuthModal() {
  const language = useLanguageStore((s) => s.language);
  const t = useTranslation(language);

  const authMode = useAuthStore((s) => s.authMode);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const openSignIn = useAuthStore((s) => s.openSignIn);
  const openSignUp = useAuthStore((s) => s.openSignUp);
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const registerWithEmail = useAuthStore((s) => s.registerWithEmail);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const storeLoading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isSignUp = authMode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await registerWithEmail(name, email, password);
    } else {
      await loginWithEmail(email, password);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  // Clear error when switching modes
  useEffect(() => {
    clearError();
  }, [authMode, clearError]);

  return (
    <div className="auth-overlay" onClick={closeAuthModal}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="auth-close" onClick={closeAuthModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="auth-header">
          <h2 className="auth-title">{isSignUp ? t.new_explorer : t.identity_verification}</h2>
          <p className="auth-desc">
            {isSignUp
              ? t.establish_link
              : t.restore_access}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <button className="auth-google" id="auth-google-btn" onClick={handleGoogleLogin} disabled={storeLoading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{language === 'en' ? 'Continue with Google' : 'Google ile Devam Et'}</span>
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>{language === 'en' ? 'or' : 'veya'}</span>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="auth-field">
              <label className="auth-label">{language === 'en' ? 'Name' : 'Ad Soyad'}</label>
              <input
                className="auth-input"
                type="text"
                placeholder={language === 'en' ? 'Your name' : 'Adınız'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">{language === 'en' ? 'Password' : 'Şifre'}</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="auth-submit" type="submit" disabled={storeLoading}>
            {storeLoading ? (
              <span className="auth-loading">
                <span className="spinner" /> {t.syncing}
              </span>
            ) : (
              isSignUp ? t.create_link : t.authorize_access
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="auth-toggle">
          {isSignUp ? (
            <span>
              {t.already_have_account}{' '}
              <button className="auth-toggle-btn" onClick={openSignIn}>
                {language === 'en' ? 'Sign In' : 'Giriş Yap'}
              </button>
            </span>
          ) : (
            <span>
              {t.dont_have_account}{' '}
              <button className="auth-toggle-btn" onClick={openSignUp}>
                {language === 'en' ? 'Sign Up' : 'Kayıt Ol'}
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
