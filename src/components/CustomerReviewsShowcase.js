'use client';

import { useState, useEffect } from 'react';

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: '1.1rem',
            color: star <= rating ? '#f59e0b' : '#d1d5db',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function CustomerReviewsShowcase() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setReviews(d.reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || reviews.length === 0) return null;

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)', borderRadius: '999px',
            marginBottom: '1rem',
          }}>
            <span style={{ fontSize: '1rem' }}>⭐</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Customer Experience ({avgRating} ★ Rating)
            </span>
          </div>

          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
            Loved by Seafood Lovers Across Amalapuram
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Real reviews from verified customers who enjoy our daily fresh fish, prawns, and authentic Andhra seafood dishes.
          </p>
        </div>

        {/* Reviews Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
              }}
              className="review-showcase-card"
            >
              <div>
                {/* Rating + Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <Stars rating={review.rating} />
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-green)',
                    background: 'rgba(16,185,129,0.1)', padding: '3px 10px',
                    borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    ✓ Verified Customer
                  </span>
                </div>

                {/* Comment */}
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  marginBottom: '1.25rem',
                  fontWeight: 500,
                }}>
                  &quot;{review.comment}&quot;
                </p>
              </div>

              {/* Author Info */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, color: 'var(--text-primary)' }}>
                    {review.name}
                  </h4>
                  {review.productName && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--accent)', margin: '2px 0 0', fontWeight: 600 }}>
                      🐟 {review.productName}
                    </p>
                  )}
                </div>

                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                  {(review.name || '?')[0].toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
