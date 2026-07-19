# 🦐 Amma Sea Foods — Master Build Guide

> One file. All phases. Navigate using the links below.

---

## 📋 Quick Navigation

| Phase | What | Status | Time |
|---|---|---|---|
| [Phase 1 — Firebase](#phase-1--firebase-firestore) | Real database + orders | ✅ Done | — |
| [Phase 2 — Admin Auth](#phase-2--admin-authentication) | 3 admin logins protected | ✅ Done | — |
| [Phase 3 — Payments](#phase-3--payments) | UPI QR Code (GPay, PhonePe, Paytm) | ✅ Done | — |
| [Phase 4 — Deploy](#phase-4--deploy-to-vercel) | Live on internet | ⬜ Pending | 1 day |
| [Phase 5 — Customer Login](#phase-5--customer-accounts) | User accounts + order history | ✅ Done | — |
| [Phase 6 — Product Admin](#phase-6--product-management) | Edit products without code | ✅ Done | — |
| [Phase 7 — PWA](#phase-7--pwa-installable-app) | Install as phone app (2 separate apps) | ✅ Done | — |
| [Phase 8 — WhatsApp API](#phase-8--whatsapp-auto-notifications) | Auto order notifications | ⬜ Pending | 2 days |
| [Phase 9 — SEO](#phase-9--seo--google-discovery) | Google search visibility | ✅ Done | — |
| [Phase 10 — Analytics](#phase-10--analytics) | Sales charts + insights | ⬜ Pending | 1–2 days |
| [Phase 11 — Advanced](#phase-11--advanced-features) | Promo codes, delivery slots | ✅ Done | — |

---

---

## ✅ Phase 1 — Firebase Firestore

**Goal:** Save real orders to a live database.

### What Was Built
- `src/lib/firebase.js` — client SDK
- `src/lib/firebaseAdmin.js` — admin SDK
- `src/app/api/orders/route.js` — create + list orders
- `src/app/api/orders/[id]/route.js` — update order status
- `src/app/checkout/page.js` — saves order to Firestore
- `src/app/track/page.js` — real-time order tracking

### Setup Checklist
- [x] Firebase project created (`amma-sea-foods`)
- [x] Firestore database created (`asia-south1`)
- [x] `.env.local` filled with client + admin keys
- [x] Firestore rules published (allow read/create on orders)

### Firestore Rules (already published)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow create: if true;
      allow read: if true;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

---

---

## ✅ Phase 2 — Admin Authentication

**Goal:** Protect `/admin` — only 3 brothers can log in.

### What Was Built
- `src/middleware.js` — blocks `/admin` → redirects to `/login`
- `src/app/login/page.js` — admin login form
- `src/app/api/auth/session/route.js` — sets secure session cookie

### Admin Emails (configured in `.env.local`)
- swamynarasimha670@gmail.com
- kopanathibhimaraju@gmail.com
- ifthekharahmad69@gmail.com

### How It Works
```
Anyone visits /admin
  → middleware checks for admin_session cookie
  → Not found → redirect to /login
  → Enter email + password
  → Server checks email is in ADMIN_EMAILS list
  → Sets cookie → access granted ✅
```

---

---

## ✅ Phase 3 — Payments

**Goal:** Accept online payments via UPI QR Code (Razorpay is under review — using QR instead).

### What Was Built
- `src/app/checkout/page.js` — new UPI payment flow:
  - Payment options: **Cash on Delivery** | **📱 UPI / QR Code**
  - After confirming a UPI order → **QR Code screen** with:
    - Dynamic QR generated from UPI ID + exact order amount
    - Scan with PhonePe, GPay, Paytm — amount pre-filled
    - Manual UPI ID + Copy button
    - UTR / Transaction ID entry box
    - “I’ve Paid” button → saves UTR to Firestore
- `src/app/api/orders/[id]/route.js` — PATCH now accepts `utrNumber` field
- `src/app/admin/page.js` — orders table now shows **📱 UPI** or **💵 COD** badge + UTR number

### Setup
Add to `.env.local`:
```
NEXT_PUBLIC_UPI_ID=your_upi_id@bank    ← find in PhonePe/GPay → Profile
NEXT_PUBLIC_UPI_NAME=Amma Sea Foods
```

Currently set to: `7995177216@ybl` (update to your actual UPI ID)

### Cost: **FREE** — 0% fees, direct bank transfer via UPI

---

---

## ⬜ Phase 4 — Deploy to Vercel

**Goal:** Make the app publicly accessible on the internet.

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
# Create repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/amma-sea-foods.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to → https://vercel.com → Sign up with GitHub
2. Click **"Add New Project"** → Import your GitHub repo
3. Click **"Deploy"** → Wait 2 minutes
4. Your app is live at `https://amma-sea-foods.vercel.app` 🎉

### Step 3 — Add Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables
Add ALL the variables from your `.env.local` file:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
ADMIN_EMAILS
```

### Step 4 — Custom Domain (Optional)
- Buy `ammaseafoods.in` from GoDaddy/Namecheap (~₹800/yr)
- Add in Vercel → Project → Settings → Domains

### Cost
- Vercel hosting: **Free** (up to 100GB bandwidth/mo)
- Domain: **₹800/year**

### Say "start phase 4" to begin →

---

---

## ⬜ Phase 5 — Customer Accounts

**Goal:** Customers can log in, see their order history, save addresses.

### Features
- Phone OTP login (perfect for Indian users)
- OR Google sign-in (1 click)
- Saved delivery addresses
- "My Orders" page — all past orders in one place
- Cart synced across devices (not just localStorage)

### Files to Build
```
src/app/account/page.js       ← My profile + order history
src/app/api/users/route.js    ← Save user data to Firestore
```

### Cost: Free (Firebase Auth)

### Say "start phase 5" to begin →

---

---

## ✅ Phase 6 — Product Management

**Goal:** Add/edit/delete products from admin panel — no code editing.

### What Was Built
- `src/lib/firebase.js` — added `storage` export (Firebase Storage client)
- `src/lib/uploadImage.js` — image upload helper (progress callbacks, 5 MB limit)
- `src/app/admin/page.js` — major upgrade:
  - **Add Product form** → image file upload (📁 button) + URL fallback + live preview + progress bar
  - **Edit Product modal** → full overlay form for ANY product (name, prices, category, type, weight, unit, stock, image, description)
  - **Edit button** on every product row (not just new ones)
  - **Bug fixed** — dashboard stat now uses live `allProducts` state instead of stale static import

### Image Storage Setup — Cloudinary (Free, No Credit Card)
Firebase Storage needs a paid plan. Use Cloudinary instead — it's free forever (25 GB).

1. Sign up free at **https://cloudinary.com** (no credit card)
2. From the Dashboard, copy your **Cloud Name** (top-left)
3. Go to **Settings → Upload → Upload presets → Add upload preset**
   - Signing mode: **Unsigned**
   - Folder: `amma-sea-foods/products`
   - Save → copy the **Preset name**
4. Add to your `.env.local`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here
```
5. Restart dev server → image uploads will work!

### Cost: **Free** (Cloudinary free tier — 25 GB storage, 25 GB/month bandwidth)

---

---

## ⬜ Phase 7 — PWA (Installable App)

**Goal:** Customers can install your website as an app on their Android/iPhone.

### What Customers See
- "Add to Home Screen" prompt on first visit
- App icon on their phone home screen
- Opens full screen (no browser bar)
- Works even with slow internet
- Push notifications: "Your order is out for delivery!" 🏍️

### Files to Build
```
public/manifest.json          ← App icon, name, colors
public/sw.js                  ← Service worker (offline + notifications)
next.config.mjs               ← Enable PWA
```

### Cost: Free

### Say "start phase 7" to begin →

---

---

## ⬜ Phase 8 — WhatsApp Auto Notifications

**Goal:** Automatic WhatsApp messages to customers without clicking.

### How It Works Now (Manual)
Admin clicks "📱" button → WhatsApp opens → manually send

### How It Will Work (Automatic)
Order placed → Customer instantly gets:
> "Hi Ithekhar! ✅ Your order ORD-A3X9K has been confirmed. Total: ₹560. We'll deliver by evening. — Amma Sea Foods"

Status changed → Customer automatically gets update.

### Options
| Service | Cost | Setup |
|---|---|---|
| WATI | ₹2,000/mo | Easy |
| Twilio | ₹0.50/msg | Medium |
| Interakt | ₹999/mo | Easy |

### Say "start phase 8" to begin →

---

---

## ⬜ Phase 9 — SEO & Google Discovery

**Goal:** Appear in Google when people search "fresh seafood Amalapuram" etc.

### What Gets Built
- Proper title + meta tags on every page
- Product structured data (Google shows price + rating in search)
- Sitemap.xml (tells Google all your pages)
- Google Search Console setup
- Local SEO — "seafood delivery near me"

### Cost: Free
### Time: 2 days

### Say "start phase 9" to begin →

---

---

## ⬜ Phase 10 — Analytics

**Goal:** See how many visitors, what they buy, peak hours, revenue trends.

### What Gets Built
- Google Analytics 4 (free)
- Admin dashboard charts — daily orders, revenue, top products
- Abandoned cart tracking
- Microsoft Clarity heatmaps (free — see where users click)

### Cost: Free
### Time: 1–2 days

### Say "start phase 10" to begin →

---

---

## ⬜ Phase 11 — Advanced Features

**Goal:** Compete with BigBasket / Swiggy Instamart level features.

### A. Reviews & Ratings ⭐
Customers rate products after delivery. Shows on product pages.

### B. Promo Codes & Flash Sales 🎁
Create discount codes from admin. Countdown timer for sales.

### C. Delivery Zones & Slots 🗺️
Define delivery pincodes. Customer picks morning/evening slot.

### D. Loyalty Points 🏆
Earn points on every order. Redeem for discounts. Keeps customers coming back.

### E. Inventory Management 📦
Set stock quantity. Auto out-of-stock when quantity = 0.

### Time: 1–2 weeks total
### Say "start phase 11" to begin →

---

---

## 💰 Monthly Cost Summary

| Scale | Orders/Month | Est. Cost |
|---|---|---|
| Starting out | 50–200 | ₹800–1,500/mo |
| Growing | 200–800 | ₹2,000–5,000/mo |
| Large scale | 800–3,000 | ₹5,000–15,000/mo |

---

## 📞 Need Help?
Just say the phase name or number in chat and I'll build it immediately!

Examples:
- `"start phase 3"` → Builds Razorpay payments
- `"start phase 4"` → Deploys to Vercel
- `"start phase 7"` → Makes it a phone app
