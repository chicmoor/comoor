// Check for dev mode parameter
const urlParams = new URLSearchParams(window.location.search);
const isDevMode = urlParams.get('dev') === 'true';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
    cooldownHours: isDevMode ? 0.002778 : 1, // 10 seconds in dev mode, 1 hour in normal mode
    cooldownMs: isDevMode ? 10 * 1000 : 1 * 60 * 60 * 1000, // 10 seconds or 1 hour in milliseconds
    gracePeriodMs: 5 * 60 * 1000, // 5 minutes grace period
    debugMode: true // Set to true for development
};

// Log dev mode status
if (isDevMode) {
    console.log('🔧 DEV MODE ACTIVE: Cooldown reduced to 10 seconds for testing');
}

// Advanced Fingerprinting System
class DeviceFingerprinter {
    constructor() {
        this.fingerprint = null;
        this.components = {};
    }

    // Generate device fingerprint from multiple sources
    async generateFingerprint() {
        try {
            // Basic device characteristics
            this.components.screen = this.getScreenFingerprint();
            this.components.timezone = this.getTimezoneFingerprint();
            this.components.language = this.getLanguageFingerprint();
            this.components.platform = this.getPlatformFingerprint();

            // Browser characteristics
            this.components.userAgent = this.getUserAgentFingerprint();
            this.components.plugins = this.getPluginsFingerprint();
            this.components.fonts = await this.getFontsFingerprint();

            // Advanced fingerprinting
            this.components.canvas = this.getCanvasFingerprint();
            this.components.webgl = this.getWebGLFingerprint();
            this.components.audio = await this.getAudioFingerprint();

            // Combine all components into final fingerprint
            const combinedData = Object.values(this.components).join('|');
            this.fingerprint = await this.hashString(combinedData);

            if (RATE_LIMIT_CONFIG.debugMode) {
                console.log('🔍 Fingerprint Components:', this.components);
                console.log('🔒 Final Fingerprint Hash:', this.fingerprint);
            }

            return this.fingerprint;
        } catch (error) {
            console.warn('⚠️ Fingerprinting error:', error);
            // Fallback to basic fingerprint
            return await this.hashString(navigator.userAgent + screen.width + screen.height);
        }
    }

    // Screen characteristics
    getScreenFingerprint() {
        return `${screen.width}x${screen.height}x${screen.colorDepth}x${screen.pixelDepth}x${window.devicePixelRatio || 1}`;
    }

    // Timezone information
    getTimezoneFingerprint() {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = new Date().getTimezoneOffset();
        return `${tz}|${offset}`;
    }

    // Language preferences
    getLanguageFingerprint() {
        const languages = navigator.languages || [navigator.language];
        return languages.join(',') + '|' + navigator.language;
    }

    // Platform information
    getPlatformFingerprint() {
        return `${navigator.platform}|${navigator.hardwareConcurrency || 0}|${navigator.maxTouchPoints || 0}`;
    }

    // User agent (sanitized)
    getUserAgentFingerprint() {
        return navigator.userAgent.replace(/\d+\.\d+\.\d+/g, 'X.X.X'); // Remove version numbers for privacy
    }

    // Browser plugins
    getPluginsFingerprint() {
        if (!navigator.plugins) return 'no-plugins';
        const plugins = Array.from(navigator.plugins).map(p => p.name).sort();
        return plugins.slice(0, 10).join('|'); // Limit to first 10 plugins
    }

    // Font detection (simplified)
    async getFontsFingerprint() {
        const testFonts = ['Arial', 'Times', 'Courier', 'Helvetica', 'Georgia', 'Verdana'];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let fontString = '';

        testFonts.forEach(font => {
            ctx.font = `12px ${font}`;
            const width = ctx.measureText('Test123!@#').width;
            fontString += `${font}:${width}|`;
        });

        return fontString;
    }

    // Canvas fingerprinting
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Draw various shapes and text
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Canvas fingerprint 🎨', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Canvas fingerprint 🎨', 4, 17);

            // Add some geometric shapes
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath();
            ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();

            return canvas.toDataURL().slice(-50); // Last 50 chars for efficiency
        } catch (error) {
            return 'canvas-error';
        }
    }

    // WebGL fingerprinting
    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) return 'no-webgl';

            const renderer = gl.getParameter(gl.RENDERER);
            const vendor = gl.getParameter(gl.VENDOR);
            const version = gl.getParameter(gl.VERSION);

            return `${vendor}|${renderer}|${version}`.slice(0, 100);
        } catch (error) {
            return 'webgl-error';
        }
    }

    // Audio context fingerprinting
    async getAudioFingerprint() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return 'no-audio';

            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const analyser = context.createAnalyser();
            const gain = context.createGain();
            const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

            gain.gain.value = 0; // Mute
            oscillator.type = 'triangle';
            oscillator.frequency.value = 10000;

            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gain);
            gain.connect(context.destination);

            oscillator.start(0);

            return new Promise((resolve) => {
                let fingerprint = '';

                scriptProcessor.onaudioprocess = function(bins) {
                    const freqData = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(freqData);

                    // Use first few frequency bins as fingerprint
                    fingerprint = Array.from(freqData.slice(0, 10)).join('');

                    oscillator.stop();
                    context.close();
                    resolve(fingerprint || 'audio-silent');
                };

                // Fallback timeout
                setTimeout(() => {
                    oscillator.stop();
                    context.close();
                    resolve('audio-timeout');
                }, 1000);
            });

        } catch (error) {
            return 'audio-error';
        }
    }

    // Hash string using Web Crypto API
    async hashString(str) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            // Fallback simple hash
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash).toString(16);
        }
    }
}

