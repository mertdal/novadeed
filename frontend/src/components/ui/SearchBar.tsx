import { useState, useMemo, useRef, useEffect } from 'react';
import { useStarStore } from '../../stores/useStarStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from '../../services/translations';
import type { StarData } from '../../types';

export default function SearchBar() {
  const language = useLanguageStore((s) => s.language);
  const t = useTranslation(language);

  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const stars = useStarStore((s) => s.stars);
  const focusStar = useStarStore((s) => s.focusStar);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter stars by name
  const results = useMemo(() => {
    // If query is empty but expanded, show top stars
    if (!query.trim()) {
      return stars.slice(0, 8); 
    }
    
    return stars
      .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8); // Limit to top 8 results
  }, [query, stars]);

  const handleSelect = (star: StarData) => {
    focusStar(star);
    setQuery('');
    setIsOpen(false);
    setIsExpanded(false);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Keyboard shortcut (CMD/CTRL + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`search-container ${isOpen ? 'search-container--open' : ''} ${isExpanded ? 'search-container--expanded' : ''}`}>
      <div className={`search-box ${isExpanded ? 'search-box--expanded' : ''}`} onClick={!isExpanded ? handleExpand : undefined}>
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={t.search_placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setIsExpanded(true);
          }}
          className="search-input"
          style={{ 
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? 'auto' : 'none'
          }}
        />
        {isExpanded && query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="search-shortcut" style={{ opacity: isExpanded ? 1 : 0 }}>⌘K</div>
      </div>

      {isExpanded && isOpen && results.length > 0 && (
        <div className="search-results custom-scrollbar" style={{ width: '320px' }}>
          {results.map((star) => (
            <div
              key={star.id}
              className="search-result-item"
              onClick={() => handleSelect(star)}
            >
              <div className="search-result-info">
                <span className="search-result-name">{star.name}</span>
                <span className="search-result-meta">
                  {star.spectralClass} Class • {star.distance.toFixed(1)} LY
                </span>
              </div>
              <div className="search-result-action">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backdrop for click-away closure */}
      {isExpanded && (
        <div className="search-backdrop" onClick={() => {
          setIsOpen(false);
          setIsExpanded(false);
          setQuery('');
        }} />
      )}
    </div>
  );
}
