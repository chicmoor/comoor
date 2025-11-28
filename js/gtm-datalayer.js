/**
 * GTM DataLayer Helper Utilities
 * Centralized dataLayer management with privacy safeguards
 *
 * Features:
 * - Consent-aware event pushing
 * - PII prevention
 * - Data sanitization
 * - Debug logging
 * - Type validation
 */

class DataLayerManager {
    constructor() {
        // Initialize dataLayer if not already present
        window.dataLayer = window.dataLayer || [];

        this.config = {
            debug: true, // Set to false in production
            requireConsent: true, // Require cookie consent before pushing events
            sanitizePII: true, // Automatically sanitize potential PII
            maxStringLength: 500 // Max length for string values
        };

        this.eventQueue = []; // Queue for events pushed before consent
    }

    /**
     * Push event to dataLayer
     * @param {string} eventName - GA4 event name
     * @param {Object} eventData - Event parameters
     * @param {Object} options - Push options
     */
    push(eventName, eventData = {}, options = {}) {
        if (!eventName || typeof eventName !== 'string') {
            console.error('[DataLayer] Invalid event name:', eventName);
            return false;
        }

        // Check consent if required
        if (this.config.requireConsent && !options.ignoreConsent) {
            if (!this.hasConsent()) {
                if (this.config.debug) {
                    console.warn(`[DataLayer] Event "${eventName}" queued (no consent yet)`);
                }
                this.eventQueue.push({ eventName, eventData, options });
                return false;
            }
        }

        // Sanitize data if enabled
        const sanitizedData = this.config.sanitizePII
            ? this.sanitizeData(eventData)
            : eventData;

        // Build dataLayer object
        const dataLayerObject = {
            event: eventName,
            ...sanitizedData,
            _timestamp: Date.now(),
            _consent_status: this.getConsentStatus()
        };

        // Push to dataLayer
        try {
            window.dataLayer.push(dataLayerObject);

            if (this.config.debug) {
                console.log(`[DataLayer] ✅ Pushed: ${eventName}`, dataLayerObject);
            }

            return true;
        } catch (error) {
            console.error(`[DataLayer] Failed to push event "${eventName}":`, error);
            return false;
        }
    }

    /**
     * Push page view event
     * @param {Object} pageData - Page-specific data
     */
    pushPageView(pageData = {}) {
        this.push('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            ...pageData
        });
    }

    /**
     * Sanitize data to prevent PII leakage
     * @param {Object} data - Raw event data
     * @returns {Object} Sanitized data
     */
    sanitizeData(data) {
        const sanitized = {};

        for (const [key, value] of Object.entries(data)) {
            // Skip null/undefined
            if (value === null || value === undefined) {
                continue;
            }

            // Sanitize based on key name (potential PII)
            if (this.isPIIField(key)) {
                if (this.config.debug) {
                    console.warn(`[DataLayer] Skipped PII field: ${key}`);
                }
                continue;
            }

            // Sanitize based on value type
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            } else if (typeof value === 'number') {
                sanitized[key] = value;
            } else if (typeof value === 'boolean') {
                sanitized[key] = value;
            } else if (Array.isArray(value)) {
                sanitized[key] = value.map(item =>
                    typeof item === 'object' ? this.sanitizeData(item) : item
                );
            } else if (typeof value === 'object') {
                sanitized[key] = this.sanitizeData(value);
            } else {
                // Convert other types to string
                sanitized[key] = String(value);
            }
        }

        return sanitized;
    }

    /**
     * Check if field name indicates PII
     * @param {string} fieldName - Field name to check
     * @returns {boolean}
     */
    isPIIField(fieldName) {
        const piiPatterns = [
            /phone/i,
            /email/i,
            /address/i,
            /^name$/i,
            /password/i,
            /account/i,
            /recipient/i,
            /user_?id/i,
            /ip_?address/i,
            /credit_?card/i
        ];

        return piiPatterns.some(pattern => pattern.test(fieldName));
    }

    /**
     * Sanitize string value
     * @param {string} value - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeString(value) {
        // Truncate if too long
        if (value.length > this.config.maxStringLength) {
            return value.substring(0, this.config.maxStringLength) + '...';
        }
        return value;
    }

    /**
     * Truncate hash/fingerprint to first N characters
     * @param {string} hash - Hash string
     * @param {number} length - Number of characters to keep (default: 16)
     * @returns {string} Truncated hash
     */
    truncateHash(hash, length = 16) {
        if (!hash || typeof hash !== 'string') return '';
        return hash.substring(0, length);
    }

    /**
     * Check if user has given consent
     * @returns {boolean}
     */
    hasConsent() {
        return window.cookieConsent && window.cookieConsent.hasConsent();
    }

    /**
     * Get current consent status
     * @returns {string} 'accepted', 'declined', or 'pending'
     */
    getConsentStatus() {
        if (!window.cookieConsent) return 'pending';

        const status = window.cookieConsent.consentStatus;
        return status || 'pending';
    }

    /**
     * Flush queued events (called after consent is granted)
     */
    flushQueue() {
        if (this.eventQueue.length === 0) return;

        if (this.config.debug) {
            console.log(`[DataLayer] Flushing ${this.eventQueue.length} queued events`);
        }

        const queue = [...this.eventQueue];
        this.eventQueue = [];

        queue.forEach(({ eventName, eventData, options }) => {
            this.push(eventName, eventData, { ...options, ignoreConsent: true });
        });
    }

    /**
     * Clear all queued events
     */
    clearQueue() {
        this.eventQueue = [];
        if (this.config.debug) {
            console.log('[DataLayer] Event queue cleared');
        }
    }

    /**
     * Enable debug mode
     */
    enableDebug() {
        this.config.debug = true;
        console.log('[DataLayer] Debug mode enabled');
    }

    /**
     * Disable debug mode
     */
    disableDebug() {
        this.config.debug = false;
    }
}

// Create global instance
window.dataLayerManager = new DataLayerManager();

// Register consent callback to flush queue when consent is granted
if (window.cookieConsent) {
    window.cookieConsent.onAccept(() => {
        window.dataLayerManager.flushQueue();
    });
}

/**
 * Convenience function for pushing events
 * @param {string} eventName - GA4 event name
 * @param {Object} eventData - Event parameters
 */
window.pushToDataLayer = function(eventName, eventData = {}) {
    if (window.dataLayerManager) {
        return window.dataLayerManager.push(eventName, eventData);
    } else {
        console.error('[DataLayer] DataLayerManager not initialized');
        return false;
    }
};

// Log initialization
if (window.dataLayerManager && window.dataLayerManager.config.debug) {
    console.log('[DataLayer] 🚀 DataLayer Manager initialized');
}
