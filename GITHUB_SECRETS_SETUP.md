# GitHub Actions Secrets Setup

This document explains how to configure GitHub repository secrets for the automated CI/CD pipeline.

## Required secrets for automated deployment

### 1. Render Backend Deployment Hook

**Purpose:** Automatically deploy backend to Render when tests pass on `main` branch

**How to get it:**
1. Go to Render dashboard → select the `testing-and-debugging-ensuring-mern-app-*` service
2. Navigate to **Settings** → **Deploy Hook**
3. Copy the full webhook URL (includes authentication token)

**To add to GitHub:**
1. Go to repository settings: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `RENDER_DEPLOY_HOOK`
4. Value: Paste the Render webhook URL
5. Click **Add secret**

### 2. Vercel Frontend Deployment

You need three secrets for Vercel:

#### a. VERCEL_TOKEN

**How to get it:**
1. Go to https://vercel.com/account/tokens
2. Click **Create token**
3. Name it: `GitHub CI` (or similar)
4. Expiration: 7 days or custom (recommended: 1 year for CI automation)
5. Copy the token (shown only once)

**To add to GitHub:**
1. Go to repository settings: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: Paste the token
5. Click **Add secret**

#### b. VERCEL_PROJECT_ID

**How to get it:**
1. Go to Vercel dashboard
2. Select the `bug-tracker` project
3. Go to **Settings** → **General**
4. Find **Project ID** and copy it

Or from project URL: `https://vercel.com/<org>/<project-name>`
- Project ID is also available in `.vercel/project.json` in your repo

**To add to GitHub:**
1. Go to repository settings: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VERCEL_PROJECT_ID`
4. Value: Paste the Project ID
5. Click **Add secret**

#### c. VERCEL_ORG_ID

**How to get it:**
1. Go to https://vercel.com/account/settings
2. Find **Team ID** (if in an organization) or **Personal Account ID**
3. Copy it

Or check `.vercel/project.json` in your repo for `orgId` field

**To add to GitHub:**
1. Go to repository settings: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VERCEL_ORG_ID`
4. Value: Paste the Organization/Team ID
5. Click **Add secret**

## Optional secrets (for staging environment)

If setting up a separate staging environment:

### RENDER_STAGING_DEPLOY_HOOK

1. Create a new staging service on Render (name: `bug-tracker-staging`)
2. Get its Deploy Hook from Settings → Deploy Hook
3. Add as GitHub secret with name: `RENDER_STAGING_DEPLOY_HOOK`

### VERCEL_STAGING_PROJECT_ID

1. Create a new staging project on Vercel (name: `bug-tracker-staging`)
2. Copy its Project ID from Settings → General
3. Add as GitHub secret with name: `VERCEL_STAGING_PROJECT_ID`

## Verifying secrets are configured

### In GitHub UI
1. Go to repository **Settings → Secrets and variables → Actions**
2. You should see all configured secrets (masked for security)

### In GitHub Actions logs
1. Go to repository **Actions** tab
2. Select a workflow run
3. Check job logs for "RENDER_DEPLOY_HOOK not configured" or similar messages
4. If deployment steps skipped, secrets are likely not set

## Rotating secrets

### Render Deploy Hook
- No rotation needed (webhook is permanent unless manually changed)
- If you need to revoke, create a new Deploy Hook in Render settings

### Vercel Token
- Tokens have expiration dates
- Create a new token before expiration
- Update `VERCEL_TOKEN` secret in GitHub
- Delete old token from Vercel account settings

### Vercel Project/Org IDs
- These are permanent identifiers
- No rotation needed

## Testing the CI/CD pipeline

After configuring secrets:

1. **Make a test commit to `main` branch**
   ```bash
   git checkout main
   git commit --allow-empty -m "Test CI/CD pipeline"
   git push origin main
   ```

2. **Monitor GitHub Actions:**
   - Go to repository **Actions** tab
   - Select the latest workflow run
   - Watch the progress:
     - Server tests → ✅
     - Server lint → ✅
     - Client tests → ✅
     - Client lint → ✅
     - Client build → ✅
     - Deploy backend → ✅ (if RENDER_DEPLOY_HOOK configured)
     - Deploy frontend → ✅ (if Vercel secrets configured)

3. **Verify deployments:**
   - Check Render deployment history (new deployment should appear)
   - Check Vercel deployments tab (new deployment should appear)
   - Visit deployed URLs to confirm they're running

## Troubleshooting secrets

### Deployment job skipped
- Check if secret is configured (name must match exactly)
- Common typo: `VERCEL_ORG_ID` vs `VERCEL_ORGID`
- Secret names are case-sensitive

### Deployment fails with "Invalid token"
- Verify token hasn't expired
- Generate a new Render Deploy Hook or Vercel token
- Update the GitHub secret

### 404 or "Project not found"
- Verify `VERCEL_PROJECT_ID` is correct
- Verify `VERCEL_ORG_ID` matches the project's organization
- Check Vercel dashboard to confirm project still exists

### CORS errors after deployment
- Not related to secrets
- Check backend CORS configuration in `server/src/app.js`
- Ensure `FRONTEND_URL` is correctly set in backend

## Security best practices

1. **Token expiration:**
   - Set expiration on Vercel tokens (1 year recommended)
   - Set reminder to rotate tokens before expiration

2. **Scope:**
   - Use personal access tokens only (not API keys with unlimited scope)
   - Restrict token permissions if possible

3. **Rotation:**
   - Rotate tokens yearly or if compromised
   - Never commit secrets to Git (use .gitignore for .env files)

4. **Audit:**
   - Regularly check GitHub Actions logs for failed deployments
   - Monitor Render/Vercel for unexpected deployments

