# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML project containing two main pages for a card/campaign system:

- `campaign.html` - Campaign form page with Chinese interface for user registration
- `card.html` - Dynamic card display page with Google Sheets integration for text content

## Architecture

### File Structure
The project follows a modular architecture:

- **campaign.html**: Form-based page with inline CSS and JavaScript for user registration
- **card.html**: Main card display page (79 lines) with external resource references
- **css/card.css**: Extracted stylesheet (570 lines) for card.html styling
- **js/card.js**: Extracted JavaScript (1,878 lines) for card.html functionality

### Page Details

#### campaign.html
- Self-contained with inline CSS and JavaScript
- Responsive design with Chinese localization
- User registration form

#### card.html
- Modular structure referencing external CSS and JS files
- Dynamic card display with probability-weighted text selection
- Google Sheets integration for content management
- Winner contact form with modal interface
- Device fingerprinting for rate limiting

### Data Integration

#### Google Sheets Integration
- **Sheet ID**: `1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE`
- **CORS Proxy**: Uses `api.allorigins.win` for cross-origin requests
- **Text Selection**: Probability-weighted system using three columns (text, probability, won)
- **Image Selection**: Equal probability for all available images
- **Fallback System**: Built-in fallback texts with equal probability (0.2 each)

#### Google Apps Script Web App
- Contact form submissions sent to Google Apps Script Web App
- Collects winner information: account, phone, recipient name, address, and message
- Form validation and submission status feedback

### Rate Limiting & User Tracking

#### Device Fingerprinting
Advanced multi-factor fingerprinting system to identify unique devices:
- Screen characteristics (resolution, color depth, pixel ratio)
- Timezone and language preferences
- Platform information (hardware concurrency, touch points)
- Browser fingerprinting (canvas, WebGL, audio context)
- Font detection

#### Cooldown System
- **Normal Mode**: 1-hour cooldown between card draws per device
- **Dev Mode**: 10-second cooldown when `?dev=true` URL parameter is used
- Grace period: 5 minutes
- LocalStorage + device fingerprint validation

### Access Control

#### Referrer Guard System
Client-side access control to ensure users access pages through official channels:
- **Allowed Referrer**: `https://comoor.pse.is/` (URL shortener)
- **Implementation**: `js/referrer-guard.js` validates `document.referrer` on page load
- **Behavior**: Shows error overlay if referrer is missing or doesn't match allowed domain
- **Bypass Mode**: Use `?bypass=true` URL parameter for development/testing
- **Files Protected**: Both `card.html` and `campaign.html`

**Important Notes**:
- Client-side validation only - not suitable for security purposes
- Use for campaign flow control and tracking integrity
- See `referrer-use-cases.md` for detailed documentation and use cases

### Key Features
- Dynamic gradient backgrounds (5 predefined SVG patterns)
- Text overlay system with weighted random selection
- Contact form modal for winners
- Google Sheets CSV parsing with validation
- Responsive design for mobile and desktop
- Cross-browser compatibility
- Referrer-based access control for campaign flow management

## Deployment

The project is designed for GitHub Pages hosting. See `github-page-host.md` for detailed deployment instructions covering:

- Direct GitHub Pages deployment
- Custom domain setup options
- File structure requirements
- Security considerations

### File Structure Requirements
When deploying, ensure the following directory structure is maintained:
```
/
├── campaign.html
├── card.html
├── css/
│   └── card.css
└── js/
    ├── card.js
    └── referrer-guard.js
```

All files must be served from the same origin to avoid CORS issues with the external CSS and JS references.

## Development Notes

### General
- No build process required - files can be served directly
- Mobile-responsive design implemented
- Cross-browser compatibility maintained through standard HTML/CSS/JS

### File Organization
- **campaign.html**: Self-contained with inline CSS/JS for easy deployment
- **card.html**: Modular structure with external CSS/JS for better maintainability and browser caching

### Testing & Development
- Use `?dev=true` URL parameter to enable dev mode with reduced cooldown (10 seconds vs 1 hour)
- Use `?bypass=true` URL parameter to bypass referrer validation during testing
- Debug mode enabled by default in `RATE_LIMIT_CONFIG` for console logging
- Fingerprinting components logged to console for debugging
- Referrer guard debug info shown in console when `debugMode: true`

### External Dependencies
- Google Sheets API (via CORS proxy)
- Google Apps Script Web App (for contact form submissions)
- CORS proxy: `api.allorigins.win`