// Multi-layer Storage System
class RateLimitStorage {
    constructor(fingerprinter) {
        this.fingerprinter = fingerprinter;
        this.storageKeys = {
            main: 'card_rate_limit_v2',
            backup: 'card_rate_limit_backup_v2',
            session: 'card_rate_limit_session_v2',
            attempts: 'card_bypass_attempts_v2'
        };
    }

    // Store rate limit data across multiple storage mechanisms
    async storeRateLimit(timestamp, fingerprint) {
        const data = {
            timestamp: timestamp,
            fingerprint: fingerprint,
            version: 2,
            created: Date.now()
        };

        try {
            // Primary storage
            localStorage.setItem(this.storageKeys.main, JSON.stringify(data));

            // Backup storage
            localStorage.setItem(this.storageKeys.backup, JSON.stringify(data));

            // Session storage
            sessionStorage.setItem(this.storageKeys.session, JSON.stringify(data));

            // IndexedDB storage (if available)
            await this.storeInIndexedDB(data);

            if (RATE_LIMIT_CONFIG.debugMode) {
                console.log('💾 Rate limit stored:', data);
            }
        } catch (error) {
            console.warn('⚠️ Storage error:', error);
        }
    }

    // Retrieve and validate rate limit data
    async getRateLimit() {
        try {
            // Try multiple storage sources
            const sources = [
                () => localStorage.getItem(this.storageKeys.main),
                () => localStorage.getItem(this.storageKeys.backup),
                () => sessionStorage.getItem(this.storageKeys.session),
                () => this.getFromIndexedDB()
            ];

            for (const getSource of sources) {
                try {
                    const stored = await getSource();
                    if (stored) {
                        const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
                        if (this.validateStoredData(data)) {
                            return data;
                        }
                    }
                } catch (error) {
                    continue; // Try next source
                }
            }

            return null;
        } catch (error) {
            console.warn('⚠️ Rate limit retrieval error:', error);
            return null;
        }
    }

    // Validate stored data integrity
    validateStoredData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.timestamp || !data.fingerprint || !data.version) return false;
        if (data.version !== 2) return false;
        if (isNaN(data.timestamp) || data.timestamp <= 0) return false;

        // Check if data is too old (more than 24 hours)
        const maxAge = 24 * 60 * 60 * 1000;
        if (Date.now() - data.created > maxAge) return false;

        return true;
    }

    // IndexedDB storage (advanced)
    async storeInIndexedDB(data) {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('CardRateLimit', 1);

                request.onerror = () => resolve(false);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('rateLimit')) {
                        db.createObjectStore('rateLimit', { keyPath: 'id' });
                    }
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;

                    if (!db.objectStoreNames.contains('rateLimit')) {
                        db.close();
                        resolve(false);
                        return;
                    }

                    try {
                        const transaction = db.transaction(['rateLimit'], 'readwrite');
                        const store = transaction.objectStore('rateLimit');

                        const storeData = { ...data, id: 'current' };
                        const putRequest = store.put(storeData);

                        putRequest.onsuccess = () => {
                            // Success handled by transaction.oncomplete
                        };

                        putRequest.onerror = () => {
                            db.close();
                            resolve(false);
                        };

                        transaction.oncomplete = () => {
                            db.close();
                            resolve(true);
                        };

                        transaction.onerror = () => {
                            db.close();
                            resolve(false);
                        };
                    } catch (transactionError) {
                        db.close();
                        resolve(false);
                    }
                };
            } catch (error) {
                resolve(false);
            }
        });
    }

    // Retrieve from IndexedDB
    async getFromIndexedDB() {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('CardRateLimit', 1);

                request.onerror = () => resolve(null);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('rateLimit')) {
                        db.createObjectStore('rateLimit', { keyPath: 'id' });
                    }
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;

                    if (!db.objectStoreNames.contains('rateLimit')) {
                        db.close();
                        resolve(null);
                        return;
                    }

                    try {
                        const transaction = db.transaction(['rateLimit'], 'readonly');
                        const store = transaction.objectStore('rateLimit');
                        const getRequest = store.get('current');

                        getRequest.onsuccess = () => {
                            db.close();
                            resolve(getRequest.result || null);
                        };

                        getRequest.onerror = () => {
                            db.close();
                            resolve(null);
                        };

                        transaction.onerror = () => {
                            db.close();
                            resolve(null);
                        };
                    } catch (transactionError) {
                        db.close();
                        resolve(null);
                    }
                };
            } catch (error) {
                resolve(null);
            }
        });
    }


    // Clear all rate limit data
    clearAll() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });

            // Clear IndexedDB
            indexedDB.deleteDatabase('CardRateLimit');

            console.log('🗑️ All rate limit data cleared');
        } catch (error) {
            console.warn('⚠️ Error clearing rate limit data:', error);
        }
    }
}

