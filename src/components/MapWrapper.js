'use client';

import dynamic from 'next/dynamic';

// Leaflet requires browser APIs — must be dynamically imported with ssr:false
const LiveMapInner = dynamic(() => import('./LiveMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '420px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        color: 'var(--text-muted)',
      }}
    >
      <span style={{ fontSize: '2.5rem' }}>🗺️</span>
      <span style={{ fontSize: '0.9rem' }}>Loading map...</span>
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function MapWrapper({ height, showUserLocation }) {
  return <LiveMapInner height={height} showUserLocation={showUserLocation} />;
}
