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
- **Web App URL**: `https://script.google.com/macros/s/AKfycbxJ04YQhMx3KzzUAohIOMdcSOd5c1e280FAXLcYSd9J5JzZ-DWDr5_9eBZivRdpFN3xaw/exec`
- **Target Sheet GID**: `2018488710` (winner contact collection sheet)
- Contact form submissions sent to Google Apps Script Web App
- Collects winner information: prize title, account, phone, recipient name, address, message, and user agent
- Form validation and submission status feedback
- **Script Location**: `external/scripts/AppScripts.js` (reference implementation)
- **Data Fields Collected**:
  - `prizeTitle`: Prize name from config sheet (gid=2058356234)
  - `account`: User's website account
  - `phone`: Contact phone number
  - `recipientName`: Recipient name for prize delivery
  - `address`: Delivery address
  - `message`: User's message to Comoor
  - `timestamp`: Submission timestamp (Asia/Taipei timezone)
  - `userAgent`: Browser user agent string

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

### Key Features
- Dynamic gradient backgrounds (5 predefined SVG patterns)
- Text overlay system with weighted random selection
- Contact form modal for winners
- Google Sheets CSV parsing with validation
- Responsive design for mobile and desktop
- Cross-browser compatibility

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
    └── card.js
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
- Debug mode enabled by default in `RATE_LIMIT_CONFIG` for console logging
- Fingerprinting components logged to console for debugging

### External Dependencies
- Google Sheets API (via CORS proxy)
- Google Apps Script Web App (for contact form submissions)
- CORS proxy: `api.allorigins.win`

## Google Apps Script Implementation

### Overview
The Google Apps Script Web App (`external/scripts/AppScripts.js`) handles winner contact form submissions and writes data to the Google Spreadsheet.

### Configuration
- **Target Spreadsheet**: Bound to the active spreadsheet
- **Target Sheet GID**: `2018488710` (dynamically located by sheet ID)
- **Deployment**: Must be deployed as Web App with "Execute as: Me" and "Who has access: Anyone"

### Implementation Details

The `doPost(e)` function:
1. **Parses Incoming Data**: Accepts data from either FormData (`e.parameter.data`) or JSON (`e.postData.contents`)
2. **Locates Target Sheet**: Finds the sheet with GID `2018488710` in the active spreadsheet
3. **Prepares Row Data**: Formats data in the correct column order:
   - Column A: Timestamp (Asia/Taipei timezone)
   - Column B: Prize Title
   - Column C: Account
   - Column D: Phone
   - Column E: Recipient Name
   - Column F: Address
   - Column G: Message
   - Column H: User Agent
4. **Appends to Sheet**: Uses `appendRow()` to add the data
5. **Returns Response**: JSON response with success/error status

### Data Flow
```
Frontend (contact-collection.js)
  → FormData with JSON payload
  → Google Apps Script Web App
  → Sheet with GID 2018488710
```

### Error Handling
- Returns JSON response with `success: true/false`
- Includes error message in `error` field when submission fails
- Frontend displays error messages and keeps form open for retry

### Deployment Instructions
1. Open the bound Google Apps Script project for the spreadsheet
2. Copy code from `external/scripts/AppScripts.js`
3. Replace the existing `doPost` function
4. Save the script
5. Deploy as Web App:
   - Click "Deploy" → "New deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
6. Copy the Web App URL and update `contact-collection.js` if needed (currently: `https://script.google.com/macros/s/AKfycbxJ04YQhMx3KzzUAohIOMdcSOd5c1e280FAXLcYSd9J5JzZ-DWDr5_9eBZivRdpFN3xaw/exec`)

### Important Notes
- The script uses `SpreadsheetApp.getActiveSpreadsheet()` so it must be bound to the correct spreadsheet
- Sheet is located by GID (`2018488710`) not by name, making it resilient to sheet renaming
- Timestamps are formatted in Taiwan timezone (`zh-TW`, `Asia/Taipei`)
- All fields include fallback to empty string if data is missing