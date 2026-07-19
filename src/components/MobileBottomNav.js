'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t } = useLanguage();

  const tabs = [
    {
      href: '/',
      label: t('nav.home'),
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: '/shop/fish',
      label: t('nav.shop'),
      icon: <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🐟</span>,
      matchPrefix: '/shop',
    },
    {
      href: '/search',
      label: 'Search',
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      ),
    },
    {
      href: '/cart',
      label: t('nav.cart'),
      hasCount: true,
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      href: '/track',
      label: t('nav.track'),
      icon: <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>📦</span>,
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <div className="mobile-bottom-nav-inner">
        {tabs.map((tab) => {
          const isActive = tab.matchPrefix
            ? pathname.startsWith(tab.matchPrefix)
            : pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`mobile-nav-item${isActive ? ' active' : ''}`}
              aria-label={tab.label}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.hasCount && itemCount > 0 && <span className="cart-dot" />}
              <span style={{ fontSize: '0.62rem' }}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
