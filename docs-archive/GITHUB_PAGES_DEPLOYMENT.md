# GitHub Pages Manual Deployment Guide

This guide provides step-by-step instructions for manually deploying the Paradigm Studios frontend to GitHub Pages without using automated agents or CI/CD pipelines.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Local Configuration Verification](#local-configuration-verification)
4. [Building the Application](#building-the-application)
5. [Manual Deployment Steps](#manual-deployment-steps)
6. [Verification and Testing](#verification-and-testing)
7. [Troubleshooting](#troubleshooting)
8. [Updating the Deployment](#updating-the-deployment)

---

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js (verify with `npm --version`)
- **Git**: Installed and configured ([Download](https://git-scm.com/))
- **GitHub Account**: With access to the repository

### Required Knowledge
- Basic command line/terminal usage
- Basic Git commands (clone, add, commit, push)
- Understanding of your GitHub repository structure

### Repository Access
- Write access to the GitHub repository
- Ability to push to the repository

---

## GitHub Repository Setup

### 1. Verify Repository Structure

Ensure your repository has the following structure:

```
pstudios/
├── pstudios-landingpage/     # Frontend React app
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/                  # Backend API (not deployed to GitHub Pages)
└── README.md
```

### 2. Check GitHub Pages Settings

1. Go to your GitHub repository on GitHub.com
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
5. Click **Save**

**Note**: If the `gh-pages` branch doesn't exist yet, it will be created during deployment.

### 3. Verify Custom Domain (If Applicable)

If you're using a custom domain (e.g., `www.paradigmstudios.art`):

1. In the **Pages** settings, enter your custom domain
2. Add a `CNAME` file to the `pstudios-landingpage/public/` directory with your domain:
   ```
   www.paradigmstudios.art
   ```
3. Configure DNS records with your domain provider (see DNS Configuration section)

---

## Local Configuration Verification

### 1. Verify package.json Configuration

Open `pstudios-landingpage/package.json` and verify:

```json
{
  "homepage": "https://www.paradigmstudios.art",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  "devDependencies": {
    "gh-pages": "^6.3.0"
  }
}
```

**Important Points:**
- `homepage` should match your GitHub Pages URL or custom domain
- `gh-pages` package must be in `devDependencies`
- `predeploy` script runs `build` automatically before deployment

### 2. Verify API Configuration

Check `pstudios-landingpage/src/config/api.js`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.paradigmstudios.art'  // Your production API URL
  : process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

**Ensure:**
- Production API URL is correct and uses HTTPS
- API server is running and accessible
- CORS is configured on the backend to allow your GitHub Pages domain

### 3. Verify CNAME File (If Using Custom Domain)

If using a custom domain, ensure `pstudios-landingpage/public/CNAME` exists:

```
www.paradigmstudios.art
```

**Note**: Only include the domain, no `http://` or `https://` prefix.

### 4. Check Git Remote

Verify your Git remote is configured correctly:

```bash
cd pstudios-landingpage
git remote -v
```

Should show your GitHub repository URL:
```
origin  https://github.com/yourusername/pstudios.git (fetch)
origin  https://github.com/yourusername/pstudios.git (push)
```

If not configured, add it:
```bash
git remote add origin https://github.com/yourusername/pstudios.git
```

---

## Building the Application

### 1. Navigate to Frontend Directory

```bash
cd pstudios-landingpage
```

### 2. Install Dependencies

```bash
npm install
```

**First time only** or after `package.json` changes. This installs:
- React and dependencies
- `gh-pages` deployment package
- All required npm packages

### 3. Test Build Locally (Recommended)

Before deploying, test the build locally:

```bash
# Build the application
npm run build
```

**Expected Output:**
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:
  ...
```

**Verify Build:**
```bash
# Serve the build locally
npx serve -s build
```

Open `http://localhost:3000` (or the port shown) and verify:
- Site loads correctly
- All pages work
- API calls work (check browser console)
- No console errors
- Images and fonts load

**If build fails:**
- Check for TypeScript/JavaScript errors
- Verify all dependencies are installed
- Review error messages and fix issues
- Do not proceed until build succeeds

### 4. Clean Previous Build (Optional)

If you want a fresh build:

```bash
# Remove old build directory
rm -rf build

# Rebuild
npm run build
```

---

## Manual Deployment Steps

### Method 1: Using npm Script (Recommended)

This is the simplest method and uses the configured scripts:

#### Step 1: Ensure You're on Main Branch

```bash
cd pstudios-landingpage

# Check current branch
git branch

# If not on main/master, switch to it
git checkout main
# or
git checkout master
```

#### Step 2: Ensure All Changes Are Committed

```bash
# Check status
git status

# If there are uncommitted changes, commit them
git add .
git commit -m "Prepare for deployment"
```

#### Step 3: Run Deployment Command

```bash
npm run deploy
```

**What This Does:**
1. Runs `predeploy` script (builds the app)
2. Creates/updates `gh-pages` branch
3. Pushes `build/` folder contents to `gh-pages` branch
4. GitHub Pages automatically deploys from `gh-pages` branch

**Expected Output:**
```
> pstudios-landingpage@0.1.0 predeploy
> npm run build

> pstudios-landingpage@0.1.0 build
> react-scripts build

Creating an optimized production build...
Compiled successfully!

> pstudios-landingpage@0.1.0 deploy
> gh-pages -d build

Published
```

#### Step 4: Verify Deployment

Wait 1-2 minutes, then check:
- GitHub repository → **Actions** tab (if enabled)
- GitHub repository → **Settings** → **Pages** → Should show "Your site is live at..."
- Visit your site URL

---

### Method 2: Manual Git Push (Alternative)

If you prefer more control or `gh-pages` package isn't working:

#### Step 1: Build the Application

```bash
cd pstudios-landingpage
npm run build
```

#### Step 2: Create/Checkout gh-pages Branch

```bash
# Check if gh-pages branch exists
git branch -a | grep gh-pages

# If it exists, checkout
git checkout gh-pages

# If it doesn't exist, create it
git checkout --orphan gh-pages
git rm -rf .
```

#### Step 3: Copy Build Files

```bash
# Copy all files from build directory to root
cp -r build/* .

# Or on Windows (PowerShell):
# Copy-Item -Path build\* -Destination . -Recurse -Force
```

#### Step 4: Stage and Commit

```bash
# Add all files
git add .

# Commit
git commit -m "Deploy to GitHub Pages - $(date +%Y-%m-%d)"
```

#### Step 5: Push to GitHub

```bash
# Push to gh-pages branch
git push origin gh-pages

# If first time, set upstream
git push -u origin gh-pages
```

#### Step 6: Return to Main Branch

```bash
git checkout main
# or
git checkout master
```

---

## Verification and Testing

### 1. Check GitHub Pages Status

1. Go to your repository on GitHub.com
2. **Settings** → **Pages**
3. Verify:
   - Source: `gh-pages` branch
   - Status: "Your site is live at..."
   - Custom domain (if configured): Shows your domain

### 2. Test the Live Site

Visit your site URL:
- Default: `https://yourusername.github.io/pstudios/`
- Custom domain: `https://www.paradigmstudios.art`

**Check:**
- ✅ Site loads without errors
- ✅ All pages are accessible
- ✅ Navigation works
- ✅ Images and fonts load
- ✅ API calls work (check browser console)
- ✅ Admin panel login works (if applicable)
- ✅ No 404 errors

### 3. Browser Console Check

Open browser DevTools (F12) → **Console** tab:

**Should See:**
- No red errors
- API calls succeeding (200 status)
- No CORS errors

**Should NOT See:**
- 404 errors for assets
- CORS errors
- Network errors
- JavaScript errors

### 4. Network Tab Verification

DevTools → **Network** tab → Hard refresh (Ctrl+Shift+R):

**Verify:**
- All assets load (200 status)
- Fonts load correctly
- API endpoints respond
- No failed requests

### 5. Test Different Pages

Navigate through your site:
- Home page
- About page
- Portfolio page
- Contact page
- Admin panel (if applicable)

**Verify:**
- All routes work
- No blank pages
- Content displays correctly
- Links work

### 6. Mobile Responsiveness

Test on mobile device or browser DevTools mobile view:
- Site is responsive
- Navigation works
- Images scale correctly
- Text is readable

---

## Troubleshooting

### Issue: Build Fails

**Symptoms:**
- `npm run build` shows errors
- Compilation fails

**Solutions:**

1. **Check for Syntax Errors:**
   ```bash
   npm start  # Test in development mode first
   ```

2. **Clear Cache:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm run build
   ```

3. **Check Node Version:**
   ```bash
   node --version  # Should be 18+
   ```

4. **Review Error Messages:**
   - Fix any TypeScript/JavaScript errors
   - Check for missing dependencies
   - Verify import paths

### Issue: Deployment Command Fails

**Symptoms:**
- `npm run deploy` fails
- `gh-pages` command not found

**Solutions:**

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Check Git Authentication:**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Verify Git Remote:**
   ```bash
   git remote -v
   ```

4. **Check GitHub Access:**
   - Ensure you have push access to the repository
   - Verify GitHub credentials are configured

### Issue: Site Shows 404 or Blank Page

**Symptoms:**
- Site URL shows 404
- Blank white page
- "Page not found" error

**Solutions:**

1. **Check GitHub Pages Settings:**
   - Repository → Settings → Pages
   - Source should be `gh-pages` branch
   - Wait 5-10 minutes after deployment

2. **Verify Build Output:**
   ```bash
   ls -la build/  # Should see index.html
   ```

3. **Check homepage in package.json:**
   ```json
   "homepage": "https://www.paradigmstudios.art"
   ```
   Should match your actual domain or GitHub Pages URL

4. **Verify CNAME File (if using custom domain):**
   ```bash
   cat public/CNAME
   ```
   Should contain your domain only

### Issue: API Calls Fail (CORS Errors)

**Symptoms:**
- Browser console shows CORS errors
- API requests fail
- Network tab shows blocked requests

**Solutions:**

1. **Verify API Configuration:**
   ```javascript
   // src/config/api.js
   const API_BASE_URL = process.env.NODE_ENV === 'production'
     ? 'https://api.paradigmstudios.art'  // Must use HTTPS
   ```

2. **Check Backend CORS Settings:**
   - Backend must allow your GitHub Pages domain
   - Verify CORS configuration includes your frontend URL

3. **Test API Directly:**
   ```bash
   curl https://api.paradigmstudios.art/api/health
   ```

### Issue: Assets Not Loading (404 for Images/Fonts)

**Symptoms:**
- Images don't display
- Fonts don't load
- 404 errors for static assets

**Solutions:**

1. **Check Asset Paths:**
   - Use `%PUBLIC_URL%` in HTML
   - Use relative paths in CSS
   - Don't use absolute paths starting with `/`

2. **Verify Build Output:**
   ```bash
   ls -la build/static/
   ```
   Should contain CSS and JS files

3. **Check homepage in package.json:**
   - If using custom domain, ensure `homepage` matches
   - If using GitHub Pages default, use repository path

### Issue: Changes Not Appearing After Deployment

**Symptoms:**
- Deployed but old version shows
- Changes not visible

**Solutions:**

1. **Hard Refresh Browser:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

2. **Clear Browser Cache:**
   - DevTools → Application → Clear Storage

3. **Check Deployment:**
   ```bash
   git log origin/gh-pages  # Verify latest commit
   ```

4. **Wait for Propagation:**
   - GitHub Pages can take 1-5 minutes to update
   - DNS changes can take up to 48 hours

### Issue: Custom Domain Not Working

**Symptoms:**
- Custom domain shows GitHub 404
- SSL certificate errors

**Solutions:**

1. **Verify CNAME File:**
   ```bash
   cat public/CNAME
   ```
   Should contain only your domain (no http:// or https://)

2. **Check DNS Configuration:**
   - Create CNAME record pointing to `yourusername.github.io`
   - Or create A records pointing to GitHub IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153

3. **Wait for DNS Propagation:**
   - Can take up to 48 hours
   - Check with: `nslookup www.paradigmstudios.art`

4. **Verify in GitHub:**
   - Repository → Settings → Pages
   - Custom domain should be listed
   - "Enforce HTTPS" should be enabled (after SSL is active)

---

## Updating the Deployment

### Regular Update Process

When you make changes to your site:

1. **Make Changes Locally:**
   ```bash
   cd pstudios-landingpage
   # Edit files, test with npm start
   ```

2. **Commit Changes:**
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Verify:**
   - Wait 1-2 minutes
   - Visit your site
   - Test changes

### Rollback to Previous Version

If you need to revert to a previous deployment:

```bash
# Check gh-pages branch history
git log origin/gh-pages

# Checkout gh-pages branch
git checkout gh-pages

# Find the commit hash you want to revert to
git log

# Reset to that commit
git reset --hard <commit-hash>

# Force push (be careful!)
git push origin gh-pages --force
```

**⚠️ Warning**: Force pushing can cause issues. Only do this if necessary.

---

## DNS Configuration (Custom Domain)

If using a custom domain (e.g., `www.paradigmstudios.art`):

### Option 1: CNAME Record (Recommended)

In your domain's DNS settings:

- **Type**: CNAME
- **Name**: `www` (or `@` for root domain)
- **Value**: `yourusername.github.io`
- **TTL**: 3600 (or default)

### Option 2: A Records

If CNAME doesn't work or for root domain:

- **Type**: A
- **Name**: `@` (or leave blank for root)
- **Value**: `185.199.108.153`
- **TTL**: 3600

Add additional A records for redundancy:
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

### Verify DNS

```bash
# Check DNS resolution
nslookup www.paradigmstudios.art
dig www.paradigmstudios.art

# Check from different locations
# Use online tools like dnschecker.org
```

---

## Best Practices

### 1. Always Test Locally First

```bash
npm run build
npx serve -s build
# Test thoroughly before deploying
```

### 2. Commit Before Deploying

Always commit your changes to the main branch before deploying:

```bash
git add .
git commit -m "Description of changes"
git push origin main
npm run deploy
```

### 3. Keep Dependencies Updated

Regularly update dependencies:

```bash
npm outdated
npm update
npm audit fix
```

### 4. Monitor Deployment

- Check GitHub repository after deployment
- Monitor site uptime
- Set up error tracking (if applicable)

### 5. Backup Before Major Changes

Before major updates:

```bash
# Create a backup branch
git checkout -b backup-$(date +%Y%m%d)
git push origin backup-$(date +%Y%m%d)
git checkout main
```

---

## Quick Reference Commands

```bash
# Navigate to frontend
cd pstudios-landingpage

# Install dependencies
npm install

# Build locally
npm run build

# Test build locally
npx serve -s build

# Deploy to GitHub Pages
npm run deploy

# Check deployment status
git log origin/gh-pages

# View current branch
git branch

# Check for uncommitted changes
git status
```

---

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/#github-pages)
- [gh-pages Package](https://github.com/tschaub/gh-pages)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## Support

If you encounter issues not covered in this guide:

1. Check the [DEVELOPMENT_HISTORY.md](./DEVELOPMENT_HISTORY.md) for known issues
2. Review GitHub repository issues
3. Check browser console for errors
4. Verify all prerequisites are met
5. Test with a fresh clone of the repository

---

**Last Updated**: 2025-01-13

**Maintained By**: Paradigm Studios Development Team

































