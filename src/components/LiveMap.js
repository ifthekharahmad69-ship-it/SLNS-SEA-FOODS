'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const STORE_LAT = 17.385044;
const STORE_LNG = 78.486671;
const STORE_NAME = 'SLNS Fresh Sea Foods';

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

// Reverse geocode using Nominatim (OpenStreetMap) — free, no API key
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export default function LiveMap({ height = '420px', showUserLocation = true }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const lineRef = useRef(null);
  const watchIdRef = useRef(null);
  const initedRef = useRef(false);
  const savedRef = useRef(false); // only save to Firestore once per session

  const [status, setStatus] = useState('idle');
  const [distance, setDistance] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [address, setAddress] = useState(null);
  const [permDenied, setPermDenied] = useState(false);

  const user = getAuth().currentUser;

  /* ── Save location to Firestore ── */
  const saveLocationToFirestore = async (lat, lng, addr) => {
    if (savedRef.current) return; // only save once per page load
    savedRef.current = true;
    try {
      const uid = user?.uid || 'anonymous_' + Math.random().toString(36).slice(2, 9);
      await setDoc(
        doc(db, 'user_locations', uid),
        {
          uid,
          email: user?.email || null,
          name: user?.displayName || 'Guest',
          lat,
          lng,
          address: addr || null,
          distanceKm: parseFloat(calcDistance(STORE_LAT, STORE_LNG, lat, lng)),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Location save failed:', err.message);
    }
  };

  /* ── Auto-start location on mount ── */
  useEffect(() => {
    if (!showUserLocation) return;
    // Small delay so map is ready first
    const t = setTimeout(() => {
      startTracking(true); // true = auto (silent, no confirm)
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserLocation]);

  /* ── Init Leaflet map once ── */
  useEffect(() => {
    if (initedRef.current) return;
    if (mapRef.current && mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
    }

    initedRef.current = true;
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return;
      if (mapRef.current._leaflet_id) return;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [STORE_LAT, STORE_LNG],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Store pin
      const storeIcon = L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg,#0F4C75,#3282B8);
            width:44px;height:44px;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);border:3px solid white;
            box-shadow:0 4px 14px rgba(15,76,117,0.5);
            display:flex;align-items:center;justify-content:center;">
            <span style="transform:rotate(45deg);font-size:20px;line-height:1;">🦐</span>
          </div>`,
        className: '',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -46],
      });

      const storeMarker = L.marker([STORE_LAT, STORE_LNG], { icon: storeIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:160px;">
            <strong style="font-size:14px;">🦐 ${STORE_NAME}</strong><br/>
            <span style="color:#6B7280;font-size:12px;">Fresh seafood daily · 7AM–9PM</span><br/>
            <a href="https://wa.me/917995177216" target="_blank"
               style="color:#25D366;font-size:12px;font-weight:600;text-decoration:none;">
              📱 Order on WhatsApp
            </a>
          </div>`,
          { maxWidth: 220 }
        )
        .openPopup();

      mapInstanceRef.current = { map, L, storeMarker };
    });

    return () => {
      cancelled = true;
      initedRef.current = false;
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
        userMarkerRef.current = null;
        lineRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Start live GPS watch ── */
  const startTracking = (auto = false) => {
    if (!navigator.geolocation) { setStatus('error'); return; }
    setStatus('locating');
    setPermDenied(false);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setUserCoords({ lat, lng });
        setAccuracy(Math.round(acc));
        setDistance(calcDistance(STORE_LAT, STORE_LNG, lat, lng));
        setStatus('found');

        // Reverse geocode once (first fix)
        if (!savedRef.current) {
          const addr = await reverseGeocode(lat, lng);
          setAddress(addr);
          await saveLocationToFirestore(lat, lng, addr);
        }

        import('leaflet').then((L) => {
          if (!mapInstanceRef.current) return;
          const { map } = mapInstanceRef.current;

          const userIcon = L.divIcon({
            html: `
              <div style="position:relative;width:28px;height:28px;">
                <div style="
                  position:absolute;inset:0;background:#10B981;border-radius:50%;
                  border:3px solid white;box-shadow:0 2px 8px rgba(16,185,129,0.5);
                  animation:livePulse 1.8s infinite;">
                </div>
                <div style="
                  position:absolute;inset:6px;background:white;border-radius:50%;
                  display:flex;align-items:center;justify-content:center;font-size:8px;">
                  📍
                </div>
                <style>
                  @keyframes livePulse{
                    0%  {box-shadow:0 0 0 0 rgba(16,185,129,.5);}
                    70% {box-shadow:0 0 0 18px rgba(16,185,129,0);}
                    100%{box-shadow:0 0 0 0 rgba(16,185,129,0);}
                  }
                </style>
              </div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
          } else {
            userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
              .addTo(map)
              .bindPopup(
                `<div style="font-family:sans-serif;">
                  <strong>📍 Your Location</strong><br/>
                  <span style="color:#6B7280;font-size:12px;">Accuracy: ±${Math.round(acc)}m</span>
                </div>`
              );
          }

          if (lineRef.current) {
            lineRef.current.setLatLngs([[STORE_LAT, STORE_LNG], [lat, lng]]);
          } else {
            lineRef.current = L.polyline(
              [[STORE_LAT, STORE_LNG], [lat, lng]],
              { color: '#10B981', weight: 2.5, opacity: 0.7, dashArray: '8 8' }
            ).addTo(map);
          }

          map.fitBounds([[STORE_LAT, STORE_LNG], [lat, lng]], { padding: [60, 60] });
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setPermDenied(true);
        } else {
          setStatus('error');
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  /* ── Stop tracking ── */
  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (mapInstanceRef.current) {
      const { map } = mapInstanceRef.current;
      if (userMarkerRef.current) { map.removeLayer(userMarkerRef.current); userMarkerRef.current = null; }
      if (lineRef.current)       { map.removeLayer(lineRef.current);       lineRef.current = null; }
      map.setView([STORE_LAT, STORE_LNG], 14, { animate: true });
    }
    setStatus('idle');
    setDistance(null);
    setUserCoords(null);
    setAccuracy(null);
    setAddress(null);
    savedRef.current = false;
  };

  const centerOnStore = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.map.setView([STORE_LAT, STORE_LNG], 15, { animate: true });
      mapInstanceRef.current.storeMarker.openPopup();
    }
  };

  const dotColor =
    status === 'found'    ? '#10B981' :
    status === 'locating' ? '#F59E0B' :
    status === 'denied' || status === 'error' ? '#EF4444' : '#6B7280';

  const statusText =
    status === 'idle'    ? '🗺️ Tap to share your location' :
    status === 'locating'? '⏳ Getting your location...' :
    status === 'found'   ? `📍 ${distance} km from store · ±${accuracy}m` :
    status === 'denied'  ? '⚠️ Location permission denied — please allow in browser' :
                           '⚠️ Location unavailable';

  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', background: 'var(--bg-card)' }}>

      {/* ── Control bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem',
        background: 'var(--bg-dark)', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: dotColor,
            display: 'inline-block',
            animation: status === 'locating' || status === 'found' ? 'pulse 1.5s infinite' : 'none',
          }} />
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {statusText}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button onClick={centerOnStore} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer' }}>
            🦐 Store
          </button>

          {showUserLocation && (
            status === 'idle' || status === 'denied' || status === 'error' ? (
              <button
                onClick={() => { savedRef.current = false; startTracking(false); }}
                id="track-live-location-btn"
                style={{ background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                📍 {status === 'denied' ? 'Try Again' : 'Share Location'}
              </button>
            ) : status === 'locating' ? (
              <button disabled style={{ background: 'rgba(245,158,11,0.3)', border: 'none', color: 'white', borderRadius: 'var(--radius-sm)', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'not-allowed' }}>
                ⏳ Locating...
              </button>
            ) : (
              <button
                onClick={stopTracking}
                id="stop-live-location-btn"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', borderRadius: 'var(--radius-sm)', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                ✕ Stop
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Permission denied help banner ── */}
      {permDenied && (
        <div style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '0.6rem 1.25rem', fontSize: '0.8rem', color: '#FCA5A5', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>⚠️</span>
          <span>To allow location: click the 🔒 icon in your browser address bar → allow <strong>Location</strong></span>
        </div>
      )}

      {/* ── Map ── */}
      <div ref={mapRef} style={{ height, width: '100%', zIndex: 0 }} id="leaflet-map" />

      {/* ── Footer ── */}
      {status === 'found' && distance && (
        <div style={{ display: 'flex', gap: '1.5rem', padding: '0.75rem 1.25rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>📏 <strong style={{ color: 'var(--text-primary)' }}>{distance} km</strong> from store</span>
          <span>🎯 Accuracy <strong style={{ color: 'var(--text-primary)' }}>±{accuracy}m</strong></span>
          {address && (
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📍 {address.split(',').slice(0, 3).join(',')}
            </span>
          )}
          <a
            href={`https://www.openstreetmap.org/directions?from=${userCoords?.lat},${userCoords?.lng}&to=${STORE_LAT},${STORE_LNG}`}
            target="_blank" rel="noopener noreferrer"
            style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}
          >
            Get Directions →
          </a>
        </div>
      )}
    </div>
  );
}
