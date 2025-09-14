# GitHub Pages Hosting Plan for @comoor/ HTML Files

## Overview
This plan outlines the steps to deploy the HTML files in the `@comoor/` directory to GitHub Pages for direct hosting and access.

## Current Files to Deploy
- `campaign.html` - Campaign form page with Chinese interface
- `card.html` - Dynamic card display page with Google Sheets integration

## Deployment Options

### Option 1: Direct GitHub Pages (Recommended)
Deploy directly from the main repository using GitHub Pages.

**Steps:**
1. **Initialize Git Repository** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Create a new repository on GitHub
   - Name it appropriately (e.g., `comoor-pages` or `aragaki`)

3. **Connect Local Repository to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

4. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / (root)
   - Save settings

5. **Access URLs**
   - `campaign.html`: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/@comoor/campaign.html`
   - `card.html`: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/@comoor/card.html`

### Option 2: Dedicated Pages Repository
Create a separate repository specifically for the @comoor pages.

**Steps:**
1. **Create New Repository**
   - Name: `comoor-pages` (or similar)
   - Initialize with README

2. **Move Files to Repository Root**
   ```bash
   mkdir comoor-pages
   cd comoor-pages
   git clone https://github.com/YOUR_USERNAME/comoor-pages.git .
   cp ../@comoor/*.html .
   ```

3. **Configure for Root Access**
   - Files will be accessible directly:
   - `campaign.html`: `https://YOUR_USERNAME.github.io/comoor-pages/campaign.html`
   - `card.html`: `https://YOUR_USERNAME.github.io/comoor-pages/card.html`

### Option 3: Custom Domain (Advanced)
Set up a custom domain for professional presentation.

**Steps:**
1. Follow Option 1 or 2 above
2. **Configure Custom Domain**
   - In repository Settings → Pages → Custom domain
   - Add your domain (e.g., `comoor.yourdomain.com`)
   - Create CNAME file in repository root with your domain

3. **DNS Configuration**
   - Create CNAME record pointing to `YOUR_USERNAME.github.io`

## File Considerations

### campaign.html
- ✅ Self-contained (all CSS/JS inline)
- ✅ No external dependencies
- ✅ Ready for deployment

### card.html
- ⚠️ **Important**: Uses Google Sheets integration
- ✅ Has fallback text if Sheets unavailable
- ✅ Uses CORS proxy for API access
- 📝 **Note**: Verify Google Sheets ID and permissions

## Pre-Deployment Checklist

- [ ] Test both HTML files locally
- [ ] Verify Google Sheets integration in card.html
- [ ] Check that all inline resources load correctly
- [ ] Ensure no sensitive data in files
- [ ] Test responsive design on mobile devices

## Post-Deployment Steps

1. **Test Live URLs**
   - Verify both pages load correctly
   - Test form submission in campaign.html
   - Test card generation and Google Sheets integration in card.html

2. **Performance Optimization**
   - Consider enabling GitHub Pages caching headers
   - Monitor loading times

3. **Maintenance**
   - Update Google Sheets data as needed
   - Monitor for any external service changes (CORS proxy)

## Security Considerations

- ✅ No server-side code (static files only)
- ✅ No sensitive credentials in files
- ⚠️ Google Sheets ID is visible in card.html (ensure sheet permissions are appropriate)
- ✅ Form in campaign.html only shows alert (no data transmission)

## Estimated Timeline
- **Option 1**: 15-30 minutes
- **Option 2**: 30-45 minutes  
- **Option 3**: 1-2 hours (depending on domain setup)

## Next Steps
1. Choose deployment option (recommend Option 1 for simplicity)
2. Create/configure GitHub repository
3. Deploy files and test
4. Share live URLs

## Support Resources
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)