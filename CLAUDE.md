# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML project containing two main pages for a card/campaign system:

- `campaign.html` - Campaign form page with Chinese interface for user registration
- `card.html` - Dynamic card display page with Google Sheets integration for text content

## Architecture

### Static HTML Structure
Both HTML files are self-contained with inline CSS and JavaScript:

- **campaign.html**: Form-based page with responsive design and Chinese localization
- **card.html**: Dynamic content page that fetches text from Google Sheets and displays random cards with gradient backgrounds

### Data Integration
- **Google Sheets Integration**: `card.html` uses Google Sheets API via CORS proxy to fetch dynamic text content
- **Fallback System**: Built-in fallback texts in case Google Sheets is unavailable
- **Sheet ID**: `1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE`
- **CORS Proxy**: Uses `api.allorigins.win` for cross-origin requests

### Key Components in card.html
- Dynamic gradient backgrounds (5 predefined SVG patterns)
- Text overlay system with random selection
- Google Sheets CSV parsing with fallback mechanism
- Responsive design for mobile and desktop

## Deployment

The project is designed for GitHub Pages hosting. See `github-page-host.md` for detailed deployment instructions covering:

- Direct GitHub Pages deployment
- Custom domain setup options
- File structure requirements
- Security considerations

## Development Notes

- All styling is inline CSS for easy deployment
- No build process required - files can be served directly
- Mobile-responsive design implemented
- Cross-browser compatibility maintained through standard HTML/CSS/JS