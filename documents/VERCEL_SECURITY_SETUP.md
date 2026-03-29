# Vercel Deployment Security Fix

## 🔒 API Secret Protection

Your API credentials are now **secure**! The `API_CLIENT_SECRET` is no longer exposed to the browser.

### ⚠️ URGENT: Configure Environment Variables in Vercel

**The 500 error you're seeing is because environment variables are not configured in Vercel.**

### Step-by-Step Setup:

#### 1. Go to Vercel Dashboard
   - Open: https://vercel.com/software-solutions-mx/software-solutions
   - Click on **Settings** → **Environment Variables**

#### 2. Add These Environment Variables

**For Production, Preview, and Development:**

```
API_CLIENT_ID=api_client_id_placeholder
API_CLIENT_SECRET=api_client_secret_placeholder
API_BASE_URL=https://your-production-rails-api.com
```

**IMPORTANT:**
- ❌ Do NOT use `VITE_` prefix for `API_CLIENT_ID`, `API_CLIENT_SECRET`, or `API_BASE_URL`
- ✅ These are server-side only variables
- ⚠️ Replace `https://your-production-rails-api.com` with your actual production Rails API URL
- ⚠️ The API URL must be HTTPS, not HTTP (you're currently trying to use `http://192.168.1.25:3000`)

### 🚨 Incident Response (If a key was ever committed)

If any real key/token was committed to git history, treat it as compromised:

1. Rotate the exposed credential immediately in the API provider.
2. Update Vercel environment variables with the rotated value.
3. Invalidate old tokens/sessions tied to the leaked key.
4. Trigger a clean redeploy in Vercel.
5. Verify logs for suspicious usage during exposure window.

> Never place real credentials in docs, examples, issues, or PR comments.

#### 3. Add Public Environment Variable (Optional)

If you need the API base URL in client code:

```
VITE_API_BASE_URL=https://your-production-rails-api.com
```

This can be exposed to the browser safely since it's just a URL.

#### 4. Save and Redeploy

After adding the variables:
- Click **Save**
- Vercel will automatically redeploy
- Or manually trigger a redeploy from the Deployments tab

---

## 🔍 Current Issue Diagnosis

Based on your console errors:

1. **500 Error on `/api/get-token`**
   - Cause: Missing `API_CLIENT_ID`, `API_CLIENT_SECRET`, or `API_BASE_URL` in Vercel
   - Fix: Add the environment variables above

2. **Mixed Content Error** 
   ```
   Mixed Content: The page at 'https://softwaresolutions.com.mx/contact' was loaded over HTTPS, 
   but requested an insecure XMLHttpRequest endpoint 'http://192.168.1.25:3000/api/v1/contact_messages'
   ```
   - Cause: Your production site is still pointing to local dev server
   - Fix: Set `VITE_API_BASE_URL` to your production HTTPS URL in Vercel

3. **CORS Error**
   ```
   Access to XMLHttpRequest at 'http://192.168.1.25:3000/api/v1/contact_messages' from origin 
   'https://softwaresolutions.com.mx' has been blocked by CORS policy
   ```
   - Cause: Production site trying to access local dev server
   - Fix: Configure correct production API URL in Vercel

---

## 📋 Checklist

- [ ] Add `API_CLIENT_ID` to Vercel environment variables (no VITE_ prefix)
- [ ] Add `API_CLIENT_SECRET` to Vercel environment variables (no VITE_ prefix)  
- [ ] Add `API_BASE_URL` with your production HTTPS URL (no VITE_ prefix)
- [ ] Optionally add `VITE_API_BASE_URL` for client-side use
- [ ] Save and redeploy in Vercel
- [ ] Test the contact form on production
- [ ] Remove any old `VITE_API_CLIENT_SECRET` variables if they exist
- [ ] Confirm no real tokens are present in repository files or commit history

---

## 🎯 What Your Production Rails API URL Should Be

Instead of `http://192.168.1.25:3000`, you need something like:
- `https://api.yourdomain.com`
- `https://yourdomain.com` (if Rails is on same domain)
- `https://your-heroku-app.herokuapp.com`
- `https://your-render-app.onrender.com`

**Your Rails API must:**
- ✅ Be accessible over HTTPS
- ✅ Have CORS configured to allow requests from `https://softwaresolutions.com.mx`
- ✅ Be publicly accessible (not on your local network)

---

## 🔧 Testing Locally

Your local `.env.local` file works fine for development. The serverless function will use those values when running `npm run dev` locally.

---

## 📊 How to Verify It's Working

After deploying with correct environment variables:

1. Open: https://softwaresolutions.com.mx/contact
2. Open DevTools → Console
3. Submit the contact form
4. You should see: `[AuthService] JWT token generated successfully`
5. No 500 errors on `/api/get-token`

---

## 🆘 If Still Not Working

Check Vercel function logs:
1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Find `/api/get-token`
4. Click **View Logs**
5. Look for error messages about missing environment variables
