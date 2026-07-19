'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || '7995177216@ybl';
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'Amma Sea Foods';

export default function CheckoutPage() {
  const { items, subtotal, savings, delivery, total, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  // ── State ──────────────────────────────────────────────────────────────────
  // step: 1 = delivery form | 2 = confirm | 'upi' = QR pay | 3 = success
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: '', pincode: '', notes: '',
    payment: 'cod',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // After order is saved
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [confirmedDocId, setConfirmedDocId] = useState('');

  // UPI payment confirmation
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrCopied, setUtrCopied] = useState(false);

  // ── Promo code ──────────────────────────────────────────────────────────────
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // { code, discount, description }
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [availablePromos, setAvailablePromos] = useState([]); // auto-fetched from admin

  // Fetch active promo codes from admin panel on mount
  useEffect(() => {
    fetch('/api/promo/active')
      .then((r) => r.json())
      .then((d) => { if (d.success) setAvailablePromos(d.codes); })
      .catch(() => {}); // silent fail — non-critical
  }, []);

  // ── Delivery slot ───────────────────────────────────────────────────────────
  const [slot, setSlot] = useState(''); // '' | 'morning' | 'evening'

  // ── Promo-adjusted total ────────────────────────────────────────────────────
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

  // ── Apply promo code ────────────────────────────────────────────────────────
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
      if (!res.ok) {
        setPromoError(data.error || 'Invalid promo code');
      } else {
        setPromoApplied({ code: data.code, discount: data.discount, description: data.description });
      }
    } catch {
      setPromoError('Could not validate. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  // ── Step 2 → Place order in Firestore, then route based on payment method ──
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

      // Send WhatsApp notification to shop
      const lines = items.map((i) => `• ${i.name} x${i.qty} — ₹${i.price * i.qty}`).join('\n');
      const payLabel = form.payment === 'upi' ? '📱 UPI / QR Code (pending verification)' : '💵 Cash on Delivery';
      const slotLabel = slot === 'morning' ? '🌅 Morning (6am–12pm)' : slot === 'evening' ? '🌆 Evening (3pm–8pm)' : 'Anytime';
      const promoLine = promoApplied ? `*Promo:* ${promoApplied.code} (−₹${promoDiscount})\n` : '';
      const msg = `🛒 *New Order — Amma Sea Foods*\n\n*Order ID:* ${data.orderId}\n*Customer:* ${form.name}\n*Phone:* ${form.phone}\n*Address:* ${form.address}, ${form.city} - ${form.pincode}\n*Slot:* ${slotLabel}\n*Payment:* ${payLabel}\n\n*Items:*\n${lines}\n\n${promoLine}*Total: ₹${finalTotal}*\n${form.notes ? `*Notes:* ${form.notes}` : ''}`;
      window.open(`https://wa.me/917995177216?text=${encodeURIComponent(msg)}`, '_blank');

      // Route next step
      if (form.payment === 'upi') {
        setStep('upi'); // → show QR code
      } else {
        clearCart();
        setStep(3);     // → COD success
      }
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── UPI: customer submits UTR after paying ───────────────────────────────────
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

  // ── UPI deep-link for QR ─────────────────────────────────────────────────────
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalTotal}&cu=INR&tn=${encodeURIComponent('Order ' + confirmedOrderId)}`;

  // ── Empty cart guard ─────────────────────────────────────────────────────────
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
              <div style={{
                background: 'var(--bg-card)', border: '2px solid var(--accent)',
                borderRadius: 'var(--radius-lg)', padding: '1.25rem 2rem',
                margin: '1rem auto', maxWidth: 320, textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, fontWeight: 600 }}>Your Order ID</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{confirmedOrderId}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Save this to track your order</p>
              </div>
            )}

            <p style={{ maxWidth: 420, margin: '0.75rem auto 1.5rem', textAlign: 'center' }}>
              {isUpi
                ? `Your UPI payment has been noted, ${form.name}! We'll verify and confirm your order within a few minutes.`
                : `Your order has been saved. Our team will confirm within a few minutes. Thank you, ${form.name}!`}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="btn btn-primary btn-lg" id="order-success-home-btn">Back to Home</Link>
              <Link href={`/track?id=${confirmedOrderId}`} className="btn btn-ghost btn-lg" id="order-track-btn">Track My Order →</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  STEP 'upi' — QR CODE PAYMENT SCREEN
  // ══════════════════════════════════════════════════════════════════════
  if (step === 'upi') {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div style={{ maxWidth: 480, margin: '2rem auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📱</div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.25rem' }}>
                Pay via UPI / QR Code
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Scan with PhonePe, GPay, Paytm or any UPI app
              </p>
            </div>

            {/* Amount box */}
            <div style={{
              background: 'linear-gradient(135deg, var(--accent), #1a7abf)',
              borderRadius: 'var(--radius-lg)', padding: '1rem',
              textAlign: 'center', color: 'white', marginBottom: '1.5rem',
            }}>
              <p style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: 4 }}>Amount to Pay</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>₹{total}</p>
              <p style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: 4 }}>Order: {confirmedOrderId}</p>
            </div>

            {/* QR Code */}
            <div style={{
              background: 'white', borderRadius: 'var(--radius-lg)',
              padding: '1.5rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
              border: '1px solid var(--border)',
            }}>
              <QRCode
                value={upiUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#0f4c75"
                level="M"
              />
              <p style={{ fontSize: '0.78rem', color: '#555', textAlign: 'center', margin: 0 }}>
                Scan this QR · Amount is pre-filled ₹{total}
              </p>
            </div>

            {/* Manual UPI ID */}
            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem', marginBottom: '1.5rem',
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                OR pay manually to this UPI ID:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent)', flex: 1 }}>
                  {UPI_ID}
                </code>
                <button
                  onClick={copyUpiId}
                  className="btn btn-sm btn-ghost"
                  style={{ flexShrink: 0, fontSize: '0.8rem' }}
                  id="copy-upi-btn"
                >
                  {utrCopied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Pay exactly <strong style={{ color: 'var(--text-primary)' }}>₹{total}</strong> · Note: {confirmedOrderId}
              </p>
            </div>

            {/* UTR Entry */}
            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
              padding: '1.25rem', border: '1px solid var(--border)', marginBottom: '1rem',
            }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                After paying, enter your Transaction / UTR number:
              </label>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Find this in your payment app under the transaction details. Helps us verify your payment faster.
              </p>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 427819273641 or T2507161234"
                value={utrNumber}
                onChange={(e) => { setUtrNumber(e.target.value); setUtrError(''); }}
                id="utr-input"
                style={{ marginBottom: utrError ? '0.5rem' : '0.75rem' }}
              />
              {utrError && (
                <p style={{ color: 'var(--accent-warm)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  ⚠️ {utrError}
                </p>
              )}
              <button
                onClick={handleUtrSubmit}
                disabled={submittingUtr}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                id="utr-submit-btn"
              >
                {submittingUtr ? '⏳ Saving...' : '✅ I\'ve Paid — Confirm Order'}
              </button>
            </div>

            {/* Skip option */}
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Paid but can't find UTR?{' '}
              <button
                onClick={() => { clearCart(); setStep(3); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem', padding: 0 }}
                id="skip-utr-btn"
              >
                Skip & confirm order
              </button>
              {' '}— send us your payment screenshot on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  //  STEPS 1 & 2 — CHECKOUT FORM + CONFIRM
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="page-wrapper">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">›</span>
          <Link href="/cart">Cart</Link>
          <span className="separator">›</span>
          <span>Checkout</span>
        </nav>

        <h1 className="page-title">{t('checkout.title')}</h1>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
          {[t('checkout.step1'), t('checkout.step2')].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > i + 1 ? 'var(--accent-green)' : step === i + 1 ? 'var(--accent)' : 'var(--border)',
                color: step >= i + 1 ? 'white' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
              }}>{i + 1}</div>
              <span style={{ fontSize: '0.88rem', fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
              {i < 1 && <span style={{ color: 'var(--border)', margin: '0 0.25rem' }}>›</span>}
            </div>
          ))}
        </div>

        <div className="checkout-layout">

          {/* ── Left: Form or Confirm ── */}
          <div>

            {/* STEP 1 — Delivery form */}
            {step === 1 && (
              <form className="checkout-form" onSubmit={handleSubmit} id="checkout-form" noValidate>
                <h2 className="page-title-sm" style={{ marginBottom: '1.5rem' }}>{t('checkout.step1')}</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">{t('checkout.name')} *</label>
                    <input id="name" name="name" className="form-input" placeholder={t('checkout.namePh')} value={form.name} onChange={handleChange} />
                    {errors.name && <span style={{ color: 'var(--accent-warm)', fontSize: '0.82rem' }}>{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">{t('checkout.phone')} *</label>
                    <input id="phone" name="phone" type="tel" className="form-input" placeholder={t('checkout.phonePh')} value={form.phone} onChange={handleChange} maxLength={10} />
                    {errors.phone && <span style={{ color: 'var(--accent-warm)', fontSize: '0.82rem' }}>{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">{t('checkout.email')}</label>
                  <input id="email" name="email" type="email" className="form-input" placeholder={t('checkout.emailPh')} value={form.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">{t('checkout.address')} *</label>
                  <textarea id="address" name="address" className="form-textarea" placeholder={t('checkout.addressPh')} value={form.address} onChange={handleChange} rows={3} />
                  {errors.address && <span style={{ color: 'var(--accent-warm)', fontSize: '0.82rem' }}>{errors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="city">{t('checkout.city')} *</label>
                    <input id="city" name="city" className="form-input" placeholder={t('checkout.cityPh')} value={form.city} onChange={handleChange} />
                    {errors.city && <span style={{ color: 'var(--accent-warm)', fontSize: '0.82rem' }}>{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="pincode">{t('checkout.pincode')} *</label>
                    <input id="pincode" name="pincode" className="form-input" placeholder={t('checkout.pincodePh')} value={form.pincode} onChange={handleChange} maxLength={6} />
                    {errors.pincode && <span style={{ color: 'var(--accent-warm)', fontSize: '0.82rem' }}>{errors.pincode}</span>}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="form-group">
                  <label className="form-label">{t('checkout.payment')}</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      ['cod', '💵', t('checkout.cod'), t('checkout.codSub')],
                      ['upi', '📱', t('checkout.upi'), t('checkout.upiSub')],
                    ].map(([v, icon, label, sub]) => (
                      <label key={v} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                        padding: '12px 16px', border: `2px solid ${form.payment === v ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: form.payment === v ? 'rgba(15,76,117,0.06)' : 'transparent',
                        transition: 'all 0.2s', flex: 1, minWidth: 160,
                      }}>
                        <input type="radio" name="payment" value={v} checked={form.payment === v} onChange={handleChange} style={{ accentColor: 'var(--accent)' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{icon} {label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* UPI tip */}
                {form.payment === 'upi' && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    💡 You'll see a QR code to scan after confirming. Pay instantly via any UPI app — no extra charges.
                  </div>
                )}

                {/* Delivery Slot */}
                <div className="form-group">
                  <label className="form-label">{t('checkout.slot')}</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      ['morning', '🌅', t('checkout.morning'), t('checkout.morningSub')],
                      ['evening', '🌆', t('checkout.evening'), t('checkout.eveningSub')],
                    ].map(([v, icon, label, sub]) => (
                      <label key={v} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                        padding: '10px 16px', border: `2px solid ${slot === v ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: slot === v ? 'rgba(15,76,117,0.06)' : 'transparent',
                        transition: 'all 0.2s', flex: 1, minWidth: 140,
                      }}>
                        <input type="radio" name="slot" value={v} checked={slot === v} onChange={() => setSlot(v)} style={{ accentColor: 'var(--accent)' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{icon} {label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {!slot && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Optional — we'll deliver at the earliest if not selected</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Special Instructions (optional)</label>
                  <textarea id="notes" name="notes" className="form-textarea" placeholder="Any special requests, cleaning preferences, etc." value={form.notes} onChange={handleChange} rows={2} />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} id="checkout-next-btn">
                  Review Order →
                </button>
              </form>
            )}

            {/* STEP 2 — Confirm */}
            {step === 2 && (
              <div className="checkout-form">
                <h2 className="page-title-sm" style={{ marginBottom: '1.5rem' }}>Confirm Your Order</h2>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📍 Delivering to:</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{form.name} · {form.phone}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{form.address}, {form.city} - {form.pincode}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Payment: {form.payment === 'upi' ? '📱 UPI / QR Code' : '💵 Cash on Delivery'}
                  </p>
                  {slot && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Slot: {slot === 'morning' ? '🌅 Morning (6am–12pm)' : '🌆 Evening (3pm–8pm)'}</p>}
                  {promoApplied && <p style={{ color: 'var(--accent-green)', fontSize: '0.9rem', marginTop: '0.25rem' }}>🎁 Promo {promoApplied.code} applied — −₹{promoApplied.discount}</p>}
                </div>

                {form.payment === 'upi' && (
                  <div style={{ background: 'rgba(15,76,117,0.07)', border: '1px solid rgba(15,76,117,0.2)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    📱 After confirming, you'll be taken to a QR code page to complete payment.
                  </div>
                )}

                {submitError && (
                  <div style={{ color: 'var(--accent-warm)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                    ⚠️ {submitError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setStep(1)} className="btn btn-ghost btn-lg" style={{ flex: 1 }} id="checkout-back-btn" disabled={isSubmitting}>
                    ← Edit Details
                  </button>
                  <button onClick={handleConfirm} className="btn btn-warm btn-lg" style={{ flex: 2 }} id="confirm-order-btn" disabled={isSubmitting}>
                    {isSubmitting
                      ? '⏳ Placing Order...'
                      : form.payment === 'upi'
                        ? '✓ Confirm & Pay via QR →'
                        : '✓ Confirm & Send via WhatsApp'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="cart-summary">
            <h3>Your Order ({items.length} items)</h3>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <Image src={item.image} alt={item.name} width={50} height={50} style={{ objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>x{item.qty}</p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>₹{item.price * item.qty}</span>
              </div>
            ))}
            {/* Promo Code Section */}
            <div style={{ margin: '0.75rem 0', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🎁 Promo Code</p>

              {/* Auto-suggested offer cards from admin */}
              {!promoApplied && availablePromos.length > 0 && (
                <div style={{ marginBottom: '0.625rem' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>🔥 Available Offers — tap to apply:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {availablePromos.map((promo) => (
                      <button
                        key={promo.code}
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
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(16,185,129,0.12))',
                          border: '1.5px dashed rgba(16,185,129,0.4)',
                          width: '100%', textAlign: 'left',
                        }}
                      >
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent)', letterSpacing: '1px' }}>{promo.code}</span>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{promo.description}</span>
                          {promo.minOrder > 0 && <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>· Min ₹{promo.minOrder}</span>}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)', background: 'rgba(16,185,129,0.12)', padding: '3px 8px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>
                          {promo.label} →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Applied state */}
              {promoApplied ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-green)' }}>✅ {promoApplied.code} — {promoApplied.description}</span>
                  <button onClick={() => { setPromoApplied(null); setPromoInput(''); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      style={{ flex: 1, height: 38, padding: '0 10px', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px', outline: 'none' }}
                      onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                    />
                    <button onClick={applyPromo} disabled={promoLoading} style={{ padding: '0 14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '4px' }}>{promoError}</p>}
                </>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <div className="summary-row"><span>Subtotal</span><span className="value">₹{subtotal}</span></div>
              {savings > 0 && <div className="summary-row" style={{ color: 'var(--accent-green)' }}><span>Savings</span><span className="value">−₹{savings}</span></div>}
              <div className="summary-row"><span>Delivery</span><span className="value" style={{ color: delivery === 0 ? 'var(--accent-green)' : 'inherit' }}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
              {promoApplied && <div className="summary-row" style={{ color: 'var(--accent-green)' }}><span>🎁 Promo ({promoApplied.code})</span><span className="value">−₹{promoDiscount}</span></div>}
              <div className="summary-row total"><span>Total</span><span className="value">₹{finalTotal}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
