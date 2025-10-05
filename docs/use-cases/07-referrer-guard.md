# Referrer Guard - Use Cases & Documentation

## Overview

The Referrer Guard system restricts access to campaign and card pages, ensuring users only access them through the official URL shortener (`https://comoor.pse.is/`). This maintains proper campaign tracking and user flow control.

## How It Works

### Technical Implementation

1. **Validation Process**:
   - When a user visits `card.html` or `campaign.html`, `referrer-guard.js` executes immediately
   - Checks `document.referrer` to see where the user came from
   - If referrer starts with `https://comoor.pse.is/`, access is granted
   - If referrer is missing or invalid, shows error overlay and blocks page functionality

2. **Error Display**:
   - Full-screen overlay with clear messaging in Chinese
   - "無法直接存取此頁面" (Cannot access this page directly)
   - Provides link to official URL shortener
   - Debug info shown when `debugMode: true`

3. **Global Flag**:
   - Sets `window.REFERRER_ACCESS_GRANTED = true/false`
   - Other scripts can check this flag to conditionally enable features

## Use Cases

### Use Case 1: Normal Campaign Flow ✅

**Scenario**: User receives official campaign link

**Steps**:
1. User receives: `https://comoor.pse.is/ABC123`
2. Clicks link → redirects to `card.html` or `campaign.html`
3. Referrer Guard validates: `document.referrer === 'https://comoor.pse.is/...'`
4. ✅ Access granted → page loads normally

**Result**: User sees card/campaign page as intended

---

### Use Case 2: Direct Access (Blocked) 🚫

**Scenario**: User tries to access page directly

**Steps**:
1. User types URL directly: `https://yoursite.com/card.html`
2. No referrer present (`document.referrer === ''`)
3. Referrer Guard validates: fails
4. ❌ Access denied → error overlay shown

**Result**: User sees error message with link to official entry point

---

### Use Case 3: Access from Other Websites (Blocked) 🚫

**Scenario**: User clicks link from unauthorized website

**Steps**:
1. User on `https://example.com` clicks link to `card.html`
2. Referrer is `https://example.com`
3. Referrer Guard validates: referrer doesn't start with `https://comoor.pse.is/`
4. ❌ Access denied → error overlay shown

**Result**: Only links from official URL shortener work

---

### Use Case 4: Development/Testing Mode 🔧

**Scenario**: Developer needs to test pages locally

**Steps**:
1. Developer accesses: `https://yoursite.com/card.html?bypass=true`
2. Referrer Guard detects `bypass` parameter
3. ✅ Access granted (bypass mode)
4. Console logs: "🔓 Referrer Guard: Bypass mode active"

**Result**: Developer can test without referrer restriction

**Testing URL Examples**:
```
https://yoursite.com/card.html?bypass=true
https://yoursite.com/campaign.html?bypass=true
https://yoursite.com/card.html?bypass=true&dev=true  # Multiple params
```

---

### Use Case 5: Privacy Browser/Extensions (Blocked) 🚫

**Scenario**: User with privacy extensions that block referrers

**Steps**:
1. User clicks official link: `https://comoor.pse.is/ABC123`
2. Privacy extension strips referrer header
3. Page loads but `document.referrer === ''`
4. ❌ Access denied → error overlay shown

**Result**: Legitimate user blocked (limitation of client-side validation)

**Mitigation**:
- Instruct users to temporarily disable referrer blocking for comoor.pse.is
- Or use bypass link for legitimate users having issues

---

### Use Case 6: Social Media/Email Clients 🔄

**Scenario**: User clicks link from email or social media app

**Steps**:
1. User clicks link in Gmail/WeChat/Line
2. App's internal browser may or may not preserve referrer
3. Results vary by platform:
   - **Most desktop email clients**: ✅ Referrer preserved → Access granted
   - **Some mobile apps**: ❌ Referrer stripped → Access denied
   - **Instagram/Facebook in-app browser**: 🔄 Mixed results

**Result**: Inconsistent behavior across platforms