// Rate Limiting Logic with Progressive Penalties
class RateLimitManager {
    constructor() {
        this.fingerprinter = new DeviceFingerprinter();
        this.storage = new RateLimitStorage(this.fingerprinter);
        this.currentFingerprint = null;
        this.isRateLimited = false;
        this.cooldownEndTime = null;
        this.penaltyMultiplier = 1;
    }

    // Initialize rate limiting system
    async initialize() {
        try {
            // Generate current device fingerprint
            this.currentFingerprint = await this.fingerprinter.generateFingerprint();

            // Check existing rate limit
            const existingLimit = await this.storage.getRateLimit();

            if (existingLimit) {
                const result = await this.checkRateLimit(existingLimit);
                return result;
            }

            // No existing rate limit
            return { allowed: true, reason: 'no_previous_limit' };

        } catch (error) {
            console.warn('⚠️ Rate limit initialization error:', error);
            // Allow access on error to avoid blocking legitimate users
            return { allowed: true, reason: 'initialization_error' };
        }
    }

    // Check if current request is rate limited
    async checkRateLimit(existingData) {
        const now = Date.now();
        const timeSinceLastCard = now - existingData.timestamp;

        // Use base cooldown period (no penalties)
        const effectiveCooldown = RATE_LIMIT_CONFIG.cooldownMs;

        if (RATE_LIMIT_CONFIG.debugMode) {
            console.log('🕒 Rate limit check:', {
                timeSinceLastCard: Math.round(timeSinceLastCard / 1000 / 60) + ' minutes',
                effectiveCooldown: Math.round(effectiveCooldown / 1000 / 60) + ' minutes'
            });
        }

        // Check if cooldown period has passed
        if (timeSinceLastCard >= effectiveCooldown) {
            // Cooldown has passed - check fingerprint match
            const fingerprintMatch = await this.compareFingerprintsWithFuzzyMatching(
                existingData.fingerprint,
                this.currentFingerprint
            );

            if (fingerprintMatch.isMatch) {
                if (fingerprintMatch.confidence > 0.9) {
                    // High confidence match - allow
                    return { allowed: true, reason: 'cooldown_passed_verified' };
                } else {
                    // Lower confidence - allow
                    return { allowed: true, reason: 'cooldown_passed_partial_match' };
                }
            } else {
                // Different device/browser - allow access
                return { allowed: true, reason: 'different_device' };
            }
        }

        // Still in cooldown period
        this.isRateLimited = true;
        this.cooldownEndTime = existingData.timestamp + effectiveCooldown;

        return {
            allowed: false,
            reason: 'rate_limited',
            remainingTime: this.cooldownEndTime - now
        };
    }

    // Fuzzy fingerprint matching with confidence scoring
    async compareFingerprintsWithFuzzyMatching(storedFingerprint, currentFingerprint) {
        if (!storedFingerprint || !currentFingerprint) {
            return { isMatch: false, confidence: 0 };
        }

        // Exact match
        if (storedFingerprint === currentFingerprint) {
            return { isMatch: true, confidence: 1.0 };
        }

        try {
            // Compare individual fingerprint components for partial matching
            const storedComponents = this.fingerprinter.components;
            const currentComponents = this.fingerprinter.components;

            let matchingComponents = 0;
            let totalComponents = 0;
            let criticalMatches = 0;

            // Critical components that are unlikely to change
            const criticalKeys = ['screen', 'platform', 'canvas', 'webgl'];

            for (const [key, value] of Object.entries(currentComponents)) {
                totalComponents++;

                if (storedComponents[key] === value) {
                    matchingComponents++;
                    if (criticalKeys.includes(key)) {
                        criticalMatches++;
                    }
                }
            }

            const basicConfidence = matchingComponents / totalComponents;
            const criticalConfidence = criticalMatches / criticalKeys.length;

            // Weighted confidence (70% basic + 30% critical components)
            const finalConfidence = (basicConfidence * 0.7) + (criticalConfidence * 0.3);

            const isMatch = finalConfidence >= 0.6; // 60% threshold for match

            if (RATE_LIMIT_CONFIG.debugMode) {
                console.log('🔍 Fingerprint comparison:', {
                    basicConfidence: basicConfidence.toFixed(2),
                    criticalConfidence: criticalConfidence.toFixed(2),
                    finalConfidence: finalConfidence.toFixed(2),
                    isMatch,
                    matchingComponents,
                    totalComponents,
                    criticalMatches
                });
            }

            return { isMatch, confidence: finalConfidence };

        } catch (error) {
            console.warn('⚠️ Fingerprint comparison error:', error);
            // Fallback to string similarity
            const similarity = this.calculateStringSimilarity(storedFingerprint, currentFingerprint);
            return { isMatch: similarity > 0.8, confidence: similarity };
        }
    }

