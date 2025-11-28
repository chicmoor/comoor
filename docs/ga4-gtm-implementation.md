# GA4 + GTM Implementation Guide

**Technical Documentation for Developers**

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Installation](#installation)
4. [Event Tracking Reference](#event-tracking-reference)
5. [GTM Configuration](#gtm-configuration)
6. [Testing & Validation](#testing--validation)
7. [Privacy & Compliance](#privacy--compliance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required IDs

You'll need these before implementation:

1. **GTM Container ID**
   - Format: `GTM-XXXXXXX`
   - Get it from: [Google Tag Manager](https://tagmanager.google.com/)
   - Location in code: `card.html` line ~18

2. **GA4 Measurement ID**
   - Format: `G-XXXXXXXXXX`
   - Get it from: [Google Analytics](https://analytics.google.com/)
   - Configure in: GTM Configuration Tag (see GTM Configuration section)

### Account Setup

If you don't have these accounts yet:

1. **Google Tag Manager**:
   - Go to [tagmanager.google.com](https://tagmanager.google.com/)
   - Create a new account and container
   - Select "Web" as the target platform

2. **Google Analytics 4**:
   - Go to [analytics.google.com](https://analytics.google.com/)
   - Create a new GA4 property
   - Note your Measurement ID (G-XXXXXXXXXX)

---

## Architecture Overview

### Component Stack

```
┌─────────────────────────────────────────┐
│         User Visits card.html           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Cookie Consent Banner Displayed      │
│  (js/cookie-consent.js + css)           │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    [Accept]        [Decline]
         │               │
         │               └──► No tracking
         │
┌────────▼────────────────────────────────┐
│     GTM Container Loaded                │
│  (conditional on consent)               │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  dataLayer Events Pushed                │
│  (js/gtm-datalayer.js)                  │
│                                         │
│  • card.js (8 events)                   │
│  • contact-collection.js (6 events)     │
│  • access-control.js (2 events)         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│     GTM Processes Events                │
│  • Triggers fire                        │
│  • Variables resolve                    │
│  • Tags execute                         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    GA4 Receives Events                  │
│  • Real-time reports                    │
│  • Event tracking                       │
│  • User analytics                       │
└─────────────────────────────────────────┘
```

### File Structure

```
/Users/chia-weilin/Project/comoor/
├── card.html                       # Main page with GTM snippet
├── js/
│   ├── cookie-consent.js          # Cookie consent manager
│   ├── gtm-datalayer.js           # DataLayer helper utilities
│   ├── card.js                    # 8 tracking events
│   ├── contact-collection.js      # 6 tracking events
│   └── access-control.js          # 2 tracking events
├── css/
│   └── cookie-consent.css         # Cookie banner styles
└── docs/
    ├── ga4-gtm-implementation.md  # This file
    └── use-cases/
        └── 07-google-analytics-tracking.md  # Business documentation
```

---

## Installation

### Step 1: Update GTM Container ID

In `card.html` line ~18, replace the placeholder:

```javascript
// BEFORE:
window.GTM_ID = 'GTM-XXXXXXX'; // TODO: Replace with your GTM container ID

// AFTER:
window.GTM_ID = 'GTM-ABC1234'; // Your actual container ID
```

Also update line ~52 (noscript iframe):

```html
<!-- BEFORE: -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"

<!-- AFTER: -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ABC1234"
```

### Step 2: Verify File Structure

Ensure all new files are in place:

```bash
# Check if all files exist
ls js/cookie-consent.js
ls js/gtm-datalayer.js
ls css/cookie-consent.css
```

### Step 3: Test Cookie Consent

1. Open `card.html?from=picsee` in a browser
2. You should see the cookie consent banner at the bottom
3. Click "Accept" or "Decline"
4. Choice should persist on page refresh

### Step 4: Verify GTM Loading

Open browser console and check:

```javascript
// After accepting cookies, you should see:
console.log(window.dataLayer);
// Output: Array with GTM events

console.log(window.google_tag_manager);
// Output: Object (GTM is loaded)
```

---

## Event Tracking Reference

### Summary Table

| Event Name | File | Line | Priority | Description |
|------------|------|------|----------|-------------|
| `page_load_start` | card.js | 1337 | High | Page initialization |
| `card_draw_success` | card.js | 1312 | High | Card displayed successfully |
| `winner_overlay_clicked` | card.js | 1290 | High | Winner clicks prize text |
| `rate_limit_blocked` | card.js | 1397 | High | User rate limited |
| `rate_limit_allowed` | card.js | 1419 | High | User passes rate limit |
| `access_denied` | access-control.js | 212 | High | Invalid URL access |
| `access_control_validation` | access-control.js | 192 | Medium | Access validation |
| `config_load_success` | card.js | 1174 | Medium | Config loaded |
| `config_load_error` | card.js | 1193 | Medium | Config load failed |
| `initialization_error` | card.js | 1449 | Medium | App init failed |
| `contact_form_shown` | contact-collection.js | 88 | High | Winner form opened |
| `contact_form_hidden` | contact-collection.js | 109 | Medium | Winner form closed |
| `contact_form_validation_error` | contact-collection.js | 247 | Medium | Form validation failed |
| `contact_form_submission_start` | contact-collection.js | 158 | High | Form submit initiated |
| `contact_form_submission_success` | contact-collection.js | 175 | High | Form submitted |
| `contact_form_submission_error` | contact-collection.js | 197 | High | Form submit failed |

### Event Details

#### 1. page_load_start

**Trigger**: App initialization begins
**Location**: `js/card.js:1337`

**Parameters**:
```javascript
{
  dev_mode: boolean,        // Dev mode active (10s cooldown)
  sheet_id: string,         // Google Sheets ID
  timestamp: number         // Unix timestamp
}
```

**Example**:
```javascript
{
  dev_mode: false,
  sheet_id: "1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE",
  timestamp: 1730000000000
}
```

---

#### 2. card_draw_success

**Trigger**: Card successfully displayed to user
**Location**: `js/card.js:1312`

**Parameters**:
```javascript
{
  selected_image: string,           // Image filename
  selected_text_title: string,      // Card text title
  text_probability: number,         // Probability weight (0-1)
  is_winner: boolean,               // Won flag
  text_description_length: number,  // Description length
  total_available_texts: number,    // Total texts in pool
  total_available_images: number    // Total images in pool
}
```

**Example**:
```javascript
{
  selected_image: "images/backgrounds/gradient-1.svg",
  selected_text_title: "今天很開心",
  text_probability: 0.3,
  is_winner: false,
  text_description_length: 45,
  total_available_texts: 8,
  total_available_images: 5
}
```

**Use Cases**:
- Track most popular cards
- Analyze winner rate
- Monitor card distribution

---

#### 3. winner_overlay_clicked

**Trigger**: User clicks on winning card overlay
**Location**: `js/card.js:1290`

**Parameters**:
```javascript
{
  prize_title: string,        // Prize name from config
  card_title: string,         // Winning card text
  time_on_page_ms: number     // Time since page load
}
```

**Example**:
```javascript
{
  prize_title: "精美禮品",
  card_title: "抽中大獎！",
  time_on_page_ms: 2500
}
```

---

#### 4. rate_limit_blocked

**Trigger**: User is blocked by rate limiting
**Location**: `js/card.js:1397`

**Parameters**:
```javascript
{
  reason: "rate_limited",
  remaining_time_ms: number,      // Time until cooldown ends
  cooldown_end_time: number       // Unix timestamp
}
```

**Example**:
```javascript
{
  reason: "rate_limited",
  remaining_time_ms: 2400000,
  cooldown_end_time: 1730002400000
}
```

---

#### 5. rate_limit_allowed

**Trigger**: User passes rate limit check
**Location**: `js/card.js:1419`

**Parameters**:
```javascript
{
  reason: string,                 // "check_passed" | "no_previous_limit"
  previous_limit_exists: boolean
}
```

---

#### 6. access_denied

**Trigger**: User accesses page without valid query param
**Location**: `js/access-control.js:212`

**Parameters**:
```javascript
{
  error_message_title: string,    // Error message shown
  url: string,                    // Full URL attempted
  referrer: string,               // Referrer or "direct"
  found_param: string | null      // Query param value found
}
```

---

#### 7. contact_form_shown

**Trigger**: Winner contact form opened
**Location**: `js/contact-collection.js:88`

**Parameters**:
```javascript
{
  prize_title: string,
  timestamp: number
}
```

---

#### 8. contact_form_submission_success

**Trigger**: Form successfully submitted to Google Sheets
**Location**: `js/contact-collection.js:175`

**Parameters**:
```javascript
{
  prize_title: string,
  submission_method: "web_app",
  time_to_submit_ms: number       // Time from start to success
}
```

**Example**:
```javascript
{
  prize_title: "精美禮品",
  submission_method: "web_app",
  time_to_submit_ms: 1250
}
```

---

#### 9. contact_form_validation_error

**Trigger**: Form validation fails
**Location**: `js/contact-collection.js:247`

**Parameters**:
```javascript
{
  invalid_fields: string[],       // Array of field names
  error_count: number             // Number of errors
}
```

**Example**:
```javascript
{
  invalid_fields: ["phone", "address"],
  error_count: 2
}
```

---

## GTM Configuration

### Step 1: Create GA4 Configuration Tag

1. In GTM, go to **Tags** → **New**
2. Tag Configuration: **Google Analytics: GA4 Configuration**
3. **Measurement ID**: Enter your GA4 ID (G-XXXXXXXXXX)
4. **Triggering**: All Pages (or Page View trigger)
5. **Name**: "GA4 Configuration"
6. Click **Save**

### Step 2: Create Custom Event Triggers

For each event you want to track, create a trigger:

1. Go to **Triggers** → **New**
2. Trigger Type: **Custom Event**
3. Event name: Match the event name exactly (e.g., `card_draw_success`)
4. **Name**: "CE - Card Draw Success"
5. Click **Save**

**Recommended Triggers to Create**:

| Event Name | Trigger Name |
|------------|--------------|
| `card_draw_success` | CE - Card Draw Success |
| `winner_overlay_clicked` | CE - Winner Overlay Clicked |
| `rate_limit_blocked` | CE - Rate Limit Blocked |
| `contact_form_submission_success` | CE - Form Submission Success |
| `access_denied` | CE - Access Denied |

### Step 3: Create GA4 Event Tags

For each custom event:

1. Go to **Tags** → **New**
2. Tag Configuration: **Google Analytics: GA4 Event**
3. **Configuration Tag**: Select "GA4 Configuration"
4. **Event Name**: Match dataLayer event name (e.g., `card_draw_success`)
5. **Event Parameters**: Add parameters from dataLayer
   - Click "Add Row"
   - Parameter Name: e.g., `is_winner`
   - Value: `{{DLV - is_winner}}` (create variable if needed)
6. **Triggering**: Select corresponding Custom Event trigger
7. Click **Save**

### Step 4: Create DataLayer Variables

For each event parameter you want to capture:

1. Go to **Variables** → **User-Defined Variables** → **New**
2. Variable Type: **Data Layer Variable**
3. **Data Layer Variable Name**: Enter exact name from event (e.g., `is_winner`)
4. **Variable Name**: "DLV - is_winner"
5. Click **Save**

**Example Variables to Create**:

- DLV - selected_text_title
- DLV - is_winner
- DLV - prize_title
- DLV - error_message
- DLV - time_to_submit_ms

### Step 5: Test Configuration in Preview Mode

1. Click **Preview** in GTM
2. Enter your card.html URL with `?from=picsee`
3. In Tag Assistant, verify:
   - Cookie consent appears
   - After accepting, GTM loads
   - Events fire when triggered
   - Parameters are captured correctly

---

## Testing & Validation

### Testing Checklist

- [ ] **Cookie Consent**
  - Banner appears on first visit
  - Accept button loads GTM
  - Decline button blocks GTM
  - Choice persists on refresh

- [ ] **GTM Loading**
  - GTM container loads after consent
  - `window.dataLayer` exists
  - `window.google_tag_manager` exists

- [ ] **Event Tracking**
  - `page_load_start` fires on page load
  - `card_draw_success` fires when card displays
  - `winner_overlay_clicked` fires when winner clicks
  - `rate_limit_blocked` fires when user is blocked
  - `contact_form_submission_success` fires on form submit
  - `access_denied` fires on invalid URL access

### Testing Tools

#### 1. GTM Preview Mode

Best for: Verifying tag firing and triggers

1. In GTM, click **Preview**
2. Enter your test URL
3. Use **Tag Assistant** to see:
   - Which tags fired
   - Which didn't fire and why
   - Variable values
   - DataLayer state

#### 2. GA4 DebugView

Best for: Verifying events in GA4

1. In GA4, go to **Configure** → **DebugView**
2. Enable debug mode in your browser:
   ```javascript
   // In console
   window.dataLayerManager.enableDebug();
   ```
3. Perform actions (draw card, submit form, etc.)
4. See events appear in real-time in DebugView

#### 3. Browser Console

Best for: Quick debugging of dataLayer

```javascript
// View all dataLayer events
console.table(window.dataLayer);

// View last event
console.log(window.dataLayer[window.dataLayer.length - 1]);

// Push test event
window.pushToDataLayer('test_event', { test: 'value' });
```

### Common Test Scenarios

#### Scenario 1: New User First Visit

1. Clear cookies and localStorage
2. Visit `card.html?from=picsee`
3. **Expected**:
   - Cookie banner appears
   - No GTM loaded yet
   - No events tracked

4. Click "Accept" on banner
5. **Expected**:
   - GTM loads
   - `page_load_start` fires
   - Card draws after 3 seconds
   - `card_draw_success` fires

#### Scenario 2: Winner Flow

1. Modify Google Sheet to set a text with `won=1`
2. Draw cards until winner appears
3. **Expected**:
   - `card_draw_success` with `is_winner: true`
4. Click the winning text
5. **Expected**:
   - `winner_overlay_clicked` fires
   - Form opens
   - `contact_form_shown` fires
6. Fill and submit form
7. **Expected**:
   - `contact_form_submission_start` fires
   - `contact_form_submission_success` fires (or error)

#### Scenario 3: Rate Limiting

1. Draw a card successfully
2. Immediately refresh the page
3. **Expected**:
   - `page_load_start` fires
   - `rate_limit_blocked` fires
   - Rate limit overlay shows

---

## Privacy & Compliance

### PII Protection

The implementation includes automatic PII prevention:

**Fields Blocked from Tracking**:
- Phone numbers (`phone`)
- Email addresses (`email`)
- Full names (`name`, `recipientName`)
- Addresses (`address`)
- Account IDs (`account`)
- IP addresses
- User IDs

**Implementation**: `js/gtm-datalayer.js:107-126`

```javascript
// Fields matching these patterns are automatically excluded
const piiPatterns = [
  /phone/i,
  /email/i,
  /address/i,
  /^name$/i,
  /password/i,
  /account/i,
  /recipient/i
];
```

### What IS Tracked (Privacy-Safe)

- ✅ Field **lengths** (not values): `message_length: 45`
- ✅ Boolean flags: `is_winner: true`, `has_phone: true`
- ✅ Truncated hashes: `fingerprint_hash: "a3f5e8d2..." ` (first 16 chars)
- ✅ Aggregate counts: `error_count: 2`
- ✅ Timestamps: `timestamp: 1730000000`

### GDPR Compliance

1. **Consent Required**: No tracking without user consent
2. **Clear Option**: Decline button doesn't degrade functionality
3. **Persistent Choice**: Decision saved in localStorage
4. **Transparent**: Banner clearly explains cookie usage
5. **No PII**: Automatic filtering prevents PII leakage

### Cookie Consent Banner

Text (Traditional Chinese):
```
標題: Cookie 使用聲明

說明: 我們使用 Cookie 和分析工具來改善您的使用體驗並分析網站流量。
      點擊「接受」即表示您同意我們使用 Cookie 和 Google Analytics 追蹤。

按鈕: [拒絕] [接受]
```

Customize in: `js/cookie-consent.js:89-103`

---

## Troubleshooting

### Problem: Cookie banner doesn't appear

**Symptoms**: Page loads but no cookie consent banner

**Diagnosis**:
```javascript
// Check if consent manager exists
console.log(window.cookieConsent);
// Should output: CookieConsentManager object

// Check consent status
console.log(window.cookieConsent.consentStatus);
// Should output: null | "accepted" | "declined"
```

**Solutions**:
1. Check if `js/cookie-consent.js` is loaded (check Network tab)
2. Check for JavaScript errors in console
3. Clear localStorage: `localStorage.removeItem('cookie_consent_status')`

---

### Problem: GTM doesn't load after accepting cookies

**Symptoms**: Accepted cookies but `window.google_tag_manager` is undefined

**Diagnosis**:
```javascript
// Check if GTM ID is set
console.log(window.GTM_ID);
// Should output: "GTM-ABC1234" (your actual ID)

// Check if consent was registered
console.log(window.cookieConsent.hasConsent());
// Should output: true

// Check GTM loading function exists
console.log(typeof loadGTM);
// Should output: "function"
```

**Solutions**:
1. Verify GTM_ID in `card.html` is correct (not the placeholder)
2. Check Network tab for GTM script load failures
3. Verify GTM container is published (not just saved)

---

### Problem: Events not appearing in GA4

**Symptoms**: GTM fires tags but events don't appear in GA4 DebugView

**Diagnosis**:
1. GTM Preview Mode: Do tags show as "Fired Successfully"?
2. GTM Preview Mode: Check Tag details for errors
3. GA4 DebugView: Is debug mode enabled?

**Solutions**:
1. **GTM Configuration Tag**: Verify GA4 Measurement ID is correct
2. **GA4 Event Tag**: Verify Configuration Tag is selected
3. **Event Name**: Ensure exact match between dataLayer and GA4 Event Tag
4. **Debug Mode**: Enable with `window.dataLayerManager.enableDebug()`
5. **Wait Time**: GA4 can have 5-10 second delay for DebugView

---

### Problem: Events fire but parameters are missing

**Symptoms**: Event appears in GA4 but event parameters are empty

**Diagnosis**:
```javascript
// Check last dataLayer event
const lastEvent = window.dataLayer[window.dataLayer.length - 1];
console.log(lastEvent);
// Should show event name and all parameters
```

**Solutions**:
1. **DataLayer Variables**: Create variables in GTM for each parameter
2. **Variable Names**: Must exactly match parameter names from dataLayer
3. **Event Tag**: Add event parameters referencing the variables
4. **Test in Preview**: Verify variables populate correctly

---

### Problem: DataLayer pushes fail silently

**Symptoms**: No errors but events don't appear in dataLayer

**Diagnosis**:
```javascript
// Enable debug logging
window.dataLayerManager.enableDebug();

// Try manual push
window.pushToDataLayer('test_event', { test: 'data' });
// Should see console log: "[DataLayer] ✅ Pushed: test_event"

// Check consent status
console.log(window.dataLayerManager.hasConsent());
// If false, events are queued
```

**Solutions**:
1. **Consent Required**: Accept cookies first
2. **Check Queue**: `console.log(window.dataLayerManager.eventQueue)`
3. **Flush Queue**: After consent, queue should auto-flush
4. **JavaScript Errors**: Check console for errors blocking execution

---

### Debug Utilities

#### Enable Debug Mode
```javascript
window.dataLayerManager.enableDebug();
```

#### View All Events
```javascript
console.table(window.dataLayer);
```

#### View Event Queue (pre-consent)
```javascript
console.log(window.dataLayerManager.eventQueue);
```

#### Reset Cookie Consent
```javascript
window.cookieConsent.reset();
location.reload();
```

#### Manual Event Push
```javascript
window.pushToDataLayer('custom_event', {
  param1: 'value1',
  param2: 123
});
```

---

## Appendix

### File Reference

| File | Size | Purpose |
|------|------|---------|
| `js/cookie-consent.js` | ~250 lines | Cookie consent manager |
| `css/cookie-consent.css` | ~100 lines | Cookie banner styles |
| `js/gtm-datalayer.js` | ~150 lines | DataLayer helper utilities |
| `card.html` | Modified | GTM snippets + consent |
| `js/card.js` | Modified | 8 tracking events added |
| `js/contact-collection.js` | Modified | 6 tracking events added |
| `js/access-control.js` | Modified | 2 tracking events added |

### Code Locations Quick Reference

```javascript
// Cookie consent initialization
// js/cookie-consent.js:272

// GTM loading function
// card.html:24-38

// DataLayer push helper
// js/gtm-datalayer.js:31-65

// PII prevention filter
// js/gtm-datalayer.js:107-126

// Event tracking examples
// js/card.js:1312 (card_draw_success)
// js/contact-collection.js:175 (contact_form_submission_success)
// js/access-control.js:212 (access_denied)
```

### Related Documentation

- [Use Case Documentation (Chinese)](../use-cases/07-google-analytics-tracking.md) - Business-focused guide
- [CLAUDE.md](../../CLAUDE.md) - Project overview
- [Access Control](../../CLAUDE.md#access-control-system) - Access control details

### Support Resources

- **GTM Help**: https://support.google.com/tagmanager
- **GA4 Help**: https://support.google.com/analytics
- **DataLayer Guide**: https://developers.google.com/tag-platform/tag-manager/datalayer

---

**Document Version**: 1.0
**Last Updated**: 2025-11-08
**Implementation Status**: ✅ Complete
