import MapWrapper from '@/components/MapWrapper';
import Link from 'next/link';

export const metadata = {
  title: 'Our Location & Live Map | SLNS Fresh Sea Foods',
  description: 'Find SLNS Fresh Sea Foods on the map. Track your distance, get directions, and order fresh seafood delivered to your door.',
};

export default function MapPage() {
  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">›</span>
          <span>Our Location</span>
        </nav>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>📍 Find Us</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Visit our store or check your distance for delivery
            </p>
          </div>
          <a
            href="https://wa.me/917995177216?text=Hi! I want to place a delivery order."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            id="map-page-whatsapp-btn"
          >
            <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Order via WhatsApp
          </a>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Map */}
          <div>
            <MapWrapper height="520px" showUserLocation={true} />
          </div>

          {/* Store Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Store card */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div className="logo-icon">🦐</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem' }}>SLNS Fresh Sea Foods</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 500 }}>● Open Now</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>📍</span>
                  <span>Red Bridge, Amalapuram - 533201, AP, India</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>🕐</span>
                  <span>7:00 AM – 9:00 PM (Daily)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>📞</span>
                  <a href="tel:+917995177216" style={{ color: 'var(--accent)' }}>+91 79951 77216</a>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>🚀</span>
                  <span>Free delivery above ₹500</span>
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/jAZHit8dtPyE7f8f7"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', textAlign: 'center', display: 'block' }}
                id="open-google-maps-btn"
              >
                🗺️ Open in Google Maps
              </a>
            </div>

            {/* How to use map */}
            <div style={{ background: 'linear-gradient(135deg, rgba(15,76,117,0.06), rgba(50,130,184,0.06))', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid rgba(15,76,117,0.12)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>How to use live distance</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0 }}>1️⃣</span>
                  <span>Click <strong>&quot;📍 Share Location&quot;</strong> to enable GPS</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0 }}>2️⃣</span>
                  <span>See exact distance in km from your location to store</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0 }}>3️⃣</span>
                  <span>Click <strong>&quot;Navigate on Google Maps&quot;</strong> for direct turn-by-turn directions</span>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/track" className="btn btn-ghost" style={{ textAlign: 'center' }} id="map-track-order-btn">
                📦 Track My Order
              </Link>
            </div>
            </div>
          </div>
        </div>

        {/* Mobile: stack */}
        <style>{`
          @media (max-width: 768px) {
            .map-layout { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
