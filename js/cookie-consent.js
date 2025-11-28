/**
 * Cookie Consent Manager
 * GDPR-compliant cookie consent system for GTM/GA4
 *
 * Features:
 * - localStorage persistence
 * - Blocks GTM/GA4 until consent granted
 * - Accept/Decline buttons
 * - Privacy-first approach
 */

class CookieConsentManager {
    constructor() {
        this.STORAGE_KEY = 'cookie_consent_status';
        this.consentStatus = null;
        this.banner = null;
        this.callbacks = {
            onAccept: [],
            onDecline: []
        };
    }

    /**
     * Initialize the consent manager
     */
    init() {
        // Check if consent has already been given
        this.consentStatus = this.getConsentStatus();

        if (this.consentStatus === null) {
            // No consent decision yet - show banner
            this.showBanner();
        } else if (this.consentStatus === 'accepted') {
            // Consent already given - load tracking
            this.executeAcceptCallbacks();
        }
        // If declined, do nothing (no tracking loaded)

        return this.consentStatus;
    }

    /**
     * Get stored consent status from localStorage
     * @returns {string|null} 'accepted', 'declined', or null
     */
    getConsentStatus() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // Check if consent is still valid (optional: add expiry logic here)
                return data.status;
            }
        } catch (error) {
            console.error('Failed to read consent status:', error);
        }
        return null;
    }

    /**
     * Save consent status to localStorage
     * @param {string} status - 'accepted' or 'declined'
     */
    saveConsentStatus(status) {
        try {
            const data = {
                status: status,
                timestamp: new Date().toISOString(),
                version: 1 // For future consent version tracking
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            this.consentStatus = status;
        } catch (error) {
            console.error('Failed to save consent status:', error);
        }
    }

    /**
     * Show the cookie consent banner
     */
    showBanner() {
        // Create banner HTML
        this.banner = document.createElement('div');
        this.banner.id = 'cookieConsentBanner';
        this.banner.className = 'cookie-consent-banner';
        this.banner.setAttribute('role', 'dialog');
        this.banner.setAttribute('aria-labelledby', 'cookieConsentTitle');
        this.banner.setAttribute('aria-describedby', 'cookieConsentDescription');

        this.banner.innerHTML = `
            <div class="cookie-consent-container">
                <div class="cookie-consent-content">
                    <div class="cookie-consent-icon">🍪</div>
                    <div class="cookie-consent-text">
                        <h3 id="cookieConsentTitle" class="cookie-consent-title">Cookie 使用聲明</h3>
                        <p id="cookieConsentDescription" class="cookie-consent-description">
                            我們使用 Cookie 和分析工具來改善您的使用體驗並分析網站流量。
                            點擊「接受」即表示您同意我們使用 Cookie 和 Google Analytics 追蹤。
                        </p>
                    </div>
                </div>
                <div class="cookie-consent-buttons">
                    <button
                        type="button"
                        class="cookie-consent-btn cookie-consent-btn-decline"
                        id="cookieConsentDecline"
                        aria-label="拒絕 Cookie">
                        拒絕
                    </button>
                    <button
                        type="button"
                        class="cookie-consent-btn cookie-consent-btn-accept"
                        id="cookieConsentAccept"
                        aria-label="接受 Cookie">
                        接受
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.banner);

        // Add event listeners
        document.getElementById('cookieConsentAccept').addEventListener('click', () => {
            this.handleAccept();
        });

        document.getElementById('cookieConsentDecline').addEventListener('click', () => {
            this.handleDecline();
        });

        // Animate in
        setTimeout(() => {
            this.banner.classList.add('show');
        }, 100);
    }

    /**
     * Hide and remove the banner
     */
    hideBanner() {
        if (this.banner) {
            this.banner.classList.remove('show');
            setTimeout(() => {
                if (this.banner && this.banner.parentNode) {
                    this.banner.parentNode.removeChild(this.banner);
                    this.banner = null;
                }
            }, 300); // Match CSS transition duration
        }
    }

    /**
     * Handle accept button click
     */
    handleAccept() {
        console.log('✅ Cookie consent accepted');
        this.saveConsentStatus('accepted');
        this.hideBanner();
        this.executeAcceptCallbacks();
    }

    /**
     * Handle decline button click
     */
    handleDecline() {
        console.log('❌ Cookie consent declined');
        this.saveConsentStatus('declined');
        this.hideBanner();
        this.executeDeclineCallbacks();
    }

    /**
     * Execute all accept callbacks (load GTM, GA4, etc.)
     */
    executeAcceptCallbacks() {
        this.callbacks.onAccept.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error executing accept callback:', error);
            }
        });
    }

    /**
     * Execute all decline callbacks
     */
    executeDeclineCallbacks() {
        this.callbacks.onDecline.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error executing decline callback:', error);
            }
        });
    }

    /**
     * Register a callback to execute when consent is accepted
     * @param {Function} callback - Function to execute
     */
    onAccept(callback) {
        if (typeof callback === 'function') {
            this.callbacks.onAccept.push(callback);

            // If already accepted, execute immediately
            if (this.consentStatus === 'accepted') {
                try {
                    callback();
                } catch (error) {
                    console.error('Error executing accept callback:', error);
                }
            }
        }
    }

    /**
     * Register a callback to execute when consent is declined
     * @param {Function} callback - Function to execute
     */
    onDecline(callback) {
        if (typeof callback === 'function') {
            this.callbacks.onDecline.push(callback);

            // If already declined, execute immediately
            if (this.consentStatus === 'declined') {
                try {
                    callback();
                } catch (error) {
                    console.error('Error executing decline callback:', error);
                }
            }
        }
    }

    /**
     * Check if user has consented
     * @returns {boolean}
     */
    hasConsent() {
        return this.consentStatus === 'accepted';
    }

    /**
     * Reset consent (for testing/debugging)
     */
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.consentStatus = null;
        console.log('🔄 Cookie consent reset');
    }
}

// Create global instance
window.cookieConsent = new CookieConsentManager();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cookieConsent.init();
    });
} else {
    // DOM already loaded
    window.cookieConsent.init();
}
