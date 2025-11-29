/**
 * Access Control Module
 *
 * Validates that users access card pages only with the required query string parameter.
 * If validation passes, removes the query string from URL for cleaner appearance.
 * If validation fails, blocks all page access with an overlay message.
 *
 * This script must run BEFORE any other page initialization scripts.
 */

(function() {
    'use strict';

    // Configuration (loaded from config/access-control.json in production)
    let config = {
        requiredQueryParam: {
            name: 'from',
            value: 'picsee'
        },
        errorMessage: {
            title: '活動僅能透過掃描吊牌使用唷～',
            description: ''
        },
        enabled: true
    };

    // Access validation state
    let accessGranted = false;

    /**
     * Check if the current URL has the required query string parameter
     * @returns {boolean} True if access should be granted
     */
    function validateAccess() {
        // Get current URL parameters
        const urlParams = new URLSearchParams(window.location.search);

        // Check if required parameter exists with correct value
        const paramValue = urlParams.get(config.requiredQueryParam.name);
        const isValid = paramValue === config.requiredQueryParam.value;

        if (config.enabled) {
            console.log('🔒 Access Control Check:', {
                required: `${config.requiredQueryParam.name}=${config.requiredQueryParam.value}`,
                found: paramValue ? `${config.requiredQueryParam.name}=${paramValue}` : 'none',
                isValid: isValid
            });
        }

        return isValid;
    }

    /**
     * Remove query string from URL without page reload
     * Uses History API to clean the URL
     */
    function cleanURL() {
        try {
            const cleanUrl = window.location.protocol + '//' +
                           window.location.host +
                           window.location.pathname;

            window.history.replaceState({}, document.title, cleanUrl);

            console.log('✨ URL cleaned - query string removed');
        } catch (error) {
            console.warn('⚠️ Failed to clean URL:', error);
        }
    }

    /**
     * Create and display the access denied overlay
     * This overlay blocks all page interactions
     */
    function showAccessDeniedOverlay() {
        // Wait for body to be available
        if (!document.body) {
            console.log('⏳ Waiting for body to create overlay...');
            setTimeout(showAccessDeniedOverlay, 50);
            return;
        }

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'access-control-overlay';
        overlay.className = 'access-denied-overlay';

        // Create content container
        const content = document.createElement('div');
        content.className = 'access-denied-content';

        // Add title
        const title = document.createElement('div');
        title.className = 'access-denied-title';
        title.textContent = config.errorMessage.title;
        content.appendChild(title);

        // Add description if provided
        if (config.errorMessage.description) {
            const description = document.createElement('div');
            description.className = 'access-denied-description';
            description.textContent = config.errorMessage.description;
            content.appendChild(description);
        }

        overlay.appendChild(content);

        // Add to page
        document.body.appendChild(overlay);

        // Make overlay visible while keeping content hidden
        overlay.style.visibility = 'visible';
        overlay.style.display = 'flex';

        // Prevent all page interactions
        document.body.style.overflow = 'hidden';

        console.log('🚫 Access denied - overlay displayed');
    }

    /**
     * Hide the body content when access is denied
     * Prevents flash of content before overlay appears
     */
    function hidePageContent() {
        // Hide page content but keep document visible for overlay
        if (document.body) {
            document.body.style.visibility = 'hidden';
        } else {
            document.documentElement.style.visibility = 'hidden';
        }
    }

    /**
     * Show the body content when access is granted
     */
    function showPageContent() {
        document.documentElement.style.visibility = 'visible';
        if (document.body) {
            document.body.style.visibility = 'visible';
        }
    }

    /**
     * Load configuration from config/access-control.json
     * Falls back to default config if loading fails
     */
    async function loadConfig() {
        try {
            const response = await fetch('config/access-control.json');
            if (response.ok) {
                const loadedConfig = await response.json();
                config = { ...config, ...loadedConfig };
                console.log('⚙️ Access control config loaded:', config);
            } else {
                console.warn('⚠️ Failed to load config, using defaults');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load config, using defaults:', error);
        }
    }

    /**
     * Main initialization function
     * Runs as early as possible in page load
     */
    async function initialize() {
        // Load config first
        await loadConfig();

        // If access control is disabled in config, allow access
        if (!config.enabled) {
            console.log('⚙️ Access control is disabled');
            accessGranted = true;
            showPageContent();
            return;
        }

        // Validate access
        const isValid = validateAccess();

        // Get query parameter value for tracking
        const urlParams = new URLSearchParams(window.location.search);
        const foundParam = urlParams.get(config.requiredQueryParam.name);

        if (isValid) {
            // Access granted
            accessGranted = true;
            console.log('✅ Access granted');

            // Clean the URL (remove query string)
            cleanURL();

            // Show page content
            showPageContent();
        } else {
            // Access denied
            accessGranted = false;
            console.log('❌ Access denied - invalid or missing query parameter');

            // Make sure document is visible for overlay to show
            document.documentElement.style.visibility = 'visible';

            // Show access denied overlay
            showAccessDeniedOverlay();

            // Hide only the page content (not the overlay)
            hidePageContent();
        }
    }

    /**
     * Export access status for other scripts to check
     */
    window.AccessControl = {
        isAccessGranted: function() {
            return accessGranted;
        },
        getConfig: function() {
            return config;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM already loaded
        initialize();
    }

    // Also run immediately to hide content ASAP if needed
    if (!validateAccess() && config.enabled) {
        hidePageContent();
    }

})();
