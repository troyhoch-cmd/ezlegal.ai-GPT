# Development Environment URL Setup Guide

## Sharing the ezLegal.ai Development Build with Internal Team

**Purpose:** This guide provides instructions for creating shareable development/staging URLs for internal team review and collaboration.

---

## Option 1: Vercel Deployment (Recommended)

Vercel provides instant preview deployments with unique URLs for each build.

### Setup Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login to Vercel
   vercel login

   # Link project (run in project root)
   vercel link
   ```

2. **Configure Environment Variables**

   In Vercel Dashboard, add these environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. **Deploy Preview**
   ```bash
   # Deploy to preview URL (not production)
   vercel
   ```

4. **Share the Generated URL**

   Vercel will generate a URL like:
   ```
   https://ezlegal-ai-[random-hash].vercel.app
   ```

### Vercel Configuration File

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## Option 2: Netlify Deployment

Netlify offers similar preview deployment capabilities.

### Setup Steps

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Initialize Project**
   ```bash
   netlify init
   ```

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Deploy Draft**
   ```bash
   # Build and deploy to unique preview URL
   netlify deploy
   ```

5. **Share Draft URL**

   Netlify generates URLs like:
   ```
   https://[random-hash]--ezlegal-ai.netlify.app
   ```

### Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## Option 3: Cloudflare Pages

Free tier with excellent performance.

### Setup Steps

1. **Connect to Cloudflare Pages**
   - Go to Cloudflare Dashboard > Pages
   - Create a project
   - Connect your Git repository

2. **Configure Build Settings**
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`

3. **Add Environment Variables**
   - Add Supabase credentials in Settings > Environment variables

4. **Preview URLs**

   Each branch/commit gets a unique URL:
   ```
   https://[commit-hash].ezlegal-ai.pages.dev
   ```

---

## Option 4: Manual Staging Server

For teams requiring private infrastructure.

### Using nginx on a Staging Server

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Copy dist/ to Server**
   ```bash
   scp -r dist/* user@staging.internal.ezlegal.ai:/var/www/staging/
   ```

3. **nginx Configuration**
   ```nginx
   server {
       listen 443 ssl;
       server_name staging.internal.ezlegal.ai;

       root /var/www/staging;
       index index.html;

       # Handle SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Basic auth for internal access
       auth_basic "Development Access";
       auth_basic_user_file /etc/nginx/.htpasswd;

       ssl_certificate /etc/ssl/certs/staging.crt;
       ssl_certificate_key /etc/ssl/private/staging.key;
   }
   ```

4. **Create Password File**
   ```bash
   htpasswd -c /etc/nginx/.htpasswd devteam
   ```

---

## Environment-Specific Configuration

### Development vs Staging vs Production

The application detects environments via the tenant configuration system:

```typescript
// src/lib/tenant-config.ts
// Automatically detects based on hostname

// Development: localhost
// Staging: staging.ezlegal.ai or *.vercel.app
// Production: ezlegal.ai
```

### Environment Variables by Stage

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `VITE_SUPABASE_URL` | Dev project | Staging project | Prod project |
| `VITE_SUPABASE_ANON_KEY` | Dev key | Staging key | Prod key |

---

## Access Control for Preview URLs

### Option A: Vercel Password Protection (Team Plan)

```json
// vercel.json
{
  "passwordProtection": {
    "paths": ["/*"]
  }
}
```

### Option B: Netlify Identity

Enable Netlify Identity in site settings for user-based access control.

### Option C: Cloudflare Access

Configure Zero Trust policies to restrict preview access to team members.

---

## Sharing URLs with Team

### Recommended Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-dashboard
   ```

2. **Push to Trigger Preview**
   ```bash
   git push origin feature/new-dashboard
   ```

3. **Share Preview URL**

   Copy the automatically generated preview URL from:
   - Vercel: Deployments tab in dashboard
   - Netlify: Deploys section
   - Cloudflare: Deployments in Pages

4. **Include in PR/Review**

   Add preview URL to pull request description:
   ```markdown
   ## Preview

   - Preview URL: https://ezlegal-ai-abc123.vercel.app
   - Testing credentials: dev@ezlegal.ai / testpass123
   ```

---

## Current Development Build

To generate a local build for sharing:

```bash
# Ensure dependencies are installed
npm install

# Build the production bundle
npm run build

# Preview locally before sharing
npm run preview
```

The build output in `dist/` can be uploaded to any static hosting service.

---

## Security Considerations

1. **Never share production credentials** in preview environments
2. **Use separate Supabase projects** for staging vs production
3. **Enable password protection** on all preview URLs
4. **Rotate credentials** after development team changes
5. **Monitor preview deployments** for unauthorized access

---

## Quick Reference

| Platform | Free Tier | Preview URLs | Password Protection |
|----------|-----------|--------------|---------------------|
| Vercel | Yes | Automatic | Team plan |
| Netlify | Yes | Automatic | Netlify Identity |
| Cloudflare Pages | Yes | Automatic | Cloudflare Access |
| Manual nginx | N/A | Manual | htpasswd |

---

## Support

For deployment issues, contact the development team or refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
