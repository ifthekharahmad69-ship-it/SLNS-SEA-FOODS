'use client';

import { useState, useEffect, useRef } from 'react';
import { products as staticProducts } from '@/data/products';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { uploadProductImage } from '@/lib/uploadImage';

const STATUS_COLORS = {
  pending: 'pending',
  confirmed: 'confirmed',
  out_for_delivery: 'pending',
  delivered: 'delivered',
  cancelled: 'out-of-stock',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: '🕐 Pending' },
  { value: 'confirmed', label: '✅ Confirmed' },
  { value: 'out_for_delivery', label: '🏍️ Out for Delivery' },
  { value: 'delivered', label: '📦 Delivered' },
  { value: 'cancelled', label: '❌ Cancelled' },
];

const NAV_ITEMS = [
  { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
  { id: 'orders', label: '📋 Orders', icon: '📋' },
  { id: 'products', label: '🐟 Products', icon: '🐟' },
  { id: 'reviews', label: '⭐ Reviews', icon: '⭐' },
  { id: 'promos', label: '🎁 Promos', icon: '🎁' },
];

const EMPTY_NEW_PRODUCT = {
  name: '', price: '', originalPrice: '', category: 'prawns',
  type: 'raw', description: '', image: '', unit: 'per kg', weight: '1 kg',
};

// ── Small reusable image-upload input ─────────────────────────────────────────
function ImageUploadField({ imagePreview, onFileChange, onUrlChange, urlValue, uploadProgress, uploading, id }) {
  const fileRef = useRef(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Preview */}
      {imagePreview && (
        <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* File pick button */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => fileRef.current?.click()}
          id={`${id}-pick-btn`}
          style={{ fontSize: '0.8rem' }}
        >
          📁 {imagePreview ? 'Change Image' : 'Upload Image'}
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG / PNG / WebP · max 5 MB</span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        style={{ display: 'none' }}
        onChange={onFileChange}
        id={`${id}-file-input`}
      />

      {/* Upload progress bar */}
      {uploading && (
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--accent)', transition: 'width 0.2s' }} />
        </div>
      )}

      {/* URL fallback */}
      <input
        type="text"
        className="form-input"
        placeholder="…or paste image URL"
        value={urlValue}
        onChange={onUrlChange}
        id={`${id}-url-input`}
        style={{ fontSize: '0.8rem' }}
      />
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [pwaPrompt, setPwaPrompt] = useState(null);   // admin PWA install prompt
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // ── Product Management State ───────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState(staticProducts);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [editingPrice, setEditingPrice] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [togglingStock, setTogglingStock] = useState(null);

  // Add-product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY_NEW_PRODUCT);
  // Image upload for add form
  const [addImageFile, setAddImageFile] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState('');
  const [addUploadProgress, setAddUploadProgress] = useState(0);
  const [addUploading, setAddUploading] = useState(false);

  // Edit-product modal
  const [editingProduct, setEditingProduct] = useState(null);   // product object
  const [editData, setEditData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [editUploading, setEditUploading] = useState(false);

  // ── PWA install prompt capture ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaInstalled(true); return;
    }
    const handler = (e) => { e.preventDefault(); setPwaPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setPwaInstalled(true); setPwaPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAdminInstall = async () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    const { outcome } = await pwaPrompt.userChoice;
    if (outcome === 'accepted') setPwaInstalled(true);
    setPwaPrompt(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) setAllProducts(data.products);
    } catch (err) {
      console.error('fetchProducts error:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleStock = async (product) => {
    setTogglingStock(product.id);
    const newStock = !product.inStock;
    setAllProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, inStock: newStock } : p));
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: newStock }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch {
      setAllProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, inStock: product.inStock } : p));
      alert('Failed to update stock');
    } finally {
      setTogglingStock(null);
    }
  };

  const savePrice = async (product) => {
    const price = Number(editPriceValue);
    if (!price || price <= 0) return;
    setAllProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, price } : p));
    setEditingPrice(null);
    await fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price }),
    });
  };

  // ── Add product ────────────────────────────────────────────────────────────
  const handleAddImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAddImageFile(file);
    setAddImagePreview(URL.createObjectURL(file));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      let imageUrl = newProduct.image;
      if (addImageFile) {
        setAddUploading(true);
        imageUrl = await uploadProductImage(addImageFile, setAddUploadProgress);
        setAddUploading(false);
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, image: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowAddProduct(false);
      setNewProduct(EMPTY_NEW_PRODUCT);
      setAddImageFile(null);
      setAddImagePreview('');
      setAddUploadProgress(0);
      fetchProducts();
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
    } finally {
      setAddingProduct(false);
      setAddUploading(false);
    }
  };

  // ── Edit product ───────────────────────────────────────────────────────────
  const openEditProduct = (product) => {
    setEditingProduct(product);
    setEditData({
      name: product.name || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || 'prawns',
      type: product.type || 'raw',
      description: product.description || '',
      image: product.image || '',
      unit: product.unit || 'per kg',
      weight: product.weight || '1 kg',
      inStock: product.inStock !== false,
    });
    setEditImageFile(null);
    setEditImagePreview('');
    setEditUploadProgress(0);
  };

  const saveEditedProduct = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      let imageUrl = editData.image;
      if (editImageFile) {
        setEditUploading(true);
        imageUrl = await uploadProductImage(editImageFile, setEditUploadProgress);
        setEditUploading(false);
      }
      const patch = {
        name: editData.name,
        price: Number(editData.price),
        originalPrice: Number(editData.originalPrice || editData.price),
        category: editData.category,
        type: editData.type,
        description: editData.description,
        image: imageUrl,
        unit: editData.unit,
        weight: editData.weight,
        inStock: editData.inStock,
      };
      await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      // Optimistic local update
      setAllProducts((prev) => prev.map((p) =>
        p.id === editingProduct.id ? { ...p, ...patch } : p
      ));
      setEditingProduct(null);
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSavingEdit(false);
      setEditUploading(false);
      setEditUploadProgress(0);
    }
  };

  // ── Delete (new products only) ──────────────────────────────────────────────
  const deleteNewProduct = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    setAllProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  // ── Orders ─────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoadingOrders(true);
    setFetchError('');
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
      setFetchError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (docId, status) => {
    setUpdatingId(docId);
    try {
      const res = await fetch(`/api/orders/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setOrders((prev) => prev.map((o) => (o.docId === docId ? { ...o, status } : o)));
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const filteredProducts = allProducts.filter((p) =>
    (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(productSearch.toLowerCase())
  );
  const inStockCount = allProducts.filter((p) => p.inStock).length;
  const outOfStockCount = allProducts.filter((p) => !p.inStock).length;

  const filteredOrders = orders.filter(
    (o) =>
      (o.customer || '').toLowerCase().includes(searchQ.toLowerCase()) ||
      (o.orderId || '').toLowerCase().includes(searchQ.toLowerCase()) ||
      (o.phone || '').includes(searchQ)
  );

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const formatItems = (items) => {
    if (!items || !items.length) return '—';
    return items.map((i) => `${i.name} x${i.qty}`).join(', ');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
      <div className="admin-layout">

        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'white', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            🦐 Admin Panel
          </h2>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'none' }}
              id={`admin-nav-${item.id}`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={fetchOrders}
            className="nav-link"
            style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'none', marginTop: '0.5rem', opacity: 0.7 }}
            disabled={loadingOrders}
          >
            {loadingOrders ? '⏳ Refreshing...' : '🔄 Refresh Orders'}
          </button>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/" className="nav-link" style={{ display: 'block', color: 'rgba(255,255,255,0.6)' }}>
              ← Back to Store
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="nav-link"
              style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'none', color: 'rgba(239,68,68,0.8)', marginTop: '0.25rem' }}
              id="admin-logout-btn"
            >
              {loggingOut ? '⏳ Signing out...' : '🚪 Logout'}
            </button>

            {/* Install admin app as PWA */}
            {!pwaInstalled && pwaPrompt && (
              <button
                onClick={handleAdminInstall}
                className="nav-link"
                style={{ width: '100%', textAlign: 'left', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', borderRadius: 'var(--radius-md)', marginTop: '0.5rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem' }}
                id="admin-install-pwa-btn"
              >
                📲 Install Admin App
              </button>
            )}
            {pwaInstalled && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(16,185,129,0.8)', marginTop: '0.5rem', textAlign: 'center' }}>
                ✅ App Installed
              </p>
            )}
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="admin-content">

          {/* Mobile Tab Bar — visible only on small screens, replaces sidebar */}
          <div className="admin-mobile-tabs">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`admin-mobile-tab${activeTab === item.id ? ' active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon} {item.label.replace(/[^\w\s]/g, '').trim()}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {fetchError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.88rem' }}>
              ⚠️ {fetchError} — <button onClick={fetchOrders} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Retry</button>
            </div>
          )}

          {/* ════════════════════════════════════════════
              DASHBOARD TAB
          ════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <>
              <div className="admin-header">
                <h1>Dashboard</h1>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <div className="stats-grid">
                {[
                  { label: 'Total Orders', value: loadingOrders ? '…' : orders.length, change: 'All time', dir: 'up' },
                  { label: 'Pending Orders', value: loadingOrders ? '…' : pendingOrders, change: pendingOrders > 0 ? 'Needs attention' : 'All caught up!', dir: pendingOrders > 0 ? 'down' : 'up' },
                  { label: 'Revenue (Delivered)', value: loadingOrders ? '…' : `₹${totalRevenue.toLocaleString('en-IN')}`, change: 'Delivered orders only', dir: 'up' },
                  { label: 'Products', value: allProducts.length, change: `${allProducts.filter((p) => p.inStock).length} in stock`, dir: 'up' },
                ].map((s) => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                    <div className={`stat-change ${s.dir}`}>{s.change}</div>
                  </div>
                ))}
              </div>

              <div className="admin-table-wrapper">
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Recent Orders</h3>
                  <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('orders')}>View All</button>
                </div>
                {loadingOrders ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading orders from database...</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.docId}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{o.orderId}</td>
                          <td>
                            <strong>{o.customer}</strong><br />
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.phone}</span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{o.total}</td>
                          <td><span className={`status-badge ${STATUS_COLORS[o.status] || 'pending'}`}>{o.status}</span></td>
                          <td>
                            <a
                              href={`https://wa.me/${o.phone}?text=Hi ${o.customer}! Your order ${o.orderId} status: ${(o.status || '').toUpperCase()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-ghost"
                            >
                              📱 WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════
              ORDERS TAB
          ════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <>
              <div className="admin-header">
                <h1>Orders {!loadingOrders && `(${filteredOrders.length})`}</h1>
                <input
                  type="search"
                  className="form-input"
                  style={{ width: 280, height: 40 }}
                  placeholder="Search by name, phone, order ID..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  id="admin-order-search"
                />
              </div>
              <div className="admin-table-wrapper">
                {loadingOrders ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading orders from database...</div>
                ) : filteredOrders.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {searchQ ? 'No orders match your search.' : 'No orders yet. Orders placed from the store will appear here.'}
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.docId} id={`order-row-${o.orderId}`}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>{o.orderId}</td>
                          <td>
                            <strong>{o.customer}</strong><br />
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.phone}</span>
                          </td>
                          <td style={{ fontSize: '0.82rem', maxWidth: 200 }}>{formatItems(o.items)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{o.total}</td>
                          {/* Payment method + UTR */}
                          <td>
                            {o.payment === 'upi' ? (
                              <div>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(251,146,60,0.15)', color: '#f97316', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>📱 UPI</span>
                                {o.utrNumber ? (
                                  <div style={{ marginTop: 4 }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UTR: </span>
                                    <code style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>{o.utrNumber}</code>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>⏳ awaiting UTR</div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', background: 'rgba(107,114,128,0.1)', color: 'var(--text-muted)', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>💵 COD</span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(o.createdAt)}</td>
                          <td>
                            <select
                              value={o.status}
                              onChange={(e) => updateStatus(o.docId, e.target.value)}
                              className="form-input"
                              style={{ height: 32, padding: '0 8px', fontSize: '0.82rem', width: 'auto' }}
                              id={`status-select-${o.orderId}`}
                              disabled={updatingId === o.docId}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            {updatingId === o.docId && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>saving…</span>
                            )}
                          </td>
                          <td>
                            <a
                              href={`https://wa.me/${o.phone}?text=Hi ${o.customer}! Your order ${o.orderId} is now *${(o.status || '').toUpperCase().replace(/_/g, ' ')}*.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-whatsapp"
                            >
                              📱
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════
              PRODUCTS TAB
          ════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <>
              <div className="admin-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <h1>Products <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>({inStockCount} in stock · {outOfStockCount} out)</span></h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="search"
                    className="form-input"
                    style={{ width: 220, height: 38 }}
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    id="admin-product-search"
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAddProduct((v) => !v)}
                    id="admin-add-product-btn"
                  >
                    {showAddProduct ? '✕ Cancel' : '+ Add Product'}
                  </button>
                </div>
              </div>

              {/* ── Add Product Form ── */}
              {showAddProduct && (
                <form
                  onSubmit={handleAddProduct}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem',
                  }}
                >
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>➕ New Product</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Fill in the details. Upload a photo or paste a URL.</p>
                  </div>

                  {[
                    { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'e.g. Tiger Prawns Large' },
                    { label: 'Sale Price (₹) *', key: 'price', type: 'number', placeholder: '350' },
                    { label: 'Original Price (₹)', key: 'originalPrice', type: 'number', placeholder: '420' },
                    { label: 'Weight / Size', key: 'weight', type: 'text', placeholder: '1 kg' },
                    { label: 'Unit', key: 'unit', type: 'text', placeholder: 'per kg' },
                  ].map((f) => (
                    <div key={f.key} className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{f.label}</label>
                      <input
                        type={f.type}
                        className="form-input"
                        placeholder={f.placeholder}
                        value={newProduct[f.key]}
                        onChange={(e) => setNewProduct((p) => ({ ...p, [f.key]: e.target.value }))}
                        required={f.label.includes('*')}
                        id={`add-product-${f.key}`}
                      />
                    </div>
                  ))}

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category *</label>
                    <select className="form-input" value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} id="add-product-category">
                      <option value="prawns">🦐 Prawns</option>
                      <option value="fish">🐟 Fish</option>
                      <option value="crabs">🦀 Crabs</option>
                      <option value="dry-seafood">🌊 Dry Seafood</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Type</label>
                    <select className="form-input" value={newProduct.type} onChange={(e) => setNewProduct((p) => ({ ...p, type: e.target.value }))} id="add-product-type">
                      <option value="raw">Raw</option>
                      <option value="dish">Dish</option>
                    </select>
                  </div>

                  {/* ── Image upload section ── */}
                  <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <label className="form-label">Product Image</label>
                    <ImageUploadField
                      imagePreview={addImagePreview || newProduct.image}
                      onFileChange={handleAddImageFileChange}
                      onUrlChange={(e) => setNewProduct((p) => ({ ...p, image: e.target.value }))}
                      urlValue={newProduct.image}
                      uploadProgress={addUploadProgress}
                      uploading={addUploading}
                      id="add-product-image"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="Short description of the product..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                      id="add-product-description"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={addingProduct || addUploading} id="add-product-submit">
                      {addUploading ? `⏫ Uploading image ${addUploadProgress}%...` : addingProduct ? '⏳ Adding...' : '✅ Add Product'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setShowAddProduct(false); setAddImageFile(null); setAddImagePreview(''); }}>Cancel</button>
                  </div>
                </form>
              )}

              {/* ── Products Table ── */}
              <div className="admin-table-wrapper">
                {loadingProducts ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ Loading products...</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} id={`product-row-${p.id}`}>
                          <td>
                            <div className="table-product">
                              {p.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.image} alt={p.name} width={48} height={48} style={{ objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
                              ) : (
                                <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🐟</div>
                              )}
                              <div>
                                <strong style={{ fontSize: '0.88rem' }}>{p.name}</strong>
                                <br />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.weight} · {p.type}</span>
                                {p.isNew && <span style={{ marginLeft: 6, fontSize: '0.7rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: 4 }}>NEW</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{p.category}</td>
                          <td>
                            {editingPrice === p.id ? (
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ width: 80, height: 32, padding: '0 8px' }}
                                  value={editPriceValue}
                                  onChange={(e) => setEditPriceValue(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') savePrice(p); if (e.key === 'Escape') setEditingPrice(null); }}
                                  autoFocus
                                  id={`price-edit-${p.id}`}
                                />
                                <button className="btn btn-sm btn-primary" onClick={() => savePrice(p)}>✓</button>
                                <button className="btn btn-sm btn-ghost" onClick={() => setEditingPrice(null)}>✕</button>
                              </div>
                            ) : (
                              <div
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                onClick={() => { setEditingPrice(p.id); setEditPriceValue(p.price); }}
                                title="Click to edit price"
                                id={`price-display-${p.id}`}
                              >
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{p.price}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.originalPrice}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>✏️</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => toggleStock(p)}
                              disabled={togglingStock === p.id}
                              className={`status-badge ${p.inStock ? 'in-stock' : 'out-of-stock'}`}
                              style={{ border: 'none', cursor: 'pointer', fontWeight: 600 }}
                              id={`stock-toggle-${p.id}`}
                            >
                              {togglingStock === p.id ? '...' : p.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              {/* Edit button — available for ALL products */}
                              <button
                                onClick={() => openEditProduct(p)}
                                className="btn btn-sm btn-ghost"
                                style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                                id={`edit-product-${p.id}`}
                                title="Edit product"
                              >
                                ✏️ Edit
                              </button>
                              {/* Delete — only for admin-created products */}
                              {p.isNew && (
                                <button
                                  onClick={() => deleteNewProduct(p.id)}
                                  className="btn btn-sm"
                                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '4px 8px' }}
                                  id={`delete-product-${p.id}`}
                                  title="Delete product"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ════════════════════════════════════════════
          EDIT PRODUCT MODAL (full-screen overlay)
      ════════════════════════════════════════════ */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingProduct(null); }}
        >
          <div
            style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)', padding: '2rem',
              width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.25rem' }}>✏️ Edit Product</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{editingProduct.name}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1, padding: '0.25rem' }}
                id="edit-modal-close"
              >✕</button>
            </div>

            <form onSubmit={saveEditedProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              {/* Name */}
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Product Name *</label>
                <input type="text" className="form-input" required value={editData.name} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))} id="edit-product-name" />
              </div>

              {/* Prices */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Sale Price (₹) *</label>
                <input type="number" className="form-input" required min="1" value={editData.price} onChange={(e) => setEditData((d) => ({ ...d, price: e.target.value }))} id="edit-product-price" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Original Price (₹)</label>
                <input type="number" className="form-input" value={editData.originalPrice} onChange={(e) => setEditData((d) => ({ ...d, originalPrice: e.target.value }))} id="edit-product-orig-price" />
              </div>

              {/* Category + Type */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-input" value={editData.category} onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value }))} id="edit-product-category">
                  <option value="prawns">🦐 Prawns</option>
                  <option value="fish">🐟 Fish</option>
                  <option value="crabs">🦀 Crabs</option>
                  <option value="dry-seafood">🌊 Dry Seafood</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Type</label>
                <select className="form-input" value={editData.type} onChange={(e) => setEditData((d) => ({ ...d, type: e.target.value }))} id="edit-product-type">
                  <option value="raw">Raw</option>
                  <option value="dish">Dish</option>
                </select>
              </div>

              {/* Weight + Unit */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Weight / Size</label>
                <input type="text" className="form-input" value={editData.weight} onChange={(e) => setEditData((d) => ({ ...d, weight: e.target.value }))} id="edit-product-weight" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Unit</label>
                <input type="text" className="form-input" value={editData.unit} onChange={(e) => setEditData((d) => ({ ...d, unit: e.target.value }))} id="edit-product-unit" />
              </div>

              {/* In Stock toggle */}
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={editData.inStock}
                    onChange={(e) => setEditData((d) => ({ ...d, inStock: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
                    id="edit-product-instock"
                  />
                  <span>{editData.inStock ? '✅ In Stock' : '❌ Out of Stock'}</span>
                </label>
              </div>

              {/* Image upload */}
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Product Image</label>
                <ImageUploadField
                  imagePreview={editImagePreview || editData.image}
                  onFileChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setEditImageFile(file);
                    setEditImagePreview(URL.createObjectURL(file));
                  }}
                  onUrlChange={(e) => setEditData((d) => ({ ...d, image: e.target.value }))}
                  urlValue={editData.image}
                  uploadProgress={editUploadProgress}
                  uploading={editUploading}
                  id="edit-product-image"
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={editData.description}
                  onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
                  id="edit-product-description"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingEdit || editUploading}
                  id="edit-product-save"
                >
                  {editUploading
                    ? `⏫ Uploading image ${editUploadProgress}%...`
                    : savingEdit ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingProduct(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ REVIEWS TAB ════════════════ */}
      {activeTab === 'reviews' && <ReviewsTab />}

      {/* ════════════════ PROMOS TAB ════════════════ */}
      {activeTab === 'promos' && <PromosTab />}

    </div>
  );
}

// ── Reviews Tab ───────────────────────────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchReviews = () => {
    setLoading(true);
    fetch('/api/reviews?admin=1')
      .then((r) => r.json())
      .then((d) => { if (d.success) setReviews(d.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchReviews();
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    fetchReviews();
  };

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <>
      <div className="admin-header">
        <h1>
          ⭐ Customer Reviews
          {pendingCount > 0 && (
            <span style={{ fontSize: '0.72rem', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '999px', marginLeft: '8px', verticalAlign: 'middle' }}>
              {pendingCount} new
            </span>
          )}
        </h1>
        <button className="btn btn-sm btn-ghost" onClick={fetchReviews}>🔄 Refresh</button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected', 'all'].map((f) => {
          const count = f === 'all' ? reviews.length : reviews.filter((r) => r.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: filter === f ? 'var(--accent)' : 'var(--bg-card)',
                color: filter === f ? 'white' : 'var(--text-muted)',
                border: `1.5px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
          <p>No {filter !== 'all' ? filter : ''} reviews yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                boxShadow: 'var(--shadow-card)',
                border: r.status === 'pending' ? '2px solid #f59e0b' : '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '-1px' }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</span>
                    {r.orderId && (
                      <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', background: 'rgba(15,76,117,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '999px' }}>
                        ✓ {r.orderId}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Product: <strong style={{ color: 'var(--text-secondary)' }}>{r.productName || r.productId}</strong>
                    {r.createdAt && ` · ${new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                  background: r.status === 'approved' ? 'rgba(16,185,129,0.1)' : r.status === 'rejected' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.1)',
                  color: r.status === 'approved' ? '#10b981' : r.status === 'rejected' ? '#ef4444' : '#f59e0b',
                }}>
                  {r.status === 'approved' ? '✅ Approved' : r.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                &ldquo;{r.comment}&rdquo;
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {r.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(r.id, 'approved')}
                    style={{ padding: '5px 14px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ✅ Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(r.id, 'rejected')}
                    style={{ padding: '5px 14px', background: 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ❌ Reject
                  </button>
                )}
                <button
                  onClick={() => deleteReview(r.id)}
                  style={{ padding: '5px 14px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Promos Tab ────────────────────────────────────────────────────────────────
function PromosTab() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiresAt: '', description: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCodes = () => {
    setLoading(true);
    fetch('/api/promo')
      .then((r) => r.json())
      .then((d) => { if (d.success) setCodes(d.codes); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return setFormError('Code and value are required');
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreating(false);
      setForm({ code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiresAt: '', description: '' });
      fetchCodes();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCode = async (id) => {
    if (!confirm('Delete this promo code?')) return;
    await fetch(`/api/promo?id=${id}`, { method: 'DELETE' });
    fetchCodes();
  };

  return (
    <>
      <div className="admin-header">
        <h1>🎁 Promo Codes</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating((v) => !v)} id="create-promo-btn">
          {creating ? '✕ Cancel' : '+ Create Code'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', marginBottom: '1.25rem' }}>New Promo Code</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Code *</label>
              <input className="form-input" placeholder="e.g. SAVE20" value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px', height: 42 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Type *</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={{ height: 42 }}>
                <option value="percent">% Percentage off</option>
                <option value="flat">₹ Flat amount off</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                Value * ({form.type === 'percent' ? '%' : '₹'})
              </label>
              <input className="form-input" type="number" placeholder={form.type === 'percent' ? '20' : '50'} value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} style={{ height: 42 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Min Order (₹)</label>
              <input className="form-input" type="number" placeholder="0 = no minimum" value={form.minOrder}
                onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} style={{ height: 42 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Max Uses</label>
              <input className="form-input" type="number" placeholder="0 = unlimited" value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} style={{ height: 42 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Expires On</label>
              <input className="form-input" type="date" value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} style={{ height: 42 }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Description (shown to customers)</label>
              <input className="form-input" placeholder="e.g. First order discount" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ height: 42 }} />
            </div>
          </div>
          {formError && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.75rem' }}>⚠️ {formError}</p>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-promo-btn">
              {saving ? '⏳ Creating...' : '✅ Create Promo Code'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : codes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎁</div>
          <p>No promo codes yet — create your first one!</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => {
                const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                const usedUp = c.maxUses > 0 && (c.usedCount || 0) >= c.maxUses;
                return (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '1px', color: 'var(--accent)', fontSize: '0.9rem' }}>
                        {c.code}
                      </span>
                    </td>
                    <td>{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} off</td>
                    <td>{c.minOrder > 0 ? `₹${c.minOrder}` : '—'}</td>
                    <td>{c.usedCount || 0}{c.maxUses > 0 ? ` / ${c.maxUses}` : ' / ∞'}</td>
                    <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {c.description || '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${expired || usedUp ? 'out-of-stock' : 'delivered'}`}>
                        {expired ? '⏰ Expired' : usedUp ? '🚫 Used up' : '✅ Active'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => deleteCode(c.id)}
                        style={{ background: 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '4px 12px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
