'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { searchProducts } from '@/data/products';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/shop/fish', label: '🐟 ' + 'Fish' },
    { href: '/shop/prawns', label: '🦐 ' + 'Prawns' },
    { href: '/shop/crabs', label: '🦀 ' + 'Crabs' },
    { href: '/shop/dishes', label: '🍽️ ' + 'Dishes' },
    { href: '/map', label: '📍 Find Us' },
  ];

  return (
    <>
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="header-inner">
          {/* Logo */}
          <Link href="/" className="logo">
            <div className="logo-icon">🦐</div>
            <div className="logo-text">
              SLNS Fresh
              <span>Sea Foods</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-desktop">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname === l.href ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form className="search-bar" onSubmit={handleSearch}>
            <svg className="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('nav.search')}
            />
          </form>

          {/* Actions */}
          <div className="header-actions">
            {/* Language Switcher */}
            <LanguageSwitcher />

            <Link href="/search" className="icon-btn" aria-label="Search" title="Search">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
            <Link href="/cart" className="icon-btn" aria-label={t('nav.cart')} title={t('nav.cart')} style={{ position: 'relative' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>
              )}
            </Link>

            {/* User Icon / Avatar */}
            {user ? (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  className="icon-btn"
                  onClick={() => setUserDropOpen(!userDropOpen)}
                  aria-label={t('nav.account')}
                  title={user.displayName || user.email || t('nav.account')}
                  style={{ padding: '4px' }}
                  id="user-avatar-btn"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="avatar" width={28} height={28}
                      style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--accent)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 700,
                    }}>
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                </button>
                {userDropOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    minWidth: 180, zIndex: 1000, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.displayName || t('nav.account')}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email || user.phoneNumber}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserDropOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', fontSize: '0.88rem', color: 'var(--text-primary)', textDecoration: 'none' }}
                      id="my-account-link"
                    >
                      👤 {t('nav.account')}
                    </Link>
                    <button
                      onClick={async () => { setUserDropOpen(false); await signOut(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', fontSize: '0.88rem', color: 'var(--accent-warm)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                      id="sign-out-btn"
                    >
                      🚪 {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="icon-btn"
                onClick={() => setAuthOpen(true)}
                aria-label={t('nav.login')}
                title={t('nav.login')}
                id="signin-header-btn"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            )}

            {/* Hamburger */}
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu open">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${pathname === l.href ? ' active' : ''}`}
            >
              {l.label}
            </Link>
          ))}

          {/* Language switcher in mobile menu */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>🌐 {t('lang.label')}:</span>
            <LanguageSwitcher compact />
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
            <Link href="/cart" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛒 {t('nav.cart')} {itemCount > 0 && <span className="cart-badge" style={{ position: 'static' }}>{itemCount}</span>}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
