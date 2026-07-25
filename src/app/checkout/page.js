'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AuthGateModal from '@/components/AuthGateModal';

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || '7995177216@ybl';
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'Amma Sea Foods';

export default function CheckoutPage() {
  const { items, subtotal, savings, delivery, total, clearCart } = useCart();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [showAuth, setShowAuth] = useState(false);

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', pincode: '', notes: '',
    payment: 'cod',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [confirmedDocId, setConfirmedDocId] = useState('');

  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrCopied, setUtrCopied] = useState(false);

  // ── Promo code ──────────────────────────────────────────────────────────────
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [availablePromos, setAvailablePromos] = useState([]);

  useEffect(() => {
    fetch('/api/promo/active')
      .then((r) => r.json())
      .then((d) => { if (d.success) setAvailablePromos(d.codes); })
      .catch(() => {});
  }, []);

  const [slot, setSlot] = useState('');

  const promoDiscount = promoApplied?.discount || 0;
  const finalTotal = Math.max(0, total - promoDiscount);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid 10-digit number';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode))
      e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setStep(2);
  };

  // ── Apply promo ──────────────────────────────────────────────────────────────
  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoApplied(null);
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), orderTotal: total }),
      });
      const data = await res.json();
      if (!res.ok) setPromoError(data.error || 'Invalid promo code');
      else setPromoApplied({ code: data.code, discount: data.discount, description: data.description });
    } catch {
      setPromoError('Could not validate. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  // ── Confirm order ────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone, email: form.email,
          address: form.address, city: form.city, pincode: form.pincode,
          notes: form.notes, payment: form.payment,
          items, subtotal, delivery, total: finalTotal,
          promoCode: promoApplied?.code || null,
          promoDiscount,
          slot: slot || null,
          userId: user?.uid || null,
          paymentStatus: form.payment === 'upi' ? 'pending' : 'cod',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setConfirmedOrderId(data.orderId);
      setConfirmedDocId(data.docId);

      const lines = items.map((i) => `• ${i.name} x${i.qty} — ₹${i.price * i.qty}`).join('\n');
      const payLabel = form.payment === 'upi' ? '📱 UPI / QR Code (pending verification)' : '💵 Cash on Delivery';
      const slotLabel = slot === 'morning' ? '🌅 Morning (6am–12pm)' : slot === 'evening' ? '🌆 Evening (3pm–8pm)' : 'Anytime';
      const promoLine = promoApplied ? `*Promo:* ${promoApplied.code} (−₹${promoDiscount})\n` : '';
      const msg = `🛒 *New Order — SLNS Fresh Sea Foods*\n\n*Order ID:* ${data.orderId}\n*Customer:* ${form.name}\n*Phone:* ${form.phone}\n*Address:* ${form.address}, ${form.city} - ${form.pincode}\n*Slot:* ${slotLabel}\n*Payment:* ${payLabel}\n\n*Items:*\n${lines}\n\n${promoLine}*Total: ₹${finalTotal}*\n${form.notes ? `*Notes:* ${form.notes}` : ''}`;
      window.open(`https://wa.me/917995177216?text=${encodeURIComponent(msg)}`, '_blank');

      if (form.payment === 'upi') {
        setStep('upi');
      } else {
        clearCart();
        setStep(3);
      }
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── UPI UTR submit ───────────────────────────────────────────────────────────
  const handleUtrSubmit = async () => {
    if (!utrNumber.trim()) {
      setUtrError('Please enter the UTR / Transaction ID from your payment app.');
      return;
    }
    setSubmittingUtr(true);
    setUtrError('');
    try {
      await fetch(`/api/orders/${confirmedDocId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utrNumber }),
      });
      clearCart();
      setStep(3);
    } catch {
      setUtrError('Could not save your transaction ID. Screenshot your payment and contact us on WhatsApp.');
    } finally {
      setSubmittingUtr(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setUtrCopied(true);
    setTimeout(() => setUtrCopied(false), 2000);
  };

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalTotal}&cu=INR&tn=${encodeURIComponent('Order ' + confirmedOrderId)}`;

  // ── Auth guard ───────────────────────────────────────────────────────────────
  if (!loading && !user) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem', padding: '2rem 1rem' }}>
          <div style={{ fontSize: '3rem' }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>Sign in to Checkout</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 300 }}>Create a free account or sign in to place your order and track it.</p>
          <button
            onClick={() => setShowAuth(true)}
            style={{ background: 'linear-gradient(135deg,var(--accent),#1a6fa8)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '14px 28px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%', maxWidth: 320 }}
          >
            🦐 Sign In / Create Account
          </button>
          {showAuth && <AuthGateModal message="Sign in to place your order" onClose={() => setShowAuth(false)} />}
        </div>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────────
  if (items.length === 0 && step !== 3) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Nothing to checkout</h2>
            <p>Your cart is empty. Add some seafood first!</p>
            <Link href="/shop/fish" className="btn btn-primary btn-lg">Shop Now</Link>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  STEP 3 — SUCCESS
  // ══════════════════════════════════════════════════════════════════════
  if (step === 3) {
    const isUpi = form.payment === 'upi';
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty-icon">{isUpi ? '🎉' : '✅'}</div>
            <h2>{isUpi ? 'Payment Received!' : 'Order Placed!'}</h2>
            {confirmedOrderId && (
              <div style={{ background: 'var(--bg-card)', border: '2px solid var(--accent)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 2rem', margin: '1rem auto', maxWidth: 320, textAlign: 'center' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, fontWeight: 600 }}>Your Order ID</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{confirmedOrderId}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Save this to track your order</p>
              </div>
            )}
            <p style={{ maxWidth: 320, margin: '0.75rem auto 1.5rem', textAlign: 'center' }}>
              {isUpi
                ? `Your UPI payment has been noted, ${form.name}! We'll verify and confirm your order within a few minutes.`
                : `Your order has been saved. Our team will confirm within a few minutes. Thank you, ${form.name}!`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 320, margin: '0 auto' }}>
              <Link href={`/track?id=${confirmedOrderId}`} className="btn btn-primary btn-lg" id="order-track-btn" style={{ width: '100%' }}>Track My Order →</Link>
              <Link href="/" className="btn btn-ghost btn-lg" id="order-success-home-btn" style={{ width: '100%' }}>Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  STEP 'upi' — QR CODE PAYMENT
  // ══════════════════════════════════════════════════════════════════════
  if (step === 'upi') {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div style={{ maxWidth: 480, margin: '1.5rem auto', padding: '0 0 6rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>📱</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.25rem', fontSize: '1.4rem' }}>Pay via UPI / QR Code</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Scan with PhonePe, GPay, Paytm or any UPI app</p>
            </div>

            <div style={{ background: 'linear-gradient(135deg, var(--accent), #1a7abf)', borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center', color: 'white', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: 4 }}>Amount to Pay</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>₹{finalTotal}</p>
              <p style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: 4 }}>Order: {confirmedOrderId}</p>
            </div>

            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
              <QRCode value={upiUrl} size={200} bgColor="#ffffff" fgColor="#0f4c75" level="M" />
              <p style={{ fontSize: '0.78rem', color: '#555', textAlign: 'center', margin: 0 }}>Scan · Amount pre-filled ₹{finalTotal}</p>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>OR pay manually:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', flex: 1, wordBreak: 'break-all' }}>{UPI_ID}</code>
                <button onClick={copyUpiId} className="btn btn-sm btn-ghost" style={{ flexShrink: 0, fontSize: '0.8rem' }} id="copy-upi-btn">
                  {utrCopied ? '✅' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.125rem', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>After paying, enter your UTR / Transaction ID:</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 427819273641"
                value={utrNumber}
                onChange={(e) => { setUtrNumber(e.target.value); setUtrError(''); }}
                id="utr-input"
                style={{ marginBottom: '0.75rem' }}
              />
              {utrError && <p style={{ color: 'var(--accent-warm)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>⚠️ {utrError}</p>}
              <button onClick={handleUtrSubmit} disabled={submittingUtr} className="btn btn-primary btn-lg" style={{ width: '100%' }} id="utr-submit-btn">
                {submittingUtr ? '⏳ Saving...' : "✅ I've Paid — Confirm Order"}
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Paid but can't find UTR?{' '}
              <button onClick={() => { clearCart(); setStep(3); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem', padding: 0 }} id="skip-utr-btn">
                Skip & confirm
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  STEPS 1 & 2 — MAIN CHECKOUT FORM
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="co-page">
      {/* ── Progress Bar ── */}
      <div className="co-progress">
        {[t('checkout.step1'), t('checkout.step2')].map((s, i) => (
          <div key={s} className={`co-progress-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
            <span className="co-step-dot">{step > i + 1 ? '✓' : i + 1}</span>
            <span className="co-step-label">{s}</span>
            {i < 1 && <span className="co-step-sep">›</span>}
          </div>
        ))}
      </div>

      <div className="co-body">

        {/* ════ ORDER ITEMS ════ */}
        <div className="co-card">
          <div className="co-card-header">
            <span className="co-card-icon">🛒</span>
            <h3 className="co-card-title">Your Order ({items.length} item{items.length !== 1 ? 's' : ''})</h3>
          </div>
          <div className="co-items-list">
            {items.map((item) => (
              <div key={item.id} className="co-item">
                <div className="co-item-img">
                  <Image
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover', borderRadius: 10, display: 'block' }}
                    unoptimized={item.image?.startsWith('http')}
                  />
                </div>
                <div className="co-item-info">
                  <p className="co-item-name">{item.name}</p>
                  <p className="co-item-qty">Qty: {item.qty} × ₹{item.price}</p>
                </div>
                <span className="co-item-price">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ════ STEP 1 — DELIVERY FORM ════ */}
        {step === 1 && (
          <form onSubmit={handleSubmit} id="checkout-form" noValidate>

            {/* Delivery Details */}
            <div className="co-card">
              <div className="co-card-header">
                <span className="co-card-icon">📍</span>
                <h3 className="co-card-title">{t('checkout.step1')}</h3>
              </div>

              <div className="co-field">
                <label className="form-label" htmlFor="name">{t('checkout.name')} *</label>
                <input id="name" name="name" className="form-input" placeholder={t('checkout.namePh')} value={form.name} onChange={handleChange} />
                {errors.name && <span className="co-error">{errors.name}</span>}
              </div>

              <div className="co-field">
                <label className="form-label" htmlFor="phone">{t('checkout.phone')} *</label>
                <input id="phone" name="phone" type="tel" inputMode="numeric" className="form-input" placeholder={t('checkout.phonePh')} value={form.phone} onChange={handleChange} maxLength={10} />
                {errors.phone && <span className="co-error">{errors.phone}</span>}
              </div>

              <div className="co-field">
                <label className="form-label" htmlFor="email">{t('checkout.email')}</label>
                <input id="email" name="email" type="email" className="form-input" placeholder={t('checkout.emailPh')} value={form.email} onChange={handleChange} />
              </div>

              <div className="co-field">
                <label className="form-label" htmlFor="address">{t('checkout.address')} *</label>
                <textarea id="address" name="address" className="form-textarea co-textarea-sm" placeholder={t('checkout.addressPh')} value={form.address} onChange={handleChange} rows={3} />
                {errors.address && <span className="co-error">{errors.address}</span>}
              </div>

              <div className="co-row-2">
                <div className="co-field">
                  <label className="form-label" htmlFor="city">{t('checkout.city')} *</label>
                  <input id="city" name="city" className="form-input" placeholder={t('checkout.cityPh')} value={form.city} onChange={handleChange} />
                  {errors.city && <span className="co-error">{errors.city}</span>}
                </div>
                <div className="co-field">
                  <label className="form-label" htmlFor="pincode">{t('checkout.pincode')} *</label>
                  <input id="pincode" name="pincode" inputMode="numeric" className="form-input" placeholder={t('checkout.pincodePh')} value={form.pincode} onChange={handleChange} maxLength={6} />
                  {errors.pincode && <span className="co-error">{errors.pincode}</span>}
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="co-card">
              <div className="co-card-header">
                <span className="co-card-icon">🎁</span>
                <h3 className="co-card-title">Promo Code</h3>
              </div>

              {/* Available offer chips */}
              {!promoApplied && availablePromos.length > 0 && (
                <div className="co-promo-chips">
                  <p className="co-hint">🔥 Tap to apply:</p>
                  {availablePromos.map((promo) => (
                    <button
                      key={promo.code}
                      type="button"
                      className="co-promo-chip"
                      onClick={async () => {
                        setPromoInput(promo.code);
                        setPromoError('');
                        setPromoLoading(true);
                        setPromoApplied(null);
                        try {
                          const res = await fetch('/api/promo/validate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: promo.code, orderTotal: total }),
                          });
                          const data = await res.json();
                          if (res.ok) setPromoApplied({ code: data.code, discount: data.discount, description: data.description });
                          else setPromoError(data.error);
                        } catch { setPromoError('Could not apply. Try again.'); }
                        finally { setPromoLoading(false); }
                      }}
                    >
                      <span className="co-promo-code">{promo.code}</span>
                      <span className="co-promo-desc">{promo.description}</span>
                      <span className="co-promo-badge">{promo.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {promoApplied ? (
                <div className="co-promo-applied">
                  <span>✅ <strong>{promoApplied.code}</strong> — {promoApplied.description} (−₹{promoApplied.discount})</span>
                  <button type="button" onClick={() => { setPromoApplied(null); setPromoInput(''); }} className="co-promo-remove" aria-label="Remove promo">×</button>
                </div>
              ) : (
                <div className="co-promo-row">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="co-promo-input"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                    id="promo-input"
                  />
                  <button type="button" onClick={applyPromo} disabled={promoLoading} className="co-promo-btn" id="promo-apply-btn">
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {promoError && <p className="co-error" style={{ marginTop: 6 }}>⚠️ {promoError}</p>}
            </div>

            {/* Payment Method */}
            <div className="co-card">
              <div className="co-card-header">
                <span className="co-card-icon">💳</span>
                <h3 className="co-card-title">{t('checkout.payment')}</h3>
              </div>
              <div className="co-options-list">
                {[
                  ['cod', '💵', t('checkout.cod'), t('checkout.codSub')],
                  ['upi', '📱', t('checkout.upi'), t('checkout.upiSub')],
                ].map(([v, icon, label, sub]) => (
                  <label key={v} className={`co-option${form.payment === v ? ' selected' : ''}`}>
                    <input type="radio" name="payment" value={v} checked={form.payment === v} onChange={handleChange} style={{ accentColor: 'var(--accent)' }} />
                    <span className="co-option-icon">{icon}</span>
                    <span className="co-option-body">
                      <span className="co-option-label">{label}</span>
                      <span className="co-option-sub">{sub}</span>
                    </span>
                    {form.payment === v && <span className="co-option-check">✓</span>}
                  </label>
                ))}
              </div>
              {form.payment === 'upi' && (
                <div className="co-tip">
                  💡 You'll see a QR code to scan after confirming. Pay instantly via any UPI app — no extra charges.
                </div>
              )}
            </div>

            {/* Delivery Slot */}
            <div className="co-card">
              <div className="co-card-header">
                <span className="co-card-icon">⏰</span>
                <h3 className="co-card-title">{t('checkout.slot')}</h3>
              </div>
              <div className="co-options-list">
                {[
                  ['morning', '🌅', t('checkout.morning'), t('checkout.morningSub')],
                  ['evening', '🌆', t('checkout.evening'), t('checkout.eveningSub')],
                ].map(([v, icon, label, sub]) => (
                  <label key={v} className={`co-option${slot === v ? ' selected' : ''}`}>
                    <input type="radio" name="slot" value={v} checked={slot === v} onChange={() => setSlot(v)} style={{ accentColor: 'var(--accent)' }} />
                    <span className="co-option-icon">{icon}</span>
                    <span className="co-option-body">
                      <span className="co-option-label">{label}</span>
                      <span className="co-option-sub">{sub}</span>
                    </span>
                    {slot === v && <span className="co-option-check">✓</span>}
                  </label>
                ))}
              </div>
              {!slot && <p className="co-hint" style={{ marginTop: 6 }}>Optional — we'll deliver at the earliest if not selected</p>}
            </div>

            {/* Special Instructions */}
            <div className="co-card">
              <div className="co-card-header">
                <span className="co-card-icon">📝</span>
                <h3 className="co-card-title">Special Instructions <span className="co-optional">(optional)</span></h3>
              </div>
              <textarea
                id="notes"
                name="notes"
                className="form-textarea co-textarea-sm"
                placeholder="Cleaning preferences, spice level, delivery notes..."
                value={form.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Order Summary */}
            <div className="co-card co-summary-card">
              <div className="co-card-header">
                <span className="co-card-icon">🧾</span>
                <h3 className="co-card-title">Order Summary</h3>
              </div>
              <div className="co-summary-rows">
                <div className="co-summary-row">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                {savings > 0 && (
                  <div className="co-summary-row savings">
                    <span>🏷️ Savings</span>
                    <span>−₹{savings}</span>
                  </div>
                )}
                <div className="co-summary-row">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? 'free' : ''}>{delivery === 0 ? '🎉 FREE' : `₹${delivery}`}</span>
                </div>
                {promoApplied && (
                  <div className="co-summary-row savings">
                    <span>🎁 Promo ({promoApplied.code})</span>
                    <span>−₹{promoDiscount}</span>
                  </div>
                )}
                <div className="co-summary-row total-row">
                  <span>Total</span>
                  <span className="co-total-amount">₹{finalTotal}</span>
                </div>
              </div>
            </div>

            {/* Spacer for sticky button */}
            <div style={{ height: '5rem' }} />
          </form>
        )}

        {/* ════ STEP 2 — CONFIRM ════ */}
        {step === 2 && (
          <div>
            <div className="co-card">
              <div className="co-card-header">
                <span className="co-card-icon">📍</span>
                <h3 className="co-card-title">Delivering to</h3>
              </div>
              <div className="co-confirm-detail">
                <p><strong>{form.name}</strong> · {form.phone}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>{form.address}, {form.city} - {form.pincode}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                  {form.payment === 'upi' ? '📱 UPI / QR Code' : '💵 Cash on Delivery'}
                </p>
                {slot && <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>{slot === 'morning' ? '🌅 Morning (6am–12pm)' : '🌆 Evening (3pm–8pm)'}</p>}
                {promoApplied && <p style={{ color: 'var(--accent-green)', fontSize: '0.88rem', fontWeight: 600, marginTop: 6 }}>🎁 {promoApplied.code} — −₹{promoApplied.discount}</p>}
              </div>
            </div>

            {form.payment === 'upi' && (
              <div className="co-tip" style={{ marginBottom: '1rem' }}>
                📱 After confirming, you'll be taken to a QR code page to complete payment.
              </div>
            )}

            {submitError && (
              <div className="co-error-box">⚠️ {submitError}</div>
            )}

            <div className="co-card co-summary-card">
              <div className="co-summary-rows">
                <div className="co-summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                {savings > 0 && <div className="co-summary-row savings"><span>Savings</span><span>−₹{savings}</span></div>}
                <div className="co-summary-row"><span>Delivery</span><span className={delivery === 0 ? 'free' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
                {promoApplied && <div className="co-summary-row savings"><span>🎁 Promo</span><span>−₹{promoDiscount}</span></div>}
                <div className="co-summary-row total-row"><span>Total</span><span className="co-total-amount">₹{finalTotal}</span></div>
              </div>
            </div>

            {/* Spacer for sticky button */}
            <div style={{ height: '5rem' }} />
          </div>
        )}
      </div>

      {/* ════ STICKY BOTTOM CTA ════ */}
      <div className="co-sticky-cta">
        <div className="co-sticky-inner">
          {step === 1 ? (
            <>
              <div className="co-sticky-total">
                <span className="co-sticky-label">Total</span>
                <span className="co-sticky-price">₹{finalTotal}</span>
              </div>
              <button
                type="submit"
                form="checkout-form"
                className="co-sticky-btn"
                id="checkout-next-btn"
              >
                Review Order →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="co-sticky-back"
                id="checkout-back-btn"
                disabled={isSubmitting}
              >
                ← Edit
              </button>
              <div className="co-sticky-total">
                <span className="co-sticky-label">Pay</span>
                <span className="co-sticky-price">₹{finalTotal}</span>
              </div>
              <button
                onClick={handleConfirm}
                className="co-sticky-btn"
                id="confirm-order-btn"
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                {isSubmitting
                  ? '⏳ Placing...'
                  : form.payment === 'upi'
                    ? '✓ Confirm & Pay →'
                    : '✓ Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
