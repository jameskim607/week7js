# Staging Environment Setup

This document outlines how to configure and deploy a staging environment for the Bug Tracker application on Render and Vercel.

## Overview
Staging provides a production-like environment for testing before deploying to production. This setup allows parallel production and staging deployments.

## Backend Staging (Render)

### 1. Create a new Render service for staging
- Log in to Render dashboard
- Create a new "Web Service"
- Name it: `bug-tracker-staging` (or similar)
- Connect it to the same GitHub repository
- Set branch to `main` (same as production, or use a `develop` branch if preferred)

### 2. Configure staging environment variables
In Render dashboard for the staging service, set:
```
NODE_ENV=production
MONGODB_URI=<staging-mongodb-uri>
PORT=5000
SENTRY_DSN=<sentry-staging-dsn>
FRONTEND_URL=https://bug-tracker-staging.vercel.app
```

Ensure the staging MongoDB URI points to a separate staging database (create a new cluster or database name in MongoDB Atlas).

### 3. Disable auto-deploy for staging (optional)
To prevent staging from auto-deploying on every push, you can:
- Create a separate `staging` branch and configure the Render service to deploy from it
- Or manually trigger deployments via Render dashboard / GitHub Actions

## Frontend Staging (Vercel)

### 1. Create a new Vercel project for staging
- Log in to Vercel dashboard
- Import the same GitHub repository
- Create a new project named `bug-tracker-staging` (or similar)
- Configure it for the `main` branch (or create a separate `staging` branch)

### 2. Configure staging environment variables
In Vercel project settings, set:
```
REACT_APP_API_URL=https://bug-tracker-staging.onrender.com/api
REACT_APP_SENTRY_DSN=<sentry-staging-dsn>
```

### 3. Set up preview deployments (optional)
- Enable preview deployments on pull requests so reviewers can test changes before merge
- This is enabled by default in Vercel and useful for PR testing

## Staging Deployment Workflow

### Manual deployment to staging
1. Ensure all changes are on the `main` (or designated `staging`) branch
2. Push changes to GitHub
3. Either:
   - Wait for auto-deployment (if enabled), or
   - Manually trigger deployment via Render/Vercel dashboard

### Testing in staging
1. Visit https://bug-tracker-staging.vercel.app (frontend)
2. Perform smoke tests:
   - Create a new bug
   - Update bug status
   - Delete a bug
   - Verify error handling
3. Check logs in Sentry and Render/Vercel dashboards for errors
4. Test with real staging database data

### Promoting staging to production
1. When satisfied with staging, create a release tag (e.g., `v1.2.0`)
2. Verify all tests pass in CI/CD pipeline
3. Merge to `main` and push (or trigger manually)
4. Production deployment will auto-trigger (after passing tests)
5. Verify production endpoints

## Database considerations

### Separate staging database
- **Recommended:** Create a separate MongoDB Atlas database (or cluster) for staging
- Use connection string: `mongodb+srv://user:pass@staging-cluster.mongodb.net/bug-tracker-staging`
- This prevents accidental data loss or mixing with production

### Data seeding for staging
- Create a seed script to populate staging with test data
- Use: `npm run seed` (if available) or manually insert test bugs

### Database backups
- Enable MongoDB Atlas automated backups for staging as well
- Retention: 7 days (shorter than production)

## GitHub Actions CI/CD with staging

The CI/CD pipeline can be extended to deploy to both staging and production:

### Staging deployment trigger
- Merge to `main` → auto-deploy to staging
- Create git tag `v*.*.*` → auto-deploy to production

Or use branch-based strategy:
- Push to `develop` → deploy to staging
- Push to `main` → deploy to production

## Monitoring and alerts for staging

Configure Sentry alerts for staging:
- Set Sentry project to `bug-tracker-staging`
- Create alerts for critical errors (same as production)
- Route staging alerts to a dedicated Slack channel or email

## Rollback from staging

If issues are found in staging:
1. **Backend:** Use Render's deployment history to revert to the previous deployment
2. **Frontend:** Use Vercel's deployment history to rollback
3. **Database:** Restore from MongoDB Atlas backup snapshots if data corruption occurred

## Example GitHub Actions for multi-environment deployment

```yaml
deploy-staging:
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to staging
      run: |
        curl -X POST ${{ secrets.RENDER_STAGING_DEPLOY_HOOK }}

deploy-production:
  if: startsWith(github.ref, 'refs/tags/v')
  runs-on: ubuntu-latest
  needs: [ deploy-staging ]
  steps:
    - name: Deploy to production
      run: |
        curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

## Secrets configuration

In GitHub repository settings, add these secrets:
- `RENDER_DEPLOY_HOOK` - Production backend deploy webhook
- `RENDER_STAGING_DEPLOY_HOOK` - Staging backend deploy webhook
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_PROJECT_ID` - Production frontend project ID
- `VERCEL_STAGING_PROJECT_ID` - Staging frontend project ID
- `VERCEL_ORG_ID` - Vercel organization ID

