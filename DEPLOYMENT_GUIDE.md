# Cinephile Central - Deployment Guide

## Current Deployment Status

### ❌ Blocked: Firebase Billing Plan Required

Your last deployment attempt failed with:

```
Error: Your project gen-lang-client-0239125682 must be on the Blaze (pay-as-you-go) plan to complete this command.
```

**Reason:** Cloud Functions deployment requires the Blaze plan to enable:

- Cloud Build API
- Artifact Registry API

---

## Pre-Deployment Checklist

### 1. ✅ Firebase Project Setup

- [x] Firebase project created: `gen-lang-client-0239125682`
- [x] Firebase CLI installed and logged in
- [ ] **Upgrade to Blaze (pay-as-you-go) plan**

**How to Upgrade:**

1. Visit: https://console.firebase.google.com/project/gen-lang-client-0239125682/usage/details
2. Click "Upgrade project" or "Modify plan"
3. Select "Blaze - Pay as you go"
4. Add billing information (credit card required)

**Cost Information:**

- Cloud Functions: First 2 million invocations free per month
- Firestore: 50K reads, 20K writes, 20K deletes free per day
- Hosting: 10GB storage, 360MB/day transfer free
- For a small app, costs are typically $0-5/month

---

### 2. ❌ Update Backend Dependencies (Critical Security Issue)

**Current Issue:** `axios@0.21.1` has known security vulnerability (CVE-2021-3749)

**Action Required:**

```powershell
cd "C:\Users\lefat\Documents\Web Design\Lab-Test 2\server\functions"
npm update
```

Or manually update `server/functions/package.json`:

```json
{
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "firebase-admin": "^11.11.0",
    "firebase-functions": "^4.5.0"
  }
}
```

Then run: `npm install`

---

### 3. ❌ Configure Firestore Security Rules

**Current Status:** `firestore.rules` is empty (insecure!)

**Action Required:** Add these rules to `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reviews collection
    match /reviews/{reviewId} {
      // Anyone can read reviews
      allow read: if true;

      // Only authenticated users can create reviews
      allow create: if request.auth != null
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.rating is number
        && request.resource.data.rating >= 1
        && request.resource.data.rating <= 5;

      // Only the author can update or delete their review
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.authorId;
    }
  }
}
```

---

### 4. ⚠️ Firebase Configuration Update

**Update `firebase.json`** to use Node.js 18:

```json
{
  "hosting": {
    "public": "client/cinephile-central/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "server/functions",
    "runtime": "nodejs18"
  }
}
```

---

### 5. ✅ Build Frontend

**Action Required:**

```powershell
cd "C:\Users\lefat\Documents\Web Design\Lab-Test 2\client\cinephile-central"
npm install
npm run build
```

This creates the production build in `client/cinephile-central/dist/`

---

## Deployment Steps

### Option A: Deploy Everything (Recommended for First Deployment)

```powershell
cd "C:\Users\lefat\Documents\Web Design\Lab-Test 2"
firebase deploy
```

This deploys:

- Cloud Functions (API)
- Hosting (Frontend)
- Firestore Rules
- Firestore Indexes

---

### Option B: Deploy Components Separately

#### 1. Deploy Firestore Rules First

```powershell
cd "C:\Users\lefat\Documents\Web Design\Lab-Test 2"
firebase deploy --only firestore:rules
```

#### 2. Deploy Cloud Functions

```powershell
firebase deploy --only functions
```

**Expected output:**

```
✔  functions[api(us-central1)]: Successful create operation.
Function URL (api(us-central1)): https://us-central1-gen-lang-client-0239125682.cloudfunctions.net/api
```

#### 3. Deploy Hosting

```powershell
firebase deploy --only hosting
```

**Expected output:**

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/gen-lang-client-0239125682/overview
Hosting URL: https://gen-lang-client-0239125682.web.app
```

---

## Post-Deployment Verification

### 1. Test Hosting

Visit: `https://gen-lang-client-0239125682.web.app`

**Expected:** Home page loads with movie listings

---

### 2. Test Authentication

1. Click "Sign Up"
2. Create a test account
3. Verify login works
4. Check Firebase Console → Authentication

