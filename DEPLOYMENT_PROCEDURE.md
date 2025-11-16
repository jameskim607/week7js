# Deployment Procedure

This document provides a concise deployment and rollback procedure for the Bug Tracker application.

## CI/CD Pipeline Overview

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
1. Runs server and client tests on push/PR
2. Runs linting checks (non-blocking)
3. Builds the client application
4. **On successful push to `main`:** Automatically deploys backend to Render and frontend to Vercel

### Enabling automated deployment

To enable automatic deployment, configure these GitHub repository secrets in **Settings → Secrets and variables → Actions**:

**Backend (Render):**
- `RENDER_DEPLOY_HOOK` - Webhook URL from Render dashboard
  - Get from Render service → Settings → Deploy Hook

**Frontend (Vercel):**
- `VERCEL_TOKEN` - Personal access token
  - Create at: https://vercel.com/account/tokens
- `VERCEL_PROJECT_ID` - Frontend project ID
  - Found in Vercel project settings or project URL
- `VERCEL_ORG_ID` - Vercel organization ID
  - Found in account settings

## Pre-deployment checks

1. **Ensure all CI checks pass**
   - GitHub Actions workflow completes successfully (tests, lint, build)
   - No failing tests or critical linting errors
   - Check PR/commit status before merging to `main`

2. **Verify environment variables**
   - Backend: `MONGODB_URI`, `SENTRY_DSN`, `PORT`, `NODE_ENV`, `FRONTEND_URL`
   - Frontend: `REACT_APP_API_URL`, `REACT_APP_SENTRY_DSN`
   - Verify values are correct for target environment (production/staging)

3. **Database readiness**
   - MongoDB Atlas connection is active
   - User credentials are valid
   - Network access is configured (IP whitelist)

4. **Smoke test locally (optional)**
   ```bash
   npm run build  # in client/
   npm test       # in both client/ and server/
   ```

## Manual Deployment

### Frontend (Vercel)

**Option 1: Automatic deployment (recommended)**
- Merge PR to `main` branch
- GitHub Actions workflow runs tests
- Vercel auto-deploys on successful tests

**Option 2: Manual deployment via Vercel Dashboard**
1. Log in to Vercel
2. Select `bug-tracker` project
3. Click **Deployments** → **Redeploy**
4. Select the commit to deploy
5. Click **Redeploy**

**Option 3: Using Vercel CLI**
```bash
npm install -g vercel
vercel --prod --token=<VERCEL_TOKEN>
```

### Backend (Render)

**Option 1: Automatic deployment (recommended)**
- Merge PR to `main` branch
- GitHub Actions workflow runs tests
- Render auto-deploys on successful tests

**Option 2: Manual deployment via Render Dashboard**
1. Log in to Render
2. Select `testing-and-debugging-ensuring-mern-app-*` service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for build and deployment to complete
5. Verify `/health` endpoint returns 200 OK

**Option 3: Using Render Deploy Hook**
```bash
curl -X POST <RENDER_DEPLOY_HOOK>
```

## Post-deployment verification

### Frontend verification
1. Visit deployed URL: https://testing-and-debugging-ensuring-mern-chi.vercel.app/
2. Perform smoke tests:
   - Page loads without errors
   - Can fetch and display bugs
   - Create/read/update/delete operations work
3. Check browser console for JS errors
4. Check Sentry dashboard for new errors

### Backend verification
1. Check health endpoint: `GET /health`
   ```bash
   curl https://testing-and-debugging-ensuring-mern-app-7nlu.onrender.com/health
   ```
   Expected response: `{ "status": "OK", "message": "Bug Tracker API is running", "timestamp": "..." }`

2. Test API endpoints:
   ```bash
   curl https://testing-and-debugging-ensuring-mern-app-7nlu.onrender.com/api/bugs
   ```
   Should return bug list (may be empty array if no bugs)

3. Check logs in Render dashboard for errors
4. Check Sentry for new errors
5. Verify MongoDB connection in logs

### Integration verification
1. Open frontend URL
2. Verify API calls reach backend (check browser Network tab)
3. Verify response times are acceptable
4. Check that Sentry captures any errors

## Rollback procedures

### Rollback Frontend (Vercel)

**Quick rollback:**
1. Log in to Vercel dashboard
2. Select `bug-tracker` project
3. Go to **Deployments** tab
4. Find the previous stable deployment
5. Click **...** → **Promote to Production**
6. Confirm rollback

**From CLI:**
```bash
vercel rollback --prod --token=<VERCEL_TOKEN>
```

### Rollback Backend (Render)

**Quick rollback:**
1. Log in to Render dashboard
2. Select service
3. Go to **Deployments** tab
4. Find the previous stable build
5. Click the build ID and select **Redeploy**

**From webhook:**
```bash
# Redeploy previous commit (requires manual ID)
curl -X POST <RENDER_DEPLOY_HOOK>
```

### Rollback Database (if needed)

**If database data is corrupted or migrations are bad:**

1. **Identify the issue** from logs/Sentry
2. **Determine rollback point** (when did data get corrupted?)
3. **Restore from MongoDB backup:**
   - Go to MongoDB Atlas dashboard
   - Select cluster
   - Click **Backup** → find restore point
   - Restore to specific point-in-time
   - Update connection string if necessary

4. **Test restored data** before resuming traffic

**Note:** Point-in-time recovery may take 5-30 minutes.

## Partial rollback strategy

If only frontend OR backend has issues:

### Frontend issue → Rollback only frontend
1. Use Vercel rollback (see above)
2. Backend continues running unchanged
3. Monitor Sentry and logs

### Backend issue → Rollback only backend
1. Use Render rollback (see above)
2. Frontend continues running unchanged
3. May need to handle API errors gracefully in frontend

## Emergency rollback (complete outage)

If both frontend and backend fail:

1. **Immediate action:**
   - Rollback frontend (Vercel)
   - Rollback backend (Render)
   - Verify `/health` endpoint recovers

2. **Investigation:**
   - Check GitHub Actions logs for deployment issues
   - Check Sentry for application errors
   - Check Render/Vercel deployment logs

3. **Prevention:**
   - Review changes that caused the issue
   - Add tests to catch similar issues
   - Use staging environment to test before production

## Deployment checklist

- [ ] All tests pass locally and in CI
- [ ] No linting errors (warnings allowed)
- [ ] Environment variables are set correctly
- [ ] Database connection is verified
- [ ] MongoDB backups are recent
- [ ] Sentry project DSNs are configured
- [ ] Staging environment tested (optional but recommended)
- [ ] Team notified of deployment window
- [ ] Deployment initiated (automatic or manual)
- [ ] Health endpoints return 200
- [ ] Smoke tests pass (create/read/update/delete)
- [ ] No new errors in Sentry/logs
- [ ] Response times are acceptable
- [ ] Document deployment date/time in team channel

## Troubleshooting

### Deployment fails in CI
- Check GitHub Actions logs for errors
- Verify environment variables in secrets
- Ensure all dependencies install correctly
- Run tests locally to reproduce

### Backend won't start
- Check MongoDB connection string in logs
- Verify network access is allowed for your IP in MongoDB Atlas
- Check that port 5000 is not in use
- Review recent dependency changes

### Frontend blank page / 404
- Check browser console for JS errors
- Verify `REACT_APP_API_URL` environment variable
- Check that API is reachable from frontend
- Review CORS settings in backend

### API errors / 5xx responses
- Check backend logs in Render
- Review recent code changes
- Verify database queries
- Check Sentry for stack traces

### Database issues after deployment
- Check recent migrations
- Verify indexes are created
- Consider rolling back if data is corrupted
- Restore from backup if necessary