**Mitigation**: Provide bypass links for known problematic platforms

---

### Use Case 7: Bookmarked Page (Blocked) 🚫

**Scenario**: User bookmarks page and returns later

**Steps**:
1. User successfully accesses `card.html` via official link
2. Bookmarks the page
3. Returns later, opens bookmark
4. No referrer present (direct access from bookmark)
5. ❌ Access denied → error overlay shown

**Result**: Bookmarks don't work (intentional to maintain flow control)

---

### Use Case 8: QR Code Scanning ✅

**Scenario**: QR code contains official URL shortener link

**Steps**:
1. QR code contains: `https://comoor.pse.is/QR001`
2. User scans with camera → opens in browser
3. URL shortener redirects to `card.html`
4. Referrer is `https://comoor.pse.is/...`
5. ✅ Access granted → page loads

**Result**: QR codes work as long as they point to official URL shortener

---

### Use Case 9: SEO/Search Engine Crawlers 🔄

**Scenario**: Google bot tries to index pages

**Steps**:
1. Google crawler discovers `card.html` URL
2. Attempts to crawl page
3. No referrer or different referrer
4. ❌ Access denied → error overlay HTML indexed

**Result**: Pages won't be properly indexed by search engines

**Note**: This is intentional if you want pages to be non-discoverable. If SEO is needed, whitelist bot user agents.

---

## Configuration

### File: `js/referrer-guard.js`

```javascript
const REFERRER_GUARD_CONFIG = {
    allowedReferrer: 'https://comoor.pse.is/',  // Required referrer prefix
    bypassParam: 'bypass',                       // URL param to bypass check
    debugMode: true,                             // Show debug info in console
    errorDisplayDelay: 100                       // Delay before showing error (ms)
};
```

### Customization Options

1. **Change Allowed Referrer**:
   ```javascript
   allowedReferrer: 'https://yourshortener.com/'
   ```

2. **Disable Debug Mode** (production):
   ```javascript
   debugMode: false  // Hides debug info from users
   ```

3. **Custom Bypass Parameter**:
   ```javascript
   bypassParam: 'admin'  // Use ?admin=true instead
   ```

4. **Allow Multiple Referrers**:
   Edit the `validateReferrer()` function:
   ```javascript
   const allowedReferrers = [
       'https://comoor.pse.is/',
       'https://backup.shortener.com/'
   ];
   const isValid = allowedReferrers.some(ref => this.referrer.startsWith(ref));
   ```

---

## Testing Guide

### Local Testing

1. **Test Blocked Access**:
   - Open `http://localhost:8000/card.html` directly
   - Should see error overlay

2. **Test Bypass Mode**:
   - Open `http://localhost:8000/card.html?bypass=true`
   - Should load normally with console log

3. **Test Simulated Referrer** (Chrome DevTools):
   ```javascript
   // In Console, override referrer (advanced)
   Object.defineProperty(document, 'referrer', {
       get: () => 'https://comoor.pse.is/test'
   });
   location.reload();
   ```

### Production Testing

1. **Create Test Short Links**:
   - Create test short link: `https://comoor.pse.is/test123`
   - Point to your pages
   - Click and verify access granted

2. **Test Direct Access**:
   - Share full URL directly: `https://yoursite.com/card.html`
   - Verify error overlay appears

3. **Test Different Platforms**:
   - Email clients (Gmail, Outlook)
   - Social media (Facebook, Instagram, Line, WeChat)
   - QR codes
   - Different browsers

---

## Troubleshooting

### Issue: Legitimate users seeing error

**Causes**:
- Privacy browser/extension blocking referrer
- Mobile app stripping referrer
- Corporate firewall/proxy

**Solutions**:
1. Provide bypass link: `?bypass=true`
2. Whitelist specific user agents
3. Check URL shortener configuration
4. Verify HTTPS (HTTP→HTTPS loses referrer)

### Issue: Guard not working (access allowed when it shouldn't be)

