/**
 * Referrer Guard - Access Control System
 *
 * Validates that users are accessing pages through the official URL shortener.
 * Prevents direct access to maintain campaign tracking and user flow control.
 *
 * This is a client-side enforcement mechanism suitable for static sites.
 * Note: Can be bypassed by technical users - use for flow control, not security.
 */

// Configuration
const REFERRER_GUARD_CONFIG = {
    allowedReferrer: 'https://comoor.pse.is/',
    bypassParam: 'bypass',
    debugMode: true,
    errorDisplayDelay: 100 // ms delay before showing error (prevents flash)
};

// Global flag to indicate access status
window.REFERRER_ACCESS_GRANTED = false;

// Referrer Guard Class
class ReferrerGuard {
    constructor(config) {
        this.config = config;
        this.accessGranted = false;
        this.bypassMode = false;
        this.referrer = document.referrer;
    }

    // Check if bypass parameter is present
    checkBypass() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(this.config.bypassParam) === 'true';
    }

    // Validate referrer
    validateReferrer() {
        // Check for bypass mode first
        if (this.checkBypass()) {
            this.bypassMode = true;
            this.accessGranted = true;
            if (this.config.debugMode) {
                console.log('🔓 Referrer Guard: Bypass mode active');
            }
            return true;
        }

        // Check referrer
        if (!this.referrer) {
            if (this.config.debugMode) {
                console.warn('⚠️ Referrer Guard: No referrer detected (direct access or privacy settings)');
            }
            return false;
        }

        // Validate referrer starts with allowed domain
        const isValid = this.referrer.startsWith(this.config.allowedReferrer);

        if (this.config.debugMode) {
            console.log(`🔍 Referrer Guard: Checking referrer`);
            console.log(`   Referrer: ${this.referrer}`);
            console.log(`   Allowed: ${this.config.allowedReferrer}`);
            console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
        }

        this.accessGranted = isValid;
        return isValid;
    }

    // Create and display error overlay
    showAccessDenied() {
        // Create overlay HTML
        const overlay = document.createElement('div');
        overlay.id = 'referrerGuardOverlay';
        overlay.innerHTML = `
            <style>
                #referrerGuardOverlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }

                #referrerGuardContent {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.4s ease-out;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                #referrerGuardContent .icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                }

                #referrerGuardContent h1 {
                    color: #333;
                    font-size: 28px;
                    margin-bottom: 16px;
                    font-weight: 600;
                }

                #referrerGuardContent p {
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                #referrerGuardContent .info {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    color: #495057;
                }

                #referrerGuardContent .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    padding: 14px 32px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                #referrerGuardContent .button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                }

                #referrerGuardContent .debug-info {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                    font-size: 12px;
                    color: #adb5bd;
                    font-family: 'Courier New', monospace;
                }

                @media (max-width: 480px) {
                    #referrerGuardContent {
                        padding: 30px 20px;
                    }

                    #referrerGuardContent h1 {
                        font-size: 24px;
                    }

                    #referrerGuardContent p {
                        font-size: 14px;
                    }
                }
            </style>
            <div id="referrerGuardContent">
                <div class="icon">🔒</div>
                <h1>無法直接存取此頁面</h1>
                <p>為了確保活動的完整體驗，此頁面僅能透過官方連結進入。</p>
                <div class="info">
                    請使用 Comoor 提供的官方活動連結來訪問此頁面。
                </div>
                <a href="https://comoor.pse.is/" class="button">前往官方連結</a>
                ${this.config.debugMode ? `
                    <div class="debug-info">
                        Debug Info:<br>
                        Referrer: ${this.referrer || 'none'}<br>
                        Required: ${this.config.allowedReferrer}<br>
                        Bypass: ?bypass=true
                    </div>
                ` : ''}
            </div>
        `;

        // Add to page
        document.body.appendChild(overlay);

        // Prevent page interaction
        document.body.style.overflow = 'hidden';
    }

    // Initialize guard
    init() {
        const isValid = this.validateReferrer();

        if (!isValid) {
            // Delay showing error to prevent flash on valid pages
            setTimeout(() => {
                this.showAccessDenied();
            }, this.config.errorDisplayDelay);
        } else {
            // Set global flag
            window.REFERRER_ACCESS_GRANTED = true;
        }

        return isValid;
    }
}

// Auto-initialize when script loads
(function() {
    const guard = new ReferrerGuard(REFERRER_GUARD_CONFIG);
    const accessGranted = guard.init();

    // Make guard instance available globally
    window.ReferrerGuard = guard;

    // Log status
    if (REFERRER_GUARD_CONFIG.debugMode) {
        console.log(`🛡️ Referrer Guard initialized: ${accessGranted ? 'Access granted' : 'Access denied'}`);
        if (guard.bypassMode) {
            console.log('⚠️ Running in bypass mode - for development only');
        }
    }
})();
