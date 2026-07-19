# 🔥 Firebase Setup Guide — Amma Sea Foods
## Takes ~5 minutes. Follow each step carefully.

---

## Step 1 — Create a Firebase Project

1. Go to → **https://console.firebase.google.com**
2. Click **"Add project"**
3. Project name: `amma-sea-foods` (or any name)
4. Disable Google Analytics (not needed now) → Click **"Create project"**
5. Wait ~30 seconds for setup to complete

---

## Step 2 — Enable Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select region: **`asia-south1`** (Mumbai — closest to India) → Click **"Enable"**

---

## Step 3 — Get Client SDK Config (for `.env.local`)

1. In Firebase console, click the **⚙️ gear icon** (top left) → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **`</>`** (Web) icon
4. App nickname: `amma-web` → Click **"Register app"**
5. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "amma-sea-foods.firebaseapp.com",
  projectId: "amma-sea-foods",
  storageBucket: "amma-sea-foods.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Copy each value into `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=amma-sea-foods.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=amma-sea-foods
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=amma-sea-foods.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Step 4 — Get Admin SDK Keys (for `.env.local`)

1. Go to **Project Settings** → **"Service accounts"** tab
2. Click **"Generate new private key"** → Click **"Generate key"**
3. A JSON file downloads to your computer. Open it.
4. Copy these 3 values into `.env.local`:

```
FIREBASE_ADMIN_PROJECT_ID=          ← "project_id" from JSON
FIREBASE_ADMIN_CLIENT_EMAIL=        ← "client_email" from JSON
FIREBASE_ADMIN_PRIVATE_KEY=         ← "private_key" from JSON (paste exactly as-is)
```

> ⚠️ **Important for FIREBASE_ADMIN_PRIVATE_KEY**: The value starts with `-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----\n`. Paste the entire thing including the quotes that wrap it in the JSON file.

---

## Step 5 — Firestore Security Rules

1. In Firebase console → **Firestore Database** → **"Rules"** tab
2. Replace the existing rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders: anyone can create (place order), only server can read/update
    match /orders/{orderId} {
      allow create: if true;
      allow read: if true;   // We'll restrict this in Phase 2 with auth
      allow update: if false; // Only server-side Admin SDK can update
      allow delete: if false;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 6 — Restart Dev Server

After filling in `.env.local`, restart the dev server:
```bash
# Stop current server (Ctrl+C), then:
npm run dev
```

---

## ✅ Done! 
Once the dev server is running with your `.env.local` filled in, place a test order and check Firebase console → Firestore → `orders` collection to see it appear live!