    // Simple string similarity calculation (Levenshtein-based)
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    // Calculate Levenshtein distance between two strings
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    // Record a new card request
    async recordCardRequest() {
        const timestamp = Date.now();
        await this.storage.storeRateLimit(timestamp, this.currentFingerprint);

        if (RATE_LIMIT_CONFIG.debugMode) {
            console.log('📝 Card request recorded:', {
                timestamp: new Date(timestamp).toLocaleString(),
                fingerprint: this.currentFingerprint.slice(0, 16) + '...'
            });
        }
    }

    // Get remaining cooldown time in milliseconds
    getRemainingCooldownTime() {
        if (!this.isRateLimited || !this.cooldownEndTime) return 0;
        const remaining = this.cooldownEndTime - Date.now();
        return Math.max(0, remaining);
    }

    // Format remaining time for display
    formatRemainingTime(ms) {
        const minutes = Math.ceil(ms / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
            return `${hours}小時${remainingMinutes > 0 ? remainingMinutes + '分鐘' : ''}`;
        } else {
            return `${minutes}分鐘`;
        }
    }

    // Clear all rate limiting data (for debugging)
    clearAllData() {
        this.storage.clearAll();
        this.isRateLimited = false;
        this.cooldownEndTime = null;
        this.penaltyMultiplier = 1;
        console.log('🗑️ Rate limiting data cleared');
    }
}

// Loading UI Manager
class LoadingUI {
    constructor() {
        this.overlayElement = null;
    }

    // Show loading spinner with Chinese message
    showLoadingOverlay() {
        // Create overlay element that covers entire viewport
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'loading-overlay';
        this.overlayElement.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-title">卡片準備中～</div>
            <div class="loading-subtitle">看看你今天的運勢如何？</div>
        `;

        // Append to body for full viewport coverage
        document.body.appendChild(this.overlayElement);

        console.log('⏳ Loading overlay displayed');
    }

    // Hide loading overlay
    hideLoadingOverlay() {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
            console.log('✅ Loading overlay hidden');
        }
    }

    // Show loading for specified duration
    async showLoadingFor(durationMs) {
        this.showLoadingOverlay();
        return new Promise(resolve => {
            setTimeout(() => {
                this.hideLoadingOverlay();
                resolve();
            }, durationMs);
        });
    }
}

// Rate Limit UI Manager
class RateLimitUI {
    constructor(rateLimitManager) {
        this.rateLimitManager = rateLimitManager;
        this.countdownInterval = null;
        this.overlayElement = null;
    }

    // Show rate limit overlay with countdown
    showRateLimitOverlay(rateLimitResult) {
        const container = document.querySelector('.image-container');

        // Blur the card image
        const cardImage = document.getElementById('cardImage');
        if (cardImage) {
            cardImage.classList.add('card-placeholder');
        }

        // Create overlay element
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'rate-limit-overlay';
        this.overlayElement.innerHTML = this.generateOverlayHTML(rateLimitResult);

        container.appendChild(this.overlayElement);

        // Start countdown timer
        this.startCountdown(rateLimitResult.remainingTime);

        // Log rate limit event
        if (RATE_LIMIT_CONFIG.debugMode) {
            console.log('🚫 Rate limit overlay displayed:', rateLimitResult);
        }
    }

    // Generate HTML content for the overlay
    generateOverlayHTML(rateLimitResult) {
        const message = '您今天已經抽過卡片了！<br>請稍後再來，每人每小時只能抽取一次。';
        const icon = '⏰';

        let html = `
            <div class="rate-limit-icon">${icon}</div>
            <div class="rate-limit-title">抽卡冷卻中</div>
            <div class="rate-limit-message">${message}</div>

            <div class="countdown-container">
                <div class="countdown-label">下次可抽卡時間</div>
                <div class="countdown-time" id="countdown-display">--:--</div>
            </div>

            <div class="rate-limit-details">
                為了公平性，每位使用者每小時只能抽取一張卡片<br>
                感謝您的理解與配合 🙏
            </div>
        `;

        // Add debug info if in debug mode
        if (RATE_LIMIT_CONFIG.debugMode) {
            html += `
                <div class="debug-info">
                    Debug: ${rateLimitResult.reason}<br>
                    FP: ${this.rateLimitManager.currentFingerprint?.slice(0, 8)}...
                </div>
            `;
        }

        return html;
    }

    // Start countdown timer
    startCountdown(remainingTimeMs) {
        const countdownDisplay = document.getElementById('countdown-display');
        if (!countdownDisplay) return;

        // Clear any existing interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        const updateCountdown = () => {
            const remaining = this.rateLimitManager.getRemainingCooldownTime();

            if (remaining <= 0) {
                // Cooldown finished - refresh the page or remove overlay
                this.hideRateLimitOverlay();
                this.refreshPage();
                return;
            }

            // Format time display
            const totalMinutes = Math.ceil(remaining / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            let timeDisplay;
            if (hours > 0) {
                timeDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            } else {
                timeDisplay = `00:${minutes.toString().padStart(2, '0')}`;
            }

            countdownDisplay.textContent = timeDisplay;

            // Update title for additional context
            if (hours > 0) {
                countdownDisplay.style.fontSize = '24px';
            }
        };

        // Update immediately
        updateCountdown();

        // Update every second
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Hide rate limit overlay
    hideRateLimitOverlay() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }

        // Remove blur from card image
        const cardImage = document.getElementById('cardImage');
        if (cardImage) {
            cardImage.classList.remove('card-placeholder');
        }

        if (RATE_LIMIT_CONFIG.debugMode) {
            console.log('✅ Rate limit overlay hidden');
        }
    }

    // Refresh page after cooldown
    refreshPage() {
        if (RATE_LIMIT_CONFIG.debugMode) {
            console.log('🔄 Cooldown finished - refreshing page');
        }

        // Small delay to show completion
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    // Show success message when card is allowed
    showSuccessMessage() {
        // Optional: Brief success animation or message
        const container = document.querySelector('.image-container');

        const successIndicator = document.createElement('div');
        successIndicator.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 100;
            animation: fadeIn 0.5s ease-out;
        `;
        successIndicator.textContent = '✅ 新卡片已生成';

        container.appendChild(successIndicator);

        // Remove after 3 seconds
        setTimeout(() => {
            successIndicator.remove();
        }, 3000);
    }

