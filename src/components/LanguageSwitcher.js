'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '@/context/LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Select language"
        title={t('lang.label')}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: compact ? '5px 10px' : '6px 12px',
          borderRadius: '999px',
          border: '1.5px solid var(--border)',
          background: open ? 'var(--accent)' : 'var(--bg-card)',
          color: open ? 'white' : 'var(--text-secondary)',
          cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
          boxShadow: open ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <span style={{ fontSize: '1rem' }}>🌐</span>
        {!compact && (
          <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>
            {current.nativeLabel}
          </span>
        )}
        <span style={{ fontSize: '0.6rem', opacity: 0.7, marginLeft: '1px' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          minWidth: 160,
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{ padding: '6px 12px 6px', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('lang.label')}
          </div>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '10px 14px',
                background: lang === l.code ? 'rgba(15,76,117,0.08)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: '0.9rem', fontWeight: lang === l.code ? 700 : 400,
                color: lang === l.code ? 'var(--accent)' : 'var(--text-primary)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (lang !== l.code) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = lang === l.code ? 'rgba(15,76,117,0.08)' : 'transparent'; }}
            >
              <span style={{ fontSize: '1.1rem' }}>{l.flag}</span>
              <div>
                <div style={{ lineHeight: 1.2 }}>{l.nativeLabel}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{l.label}</div>
              </div>
              {lang === l.code && (
                <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '0.9rem' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
