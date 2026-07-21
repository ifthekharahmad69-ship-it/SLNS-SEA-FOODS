'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Star component
function Stars({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{
            fontSize: interactive ? '1.6rem' : '1rem',
            cursor: interactive ? 'pointer' : 'default',
            color: star <= (hovered || rating) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// Format relative date
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d} days ago`;
  if (d < 365) return `${Math.floor(d / 30)} months ago`;
  return `${Math.floor(d / 365)} years ago`;
}

export default function ReviewSection({ productId, productName }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: '', rating: 0, comment: '', orderId: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill user name when logged in
  useEffect(() => {
    if (user && !form.name) {
      setForm((f) => ({ ...f, name: user.displayName || user.email?.split('@')[0] || '' }));
    }
  }, [user]);

  // Fetch approved reviews for this product with 15s live polling
  useEffect(() => {
    const fetchApprovedReviews = () => {
      fetch(`/api/reviews?productId=${productId}`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setReviews(d.reviews); })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchApprovedReviews();
    const interval = setInterval(fetchApprovedReviews, 15000); // 15s live refresh
    return () => clearInterval(interval);
  }, [productId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Please enter your name');
    if (!form.rating) return setFormError('Please select a star rating');
    if (form.comment.trim().length < 10) return setFormError('Please write at least 10 characters');

    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          name: form.name,
          rating: form.rating,
          comment: form.comment,
          orderId: form.orderId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px' }}>
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stars rating={Math.round(Number(avgRating))} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>{avgRating}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {!submitted ? (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn btn-primary btn-sm"
            id="write-review-btn"
          >
            {showForm ? '✕ Cancel' : '✏️ Write a Review'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '0.88rem', fontWeight: 600 }}>
            ✅ Review submitted — pending approval
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', marginBottom: '1.25rem' }}>Share Your Experience</h3>

          {/* Star rating picker */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Your Rating *
            </label>
            <Stars rating={form.rating} interactive={true} onRate={(r) => setForm((f) => ({ ...f, rating: r }))} />
            {form.rating > 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                {['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent!'][form.rating]}
              </span>
            )}
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>Your Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Ravi Kumar"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{ height: 42 }}
            />
          </div>

          {/* Review comment */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>Your Review *</label>
            <textarea
              className="form-textarea"
              placeholder="How was the freshness? Quality? Taste? (min 10 characters)"
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              rows={3}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{form.comment.length} characters</span>
          </div>

          {/* Order ID (optional) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>Order ID (optional)</label>
            <input
              className="form-input"
              placeholder="e.g. ORD-A3X9K — helps us verify your purchase"
              value={form.orderId}
              onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value.toUpperCase() }))}
              style={{ height: 42, fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}
            />
          </div>

          {formError && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {formError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            id="submit-review-btn"
            style={{ width: '100%' }}
          >
            {submitting ? '⏳ Submitting...' : '⭐ Submit Review'}
          </button>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
            Reviews are verified by our team before being published
          </p>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '1rem 0' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
          <p style={{ fontSize: '0.9rem' }}>No reviews yet — be the first to review!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <Stars rating={review.rating} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{review.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(review.createdAt)}</span>
                </div>
                {review.orderId && (
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', background: 'rgba(15,76,117,0.08)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    ✓ Verified purchase
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