    // Clean up resources
    destroy() {
        this.hideRateLimitOverlay();
    }
}

// ===========================================
// CONTACT FORM MANAGEMENT (UC-06)
// ===========================================
// ContactFormManager is now in /js/contact-collection.js
// It will be loaded via <script> tag in card.html

// Image data (equal probability for all images)
const images = [
    "assets/images/S__172548136.jpg",
    "assets/images/S__172548137.jpg",
    "assets/images/S__172548138.jpg",
    "assets/images/S__172548139.jpg",
    "assets/images/S__172548140.jpg"
];

// Google Sheets CSV URL with CORS proxy
const SHEET_ID = '1ecyT2EcO6shL61eaANXyIS4izuQPlL4eWwJt07GwHPE';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const TEXT_PROBABILITY_SHEET_URL = CORS_PROXY + encodeURIComponent(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`);

// Fallback texts with equal probabilities
const fallbackTexts = [
    { text: "今天很開心", probability: 0.2, won: 0 },
    { text: "昨天很美好", probability: 0.2, won: 0 },
    { text: "很期待明天", probability: 0.2, won: 0 },
    { text: "這兩天都是好天氣", probability: 0.2, won: 0 },
    { text: "會是一個好年的！", probability: 0.2, won: 0 }
];

// Global texts array that will be populated from sheets or fallback
let texts = [...fallbackTexts];

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Weighted random selection for texts based on probabilities
function getWeightedRandomText(texts) {
    const totalWeight = texts.reduce((sum, textObj) => sum + textObj.probability, 0);
    let random = Math.random() * totalWeight;

    for (let textObj of texts) {
        random -= textObj.probability;
        if (random <= 0) {
            return textObj;
        }
    }

    // Fallback to last text if something goes wrong
    return texts[texts.length - 1];
}

// Validate if CSV data looks like text probability data (3 columns: text, probability, won)
function validateTextProbabilitySheet(csvData) {
    const lines = csvData.trim().split('\n');
    if (lines.length === 0) return false;

    // Check first few lines for expected format
    let validLines = 0;
    for (let i = 0; i < Math.min(3, lines.length); i++) {
        const parts = lines[i].split(',').map(part => part.replace(/^\"|\"$/g, '').trim());
        if (parts.length >= 2) {
            const probability = parseFloat(parts[1]);
            if (!isNaN(probability) && probability > 0) {
                validLines++;
            }
        }
    }

    const isValid = validLines > 0;
    console.log(`🔍 Text probability sheet validation: ${isValid ? '✅ VALID' : '❌ INVALID'} (${validLines}/${Math.min(3, lines.length)} lines have text with numeric probabilities)`);
    return isValid;
}

// Parse CSV data for text probabilities
function parseTextProbabilityCSV(csvData) {
    const lines = csvData.trim().split('\n');
    const textsFromSheet = [];

    console.log('📊 Raw CSV data from "金句" sheet (expecting text,probability,won format):');
    console.log(csvData);
    console.log('📋 Expected format: "Text content,0.5,1" (text in column 1, probability number in column 2, won flag in column 3)');

    // Validate sheet format
    if (!validateTextProbabilitySheet(csvData)) {
        console.warn('⚠️  Warning: CSV data does not appear to have probabilities in column 2!');
        console.warn('Current data appears to have text,S__identifier format instead of text,probability,won');
        console.warn('Please update the sheet to have probability numbers in column 2 and won flags (0/1) in column 3');
    }

    console.log('📋 Processing CSV lines:');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`Line ${i + 1}: "${line}"`);

        // Handle CSV parsing - split by comma and clean quotes
        const parts = line.split(',').map(part => part.replace(/^\"|\"$/g, '').trim());
        console.log(`  Raw parts: [${parts.map(p => `"${p}"`).join(', ')}]`);

        if (parts.length >= 2) {
            const text = parts[0];
            const secondColumn = parts[1];
            const thirdColumn = parts[2] || '0'; // Default to 0 if third column is missing
            const probability = parseFloat(secondColumn);
            const won = parseInt(thirdColumn);

            console.log(`  → Text: "${text}"`);
            console.log(`  → Second column: "${secondColumn}"`);
            console.log(`  → Third column: "${thirdColumn}"`);
            console.log(`  → Parsed probability: ${probability} (valid: ${!isNaN(probability)})`);
            console.log(`  → Parsed won flag: ${won} (valid: ${!isNaN(won)})`);

            if (text && !isNaN(probability) && probability > 0) {
                textsFromSheet.push({
                    text: text,
                    probability: probability,
                    won: !isNaN(won) ? won : 0
                });
                console.log(`  ✅ Added: "${text}" = ${probability}, won=${!isNaN(won) ? won : 0}`);
            } else {
                console.log(`  ❌ Skipped: ${!text ? 'empty text' : isNaN(probability) ? 'second column is not a valid number' : 'probability <= 0'}`);
            }
        } else if (parts.length === 1 && parts[0]) {
            // Handle single column case
            const text = parts[0];
            console.log(`  → Single column text: "${text}"`);
            console.log(`  ❌ Skipped: no probability column found`);
        } else {
            console.log(`  ❌ Skipped: insufficient data`);
        }
    }

    console.log('🎯 Final texts with probabilities:', textsFromSheet);
    console.log(`📈 Successfully parsed ${textsFromSheet.length} texts with valid probabilities`);

    return textsFromSheet.length > 0 ? textsFromSheet : fallbackTexts;
}


// Clear all caches (for debugging/development)
function clearAllCaches() {
    localStorage.removeItem('card_texts_probabilities_cache');
    localStorage.removeItem('card_texts_probabilities_cache_time');
    localStorage.removeItem('card_texts_cache');
    localStorage.removeItem('card_texts_cache_time');
    localStorage.removeItem('card_probabilities_cache');
    localStorage.removeItem('card_probabilities_cache_time');
    console.log('🗑️  All caches cleared - will fetch fresh data from Google Sheets');
}


// Load texts with probabilities from Google Sheets with caching
async function loadTextsWithProbabilities() {
    const CACHE_KEY = 'card_texts_probabilities_cache';
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

    try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        const cacheTime = localStorage.getItem(CACHE_KEY + '_time');

        if (cached && cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age < CACHE_DURATION) {
                console.log('📚 Using cached texts with probabilities (cached ' + Math.round(age/1000) + ' seconds ago)');
                console.log('💡 To fetch fresh data, open browser console and run: clearAllCaches(); then refresh');
                texts = JSON.parse(cached);
                logTextSummary();
                return;
            } else {
                console.log('⏰ Cache expired, fetching fresh data...');
            }
        } else {
            console.log('📥 No cache found, fetching fresh data...');
        }

        // Fetch from Google Sheets
        console.log('🔗 Fetching texts with probabilities from "金句" sheet (gid=0)...');
        const response = await fetch(TEXT_PROBABILITY_SHEET_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const csvData = await response.text();
        const newTexts = parseTextProbabilityCSV(csvData);

        // Update texts and cache
        texts = newTexts;
        localStorage.setItem(CACHE_KEY, JSON.stringify(newTexts));
        localStorage.setItem(CACHE_KEY + '_time', Date.now().toString());

        console.log(`🎉 Successfully loaded ${texts.length} texts with probabilities from Google Sheets!`);
        logTextSummary();

    } catch (error) {
        console.error('❌ Failed to load texts from "金句" sheet:', error.message);
        console.log('📋 Error details:', {
            url: TEXT_PROBABILITY_SHEET_URL,
            gid: '0',
            sheetName: '金句'
        });
        console.log('🔄 Using fallback hardcoded texts with equal probabilities');
        texts = [...fallbackTexts];

        // Clear invalid cache
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_KEY + '_time');
    }
}

// Log summary of text probabilities
function logTextSummary() {
    const totalProbability = texts.reduce((sum, textObj) => sum + textObj.probability, 0);
    console.log('✨ Final text probabilities:');
    texts.forEach(textObj => {
        const percentage = ((textObj.probability / totalProbability) * 100).toFixed(1);
        const winnerStatus = textObj.won === 1 ? '🏆 WINNER' : '';
        console.log(`  📝 "${textObj.text}": ${textObj.probability} (${percentage}%) ${winnerStatus}`);
    });
    console.log(`📊 Total probability weight: ${totalProbability}`);
}

function initializeCard() {
    const randomImage = getRandomItem(images);
    const randomText = getWeightedRandomText(texts);

    console.log(`🖼️  Selected image: ${randomImage} (random selection)`);
    console.log(`📝 Selected text: "${randomText.text}" (probability: ${randomText.probability}, won: ${randomText.won})`);

    const textOverlay = document.getElementById('textOverlay');
    document.getElementById('cardImage').src = randomImage;
    textOverlay.textContent = randomText.text;

    // Handle winner - show contact form instead of external link
    if (randomText.won === 1) {
        textOverlay.href = '#';
        textOverlay.removeAttribute('target');
        textOverlay.classList.add('winner-link');
        textOverlay.onclick = function(e) {
            e.preventDefault();
            if (contactFormManager) {
                contactFormManager.showForm();
            }
        };
        console.log(`🏆 Winner detected! Clicking text will show contact form`);
    } else {
        textOverlay.href = '#';
        textOverlay.removeAttribute('target');
        textOverlay.classList.remove('winner-link');
        textOverlay.onclick = function(e) { e.preventDefault(); };
    }
}

// Global rate limiting system
let rateLimitManager = null;
let rateLimitUI = null;
let loadingUI = null;
let contactFormManager = null;

// Initialize the application with rate limiting and loading spinner
async function initializeApp() {
    console.log('🚀 Initializing Card Application with Advanced Rate Limiting...');
    console.log('📚 Google Sheets Configuration:');
    console.log(`  Sheet ID: ${SHEET_ID}`);
    console.log(`  "金句" sheet (with probabilities): gid=0`);

    try {
        // Initialize UI managers
        loadingUI = new LoadingUI();
        rateLimitManager = new RateLimitManager();
        rateLimitUI = new RateLimitUI(rateLimitManager);
        contactFormManager = new ContactFormManager();

        // Show loading spinner first
        console.log('⏳ Showing loading spinner...');
        loadingUI.showLoadingOverlay();

        // Initialize rate limiting system (in background during loading)
        console.log('🔒 Initializing rate limiting system...');
        const rateLimitResult = await rateLimitManager.initialize();

        // Load texts with probabilities (during loading time)
        console.log('📥 Loading texts from Google Sheets...');
        const loadTextsPromise = loadTextsWithProbabilities();

        // Wait for minimum loading time (3 seconds) and data loading
        await Promise.all([
            new Promise(resolve => setTimeout(resolve, 3000)), // 3 second minimum
            loadTextsPromise
        ]);

        // Hide loading spinner
        loadingUI.hideLoadingOverlay();

        console.log('🔍 Rate limit check result:', rateLimitResult);

        // Check if user is rate limited
        if (!rateLimitResult.allowed) {
            console.log('🚫 User is rate limited:', rateLimitResult.reason);

            // Show placeholder card
            initializePlaceholderCard();

            // Show rate limit overlay
            rateLimitUI.showRateLimitOverlay(rateLimitResult);

            console.log('⏰ Rate limit overlay displayed');
            return;
        }

        // User is allowed - proceed normally
        console.log('✅ Rate limit check passed:', rateLimitResult.reason);

        // Initialize the card
        initializeCard();

        // Record this card request
        await rateLimitManager.recordCardRequest();

        // Show brief success indicator
        if (rateLimitResult.reason !== 'no_previous_limit') {
            rateLimitUI.showSuccessMessage();
        }

        // Summary
        console.log('📊 Initialization Summary:');
        console.log(`  Available texts: ${texts.length}`);
        console.log(`  Available images: ${images.length} (equal probability)`);
        const totalTextWeight = texts.reduce((sum, textObj) => sum + textObj.probability, 0);
        console.log(`  Total text probability weight: ${totalTextWeight}`);
        console.log('✅ Card application ready with rate limiting active!');

    } catch (error) {
        console.error('❌ Initialization error:', error);

        // Hide loading spinner on error
        if (loadingUI) {
            loadingUI.hideLoadingOverlay();
        }

        // Fallback to basic functionality without rate limiting
        console.log('🔄 Falling back to basic mode without rate limiting...');
        await loadTextsWithProbabilities();
        initializeCard();

        console.log('⚠️ Application running in fallback mode');
    }
}

// Initialize placeholder card (for rate limited users)
function initializePlaceholderCard() {
    // Show a generic placeholder image and text
    const placeholderImage = images[0]; // Use first image as placeholder
    const placeholderText = "請稍後再來抽卡";

    document.getElementById('cardImage').src = placeholderImage;
    document.getElementById('textOverlay').textContent = placeholderText;

    // Remove any links
    const textOverlay = document.getElementById('textOverlay');
    textOverlay.href = '#';
    textOverlay.removeAttribute('target');
    textOverlay.classList.remove('winner-link');
    textOverlay.onclick = function(e) { e.preventDefault(); };
}

// ===========================================
// DEBUGGING AND CONFIGURATION TOOLS
// ===========================================

// Global debugging interface
window.CardRateLimit = {
    // Configuration
    config: RATE_LIMIT_CONFIG,

    // Core functions
    manager: () => rateLimitManager,
    ui: () => rateLimitUI,

    // Debugging functions
    debug: {
        enable: () => {
            RATE_LIMIT_CONFIG.debugMode = true;
            console.log('🔍 Debug mode enabled');
        },
        disable: () => {
            RATE_LIMIT_CONFIG.debugMode = false;
            console.log('🔍 Debug mode disabled');
        },
        status: () => {
            if (!rateLimitManager) {
                console.log('❌ Rate limit manager not initialized');
                return;
            }

            const status = {
                isRateLimited: rateLimitManager.isRateLimited,
                cooldownEndTime: rateLimitManager.cooldownEndTime,
                currentFingerprint: rateLimitManager.currentFingerprint?.slice(0, 16) + '...',
                remainingTime: rateLimitManager.formatRemainingTime(rateLimitManager.getRemainingCooldownTime())
            };

            console.table(status);
            return status;
        },
        fingerprint: async () => {
            if (!rateLimitManager) {
                console.log('❌ Rate limit manager not initialized');
                return;
            }

            console.log('🔒 Current Fingerprint Components:');
            console.table(rateLimitManager.fingerprinter.components);
            console.log('🔑 Full Fingerprint Hash:', rateLimitManager.currentFingerprint);
            return rateLimitManager.fingerprinter.components;
        }
    },

    // Administrative functions
    admin: {
        clearAll: () => {
            if (rateLimitManager) {
                rateLimitManager.clearAllData();
            }
            clearAllCaches();
            console.log('🗑️ All data cleared - refresh page to test');
        },
        forceRateLimit: async (minutes = 60) => {
            if (rateLimitManager) {
                const futureTime = Date.now() - (RATE_LIMIT_CONFIG.cooldownMs - minutes * 60 * 1000);
                await rateLimitManager.storage.storeRateLimit(futureTime, rateLimitManager.currentFingerprint);
                console.log(`⏰ Forced rate limit for ${minutes} minutes - refresh to see effect`);
            }
        },
        setCooldown: (hours) => {
            RATE_LIMIT_CONFIG.cooldownHours = hours;
            RATE_LIMIT_CONFIG.cooldownMs = hours * 60 * 60 * 1000;
            console.log(`⚙️ Cooldown period set to ${hours} hours`);
        },
        testFingerprint: async () => {
            if (!rateLimitManager) {
                console.log('❌ Rate limit manager not initialized');
                return;
            }

            console.log('🧪 Testing fingerprint generation...');
            const fp1 = await rateLimitManager.fingerprinter.generateFingerprint();
            const fp2 = await rateLimitManager.fingerprinter.generateFingerprint();

            console.log('Fingerprint 1:', fp1);
            console.log('Fingerprint 2:', fp2);
            console.log('Match:', fp1 === fp2);

            return { fp1, fp2, match: fp1 === fp2 };
        }
    },

    // Legacy functions for compatibility
    clearAllCaches: clearAllCaches,
    initializeApp: initializeApp
};

// Make debugging functions available globally for easy access
window.clearAllCaches = clearAllCaches;
window.initializeApp = initializeApp;

// Helper functions for console usage
window.debugRateLimit = () => window.CardRateLimit.debug.enable();
window.clearRateLimit = () => window.CardRateLimit.admin.clearAll();
window.statusRateLimit = () => window.CardRateLimit.debug.status();

// Add development shortcuts
if (RATE_LIMIT_CONFIG.debugMode) {
    console.log('🔍 Debug mode active - additional logging enabled');
}

// Initialize the card when page loads
window.addEventListener('load', initializeApp);