---

### 3. Test API Functions

**Check function URL:**

```powershell
firebase functions:list
```

**Test review endpoint:**

```powershell
curl https://us-central1-gen-lang-client-0239125682.cloudfunctions.net/api/reviews/550
```

---

### 4. Test Reviews

1. Navigate to a movie details page
2. Add a review (requires login)
3. Verify review appears
4. Check Firestore Console → Database → reviews collection

---

## Environment Variables (Optional Enhancement)

### Create `.env` files for sensitive data

**Client `.env` (optional):**

```env
VITE_FIREBASE_API_KEY=AIzaSyDmpoE8jCddMSi5-hpmRrdQfIplERKF1Xc
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0239125682.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0239125682
```

**Functions `.env`:**

```env
TMDB_API_KEY=ab50b351df7f7ded6432c8db8d8100d8
```

**Update functions config:**

```powershell
firebase functions:config:set tmdb.api_key="ab50b351df7f7ded6432c8db8d8100d8"
```

**Access in code:**

```javascript
const TMDB_API_KEY = functions.config().tmdb.api_key;
```

---

## Troubleshooting

### Issue: "Cannot find module" after deployment

**Solution:** Ensure all dependencies are in `dependencies` (not `devDependencies`)

---

### Issue: CORS errors in production

**Solution:**

1. Verify `cors({ origin: true })` in functions
2. Check Firebase Hosting rewrites configuration

---

### Issue: 404 on page refresh

**Solution:** Ensure SPA rewrite rule exists in `firebase.json`:

```json
{
  "source": "**",
  "destination": "/index.html"
}
```

---

### Issue: Reviews not loading

**Solution:**

1. Check Firestore rules are deployed
2. Verify function URL in browser console
3. Check browser console for CORS/auth errors
4. Verify Firestore indexes

---

### Issue: Function cold starts are slow

**Solution:**

- Consider upgrading function memory
- Implement function warming (scheduled function that pings API)
- Use Cloud Run for faster cold starts (advanced)

---

## Monitoring & Maintenance

### Firebase Console Dashboards

1. **Functions:** Monitor invocations, errors, execution time

   - https://console.firebase.google.com/project/gen-lang-client-0239125682/functions

2. **Hosting:** Check bandwidth usage

   - https://console.firebase.google.com/project/gen-lang-client-0239125682/hosting

3. **Firestore:** Monitor reads/writes

   - https://console.firebase.google.com/project/gen-lang-client-0239125682/firestore

4. **Authentication:** User statistics
   - https://console.firebase.google.com/project/gen-lang-client-0239125682/authentication

---

### Logs & Debugging

**View function logs:**

```powershell
firebase functions:log
```

**View logs for specific function:**

```powershell
firebase functions:log --only api
```

**Real-time logs:**

```powershell
firebase functions:log --follow
```

---

## Cost Optimization Tips

1. **Enable Function Caching:** Cache TMDB responses
2. **Optimize Firestore Queries:** Use indexes, limit results
3. **CDN for Images:** Use TMDB CDN URLs (already implemented)
4. **Set Function Timeout:** Reduce from default 60s to 10s
5. **Monitor Usage:** Set up budget alerts in GCP Console

---

## Quick Command Reference

```powershell
# Build and deploy everything
cd "C:\Users\lefat\Documents\Web Design\Lab-Test 2\client\cinephile-central"
npm run build
cd ..\..
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# View logs
firebase functions:log --follow

# List functions
firebase functions:list

# Test locally with emulators
firebase emulators:start

# Open Firebase console
firebase open
```

---

## Next Steps After Deployment

1. ✅ Test all features in production
2. 🔒 Set up custom domain (optional)
3. 📊 Enable Google Analytics
4. 🐛 Set up error tracking (Sentry)
5. 📱 Test on mobile devices
6. ♿ Accessibility audit
7. 🚀 Performance optimization (Lighthouse)
8. 📝 User documentation

---

## Custom Domain Setup (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., cinephile-central.com)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (24-48 hours)

---

**Last Updated:** November 2, 2025
**Project:** Cinephile Central v1.0
**Firebase Project ID:** gen-lang-client-0239125682