**Checks**:
1. Verify `referrer-guard.js` is loaded before other scripts
2. Check browser console for errors
3. Confirm `REFERRER_ACCESS_GRANTED` flag in console
4. Ensure no browser extensions interfering

### Issue: Error overlay not appearing

**Checks**:
1. JavaScript errors in console?
2. CSS conflicts with existing styles?
3. Check z-index value (should be 999999)
4. Verify `errorDisplayDelay` not too long

---

## Security Considerations

⚠️ **Important Limitations**:

1. **Client-side only** - Can be bypassed by:
   - Disabling JavaScript
   - Modifying browser headers
   - Using developer tools
   - Decompiling and modifying code

2. **Not suitable for**:
   - Protecting sensitive data
   - Authentication/authorization
   - Preventing determined attackers
   - DRM or content protection

3. **Appropriate for**:
   - Campaign flow control
   - User experience guidance
   - Analytics/tracking integrity
   - Reducing casual unauthorized access

**Recommendation**: Use this for user flow control, not security. For real access control, implement server-side validation.

---

## Integration with Existing Code

### Checking Access Status in Your Scripts

```javascript
// Wait for guard to initialize
window.addEventListener('load', () => {
    if (window.REFERRER_ACCESS_GRANTED) {
        // Access granted - run your code
        initializeCard();
    } else {
        // Access denied - guard is showing error
        console.log('Access denied by referrer guard');
    }
});
```

### Conditional Feature Enabling

```javascript
// Only enable features if access granted
if (window.REFERRER_ACCESS_GRANTED) {
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);
} else {
    document.getElementById('submitBtn').disabled = true;
}
```

---

## URL Shortener Setup

### Setting Up comoor.pse.is

1. **Configure Short Links**:
   - Create campaign-specific short links
   - Point to: `https://yoursite.com/card.html`
   - Ensure HTTPS is used (preserves referrer)

2. **Testing Configuration**:
   - Verify redirect preserves referrer
   - Some URL shorteners have options to strip referrers (disable this)

3. **Tracking Integration**:
   - URL shortener analytics + referrer validation = complete tracking
   - Both systems confirm user followed proper flow

### Alternative URL Shorteners

If switching from pse.is, update configuration:
```javascript
allowedReferrer: 'https://bit.ly/'        // Bitly
allowedReferrer: 'https://tinyurl.com/'   // TinyURL
allowedReferrer: 'https://go.comoor.com/' // Custom domain
```

---

## Analytics & Monitoring

### Key Metrics to Track

1. **Access Denials**:
   - Monitor how many users hit error overlay
   - Indicates direct access attempts or referrer issues

2. **Bypass Usage**:
   - Track `?bypass=true` usage
   - Should only be developers/support

3. **Platform Performance**:
   - Which platforms (email/social) have highest failure rates
   - Adjust strategy accordingly

### Adding Analytics

```javascript
// In referrer-guard.js, add to showAccessDenied()
if (window.gtag) {
    gtag('event', 'referrer_guard_blocked', {
        'referrer': this.referrer || 'none',
        'page': window.location.pathname
    });
}
```

---

## FAQ

**Q: Can users bypass this?**
A: Yes, technical users can bypass client-side validation. This is for flow control, not security.

**Q: Will this affect SEO?**
A: Yes, search engines will be blocked. Intentional for non-public campaign pages.

**Q: What if URL shortener goes down?**
A: Users can use `?bypass=true` temporarily, or deploy without referrer-guard.js.

**Q: Can I have multiple allowed domains?**
A: Yes, modify the `validateReferrer()` function to check multiple domains.

**Q: Does this work with all browsers?**
A: Yes, but some privacy-focused browsers may block referrers by default.

**Q: Should I use this for login/authentication?**
A: No! Use proper server-side authentication. This is only for user flow control.

---

## Changelog

### Version 1.0 (2025-10-05)
- Initial implementation
- Support for single allowed referrer
- Bypass mode for testing
- Debug logging
- Chinese error messaging
- Responsive error overlay
