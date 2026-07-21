import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedProducts, categories, products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import HeroSection from '@/components/HeroSection';
import MapWrapper from '@/components/MapWrapper';
import CustomerReviewsShowcase from '@/components/CustomerReviewsShowcase';

export const metadata = {
  title: 'SLNS Fresh Sea Foods — Fresh Fish, Prawns & Crabs Delivery Amalapuram',
  description:
    'Order fresh fish, prawns, crabs and authentic Andhra seafood dishes delivered to your door in Amalapuram. Farm-fresh, cleaned & ready to cook. Free delivery above ₹500.',
  keywords: 'fresh seafood Amalapuram, fish delivery Amalapuram, prawns delivery, crabs delivery, seafood near me, SLNS Fresh, Amma Sea Foods',
  openGraph: {
    title: 'SLNS Fresh Sea Foods — Premium Seafood Delivery',
    description: 'Fresh fish, prawns, crabs & Andhra dishes delivered to your door.',
    type: 'website',
  },
};

// LocalBusiness JSON-LD — Google shows this in search results
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'FoodEstablishment'],
  name: 'SLNS Fresh Sea Foods',
  alternateName: 'Amma Sea Foods',
  description: 'Fresh fish, prawns, crabs and authentic Andhra seafood dishes delivered to your door in Amalapuram.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://slnsfresh.vercel.app',
  telephone: '+917995177216',
  priceRange: '₹₹',
  servesCuisine: 'Seafood, Andhra',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Amalapuram',
    addressRegion: 'Andhra Pradesh',
    postalCode: '533201',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 16.582194,
    longitude: 82.024556,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '06:00',
      closes: '20:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Fresh Seafood Products',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Fresh Fish' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Tiger Prawns' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Mud Crabs' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Andhra Seafood Dishes' } },
    ],
  },
  sameAs: [
    'https://wa.me/917995177216',
  ],
};

export default function HomePage() {
  const featured = getFeaturedProducts();
  const rawFish = products.filter((p) => p.category === 'fish' && p.type === 'raw').slice(0, 4);
  const dishes = products.filter((p) => p.type === 'dish').slice(0, 4);

  return (
    <div className="page-wrapper">
      {/* Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Hero */}
      <HeroSection />

      {/* Categories */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Fresh from the water to your plate — choose your favourite</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link href={`/shop/${cat.slug}`} key={cat.id} className="category-card">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
                <div className="category-card-overlay">
                  <div className="category-card-icon">{cat.icon}</div>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </div>
                <div className="arrow">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </div>
              </Link>
            ))}
            {/* Dishes category card */}
            <Link href="/shop/dishes" className="category-card">
              <Image
                src="/images/fish/pexels-nithin-mohan-2646938-21926675.jpg"
                alt="Ready Dishes"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
              <div className="category-card-overlay">
                <div className="category-card-icon">🍽️</div>
                <h3>Ready Dishes</h3>
                <p>Cooked seafood dishes ready to serve</p>
              </div>
              <div className="arrow">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }} id="featured">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">⭐ Best Sellers</h2>
            <p className="section-subtitle">Our most loved products — fresh every day</p>
          </div>
          <div className="products-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/shop/fish" className="btn btn-primary btn-lg">
              View All Products
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Ready Dishes Banner */}
      <section className="section" id="dishes">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🍽️ Ready to Eat Dishes</h2>
            <p className="section-subtitle">Authentic Andhra recipes, cooked fresh and delivered hot</p>
          </div>
          <div className="products-grid">
            {dishes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/shop/dishes" className="btn btn-warm btn-lg">
              Order Fresh Dishes
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }} id="why-us">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose SLNS Fresh?</h2>
            <p className="section-subtitle">We go the extra mile to make sure you get the best</p>
          </div>
          <div className="trust-grid">
            {[
              { icon: '🌊', title: 'Daily Fresh Catch', desc: 'Every product sourced fresh every morning from local fishermen and farms.' },
              { icon: '🧹', title: 'Cleaned & Ready', desc: 'Fish descaled, prawns deveined, crabs cleaned — saving you time in the kitchen.' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Same-day delivery within city limits. Order by noon, get it by evening.' },
              { icon: '💯', title: 'Quality Guaranteed', desc: 'Not satisfied? We offer a full refund or replacement — no questions asked.' },
            ].map((item) => (
              <div key={item.title} className="trust-card">
                <div className="trust-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Showcase — displays all approved reviews for user attraction */}
      <CustomerReviewsShowcase />

      {/* Find Us — Live Map */}
      <section className="section" id="find-us">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(15,76,117,0.08)', borderRadius: 'var(--radius-full)', marginBottom: '1rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Map</span>
              </div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                📍 Find Our Store
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Know exactly where we are. Enable live location to see your distance from our store in real time — powered by OpenStreetMap.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                  ['🗺️', 'OpenStreetMap', 'Free, open-source mapping data'],
                  ['📡', 'Live GPS tracking', 'See your position update in real time'],
                  ['📏', 'Distance calculator', 'Know exactly how far we are'],
                  ['🧭', 'Get Directions', 'One-click navigation to our store'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1px' }}>{title}</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/map" className="btn btn-primary btn-lg" id="homepage-map-btn">
                🗺️ Open Full Map
              </Link>
            </div>
            <div>
              <MapWrapper height="380px" showUserLocation={true} />
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section style={{ background: '#25D366', padding: '3rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
            Order via WhatsApp — It&apos;s Easier!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem' }}>
            Message us your order and we&apos;ll confirm within minutes
          </p>
          <a
            href="https://wa.me/917995177216?text=Hi!%20I%20want%20to%20order%20fresh%20seafood."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg"
            style={{ background: 'white', color: '#25D366', fontWeight: 700, display: 'inline-flex', gap: '8px' }}
          >
            <svg width="22" height="22" fill="#25D366" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
