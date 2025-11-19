# Vercel Deployment Guide

This guide walks you through deploying the frontend and backend separately on Vercel through GitHub.

## Prerequisites

1. GitHub account with this repository pushed
2. Vercel account (sign up at https://vercel.com)
3. Firebase project with service account credentials

## Part 1: Deploy Backend

### Step 1: Push Backend to GitHub

Ensure your backend code is committed and pushed to your GitHub repository.

### Step 2: Import Backend to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (not needed)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### Step 3: Configure Backend Environment Variables

In the Vercel project settings, add these environment variables:

```env
NODE_ENV=production
PORT=5000

# Firebase Configuration (Get from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-actual-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-strong-jwt-secret-key-minimum-32-characters

# Admin Credentials
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=YourSecurePassword123!

# Leave FRONTEND_URL empty for now - will add after frontend deployment
FRONTEND_URL=
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`: Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` with `\n` for line breaks
- Generate a strong `JWT_SECRET` using a password generator (minimum 32 characters)
- Use a secure `INITIAL_ADMIN_PASSWORD` for production

### Step 4: Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://your-backend.vercel.app`)
4. Test the health endpoint: `https://your-backend.vercel.app/health`

---

## Part 2: Deploy Frontend

### Step 1: Import Frontend to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import the same GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Step 2: Configure Frontend Environment Variables

In the Vercel project settings, add these environment variables:

```env
# Use your backend URL from Step 4 above
REACT_APP_API_URL=https://your-backend.vercel.app
REACT_APP_ENV=production
```

### Step 3: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Copy your frontend URL (e.g., `https://your-frontend.vercel.app`)

---

## Part 3: Update Backend CORS

### Step 1: Update Backend Environment Variables

1. Go back to your **backend project** in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Update or add `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

### Step 2: Redeploy Backend

1. Go to **Deployments** tab
2. Click on the three dots (...) on the latest deployment
3. Click **"Redeploy"**
4. Wait for redeployment to complete

---

## Part 4: Verify Deployment

### Test Backend

1. Visit `https://your-backend.vercel.app/health`
2. Should return:
   ```json
   {
     "status": "OK",
     "message": "Server is running",
     "timestamp": "...",
     "environment": "production"
   }
   ```

### Test Frontend

1. Visit `https://your-frontend.vercel.app`
2. Application should load correctly
3. Try logging in with your admin credentials
4. Check browser console for any CORS or API errors

---

## Part 5: Custom Domains (Optional)

### Add Custom Domain to Frontend

1. In your frontend Vercel project
2. Go to **Settings** → **Domains**
3. Add your custom domain (e.g., `www.yourapp.com`)
4. Follow Vercel's DNS configuration instructions

### Add Custom Domain to Backend

1. In your backend Vercel project
2. Go to **Settings** → **Domains**
3. Add your custom domain (e.g., `api.yourapp.com`)
4. Follow Vercel's DNS configuration instructions

### Update Environment Variables for Custom Domains

1. Update frontend `REACT_APP_API_URL` to use your custom backend domain
2. Update backend `FRONTEND_URL` to use your custom frontend domain
3. Redeploy both projects

---

## Troubleshooting

### CORS Errors

**Symptom:** Browser console shows CORS errors

**Solution:**
1. Verify `FRONTEND_URL` is set correctly in backend environment variables
2. Ensure frontend URL includes `https://` and no trailing slash
3. Redeploy backend after changing environment variables

### 404 Errors on Frontend Routes

**Symptom:** Refreshing the page shows 404 error

**Solution:** The `vercel.json` in frontend directory handles this by routing all requests to `index.html`

### Backend 500 Errors

**Symptom:** API calls return 500 errors

**Solution:**
1. Check Vercel logs: Project → Deployments → Click deployment → View Function Logs
2. Verify all Firebase environment variables are set correctly
3. Ensure `FIREBASE_PRIVATE_KEY` has proper line breaks (`\n`)

### Environment Variables Not Working

**Symptom:** Changes to environment variables don't take effect

**Solution:**
1. Environment variables require a redeployment to take effect
2. Go to Deployments → Redeploy latest deployment
3. For frontend, ensure variables start with `REACT_APP_`

### Firebase Authentication Errors

**Symptom:** Login fails or shows Firebase errors

**Solution:**
1. Verify Firebase credentials in backend environment variables
2. Check Firebase Console → Authentication is enabled
3. Ensure service account has proper permissions
4. Check Vercel function logs for detailed error messages

---

## GitHub Workflow

### Making Changes

1. **Make changes locally** in your codebase
2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. **Push to GitHub**:
   ```bash
   git push origin main
   ```
4. **Automatic deployment**: Vercel automatically deploys when you push to GitHub

### Branch Previews

- Push to a feature branch to create a preview deployment
- Vercel creates a unique URL for each branch
- Merge to `main` to deploy to production

---

## Environment Variables Quick Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.vercel.app` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk-xxx@...` |
| `JWT_SECRET` | JWT signing secret | `min-32-char-random-string` |
| `INITIAL_ADMIN_EMAIL` | Admin email | `admin@example.com` |
| `INITIAL_ADMIN_PASSWORD` | Admin password | `SecurePassword123!` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://your-backend.vercel.app` |
| `REACT_APP_ENV` | Environment mode | `production` |

---

## Security Checklist

- [ ] Strong JWT_SECRET (minimum 32 characters)
- [ ] Secure INITIAL_ADMIN_PASSWORD
- [ ] Firebase private key properly escaped
- [ ] CORS configured with specific frontend URL
- [ ] All sensitive data in environment variables (not in code)
- [ ] `.env` files added to `.gitignore`
- [ ] No secrets committed to GitHub

---

## Next Steps

1. **Monitor your deployments** in Vercel dashboard
2. **Set up analytics** (Vercel Analytics)
3. **Configure error monitoring** (consider Sentry)
4. **Set up GitHub Actions** for automated testing
5. **Enable Vercel Edge Caching** for better performance

---

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Firebase Documentation: https://firebase.google.com/docs

---

## Important Notes

- **Do not commit `.env` files to GitHub** - they contain sensitive credentials
- **Always use environment variables** for sensitive data
- **Redeploy after changing environment variables** - changes require redeployment
- **Test thoroughly** after deployment before sharing with users
- **Keep Firebase credentials secure** - never expose them publicly

---

## Cost Considerations

### Vercel Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function execution
- Automatic HTTPS
- Preview deployments

### Monitor Usage:
- Check Vercel dashboard for usage limits
- Upgrade to Pro if needed for higher traffic

---

## Deployment Complete! 🎉

Your application is now live on Vercel with:
- ✅ Separate frontend and backend deployments
- ✅ Proper CORS configuration
- ✅ Environment-specific settings
- ✅ Automatic deployments from GitHub
- ✅ HTTPS enabled by default
- ✅ Production-ready security
