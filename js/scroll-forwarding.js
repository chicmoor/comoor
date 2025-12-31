/**
 * ScrollForwardingManager
 *
 * Forwards scroll events from anywhere on the page to a specific target element.
 * Useful for making scrollable content respond to global scroll gestures.
 *
 * Features:
 * - Smart activation (only when target needs scrolling)
 * - Boundary detection (prevents scrolling past top/bottom)
 * - Desktop (wheel) and mobile (touch) support
 * - Configurable sensitivity and behavior
 */
class ScrollForwardingManager {
    constructor(config = {}) {
        // Merge default config with user config
        this.config = {
            enabled: true,                              // Master enable/disable
            passthrough: false,                          // If false, prevent page scroll
            forwardToElement: '.text-overlay-description', // Target element selector
            sensitivity: 1.0,                           // Scroll speed multiplier
            minDelta: 1,                                // Minimum delta to process
            maxDelta: 150,                              // Maximum delta per event
            logDebug: false,                             // Console logging (enabled for debugging)
            ...config
        };

        // State
        this.descriptionElement = null;
        this.lastTouchY = null;
        this.isActive = false;

        // Bind methods to preserve context
        this.handleWheel = this.handleWheel.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    /**
     * Initialize the scroll forwarding system
     * Checks if target element needs scrolling and sets up event listeners
     */
    initialize() {
        if (!this.config.enabled) {
            this.log('ScrollForwarding disabled by config');
            return;
        }

        // Get target element
        this.descriptionElement = document.querySelector(this.config.forwardToElement);

        if (!this.descriptionElement) {
            console.warn(`ScrollForwarding: Target element "${this.config.forwardToElement}" not found`);
            return;
        }

        // Check if element needs scrolling (smart activation)
        const needsScrolling = this.needsScrolling();

        if (!needsScrolling) {
            this.log('Description does not need scrolling, forwarding not activated');
            return;
        }

        // Attach event listeners
        this.attachEventListeners();
        this.isActive = true;

        this.log('ScrollForwarding initialized successfully');
        this.log(`Target: ${this.config.forwardToElement}`);
        this.log(`Passthrough: ${this.config.passthrough}`);
        this.log(`Sensitivity: ${this.config.sensitivity}`);
    }

    /**
     * Check if description element needs scrolling
     * @returns {boolean} True if scrollHeight exceeds clientHeight
     */
    needsScrolling() {
        if (!this.descriptionElement) return false;

        const scrollHeight = this.descriptionElement.scrollHeight;
        const clientHeight = this.descriptionElement.clientHeight;
        const needsScroll = scrollHeight > clientHeight;

        this.log(`ScrollHeight: ${scrollHeight}, ClientHeight: ${clientHeight}, Needs scroll: ${needsScroll}`);

        return needsScroll;
    }

    /**
     * Attach event listeners for wheel and touch events
     */
    attachEventListeners() {
        // Desktop: wheel event
        window.addEventListener('wheel', this.handleWheel, { passive: false });

        // Mobile: touch events
        document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd, { passive: false });

        this.log('Event listeners attached');
    }

    /**
     * Handle desktop mouse wheel events
     * @param {WheelEvent} event - The wheel event
     */
    handleWheel(event) {
        if (!this.isActive) return;

        // Skip if focus is in an input/textarea (allow normal form interaction)
        if (this.isInputFocused()) {
            return;
        }

        // Normalize delta based on deltaMode
        let delta = this.normalizeDelta(event);

        // Apply sensitivity
        delta *= this.config.sensitivity;

        // Clamp delta
        delta = this.clampDelta(delta);

        // Check boundaries
        if (this.isBoundary(delta)) {
            this.log('At boundary, not forwarding');
            return;
        }

        // Forward scroll to description element
        this.descriptionElement.scrollTop += delta;

        // Prevent page scroll (based on config)
        if (!this.config.passthrough) {
            event.preventDefault();
        }

        this.log(`Wheel delta: ${delta.toFixed(2)}, scrollTop: ${this.descriptionElement.scrollTop.toFixed(2)}`);
    }

    /**
     * Handle touch start event (for mobile)
     * @param {TouchEvent} event - The touch start event
     */
    handleTouchStart(event) {
        if (!this.isActive) return;

        if (event.touches.length > 0) {
            this.lastTouchY = event.touches[0].clientY;
        }
    }

    /**
     * Handle touch move event (for mobile)
     * @param {TouchEvent} event - The touch move event
     */
    handleTouchMove(event) {
        if (!this.isActive || this.lastTouchY === null) return;

        // Skip if focus is in an input/textarea
        if (this.isInputFocused()) {
            return;
        }

        if (event.touches.length > 0) {
            const currentTouchY = event.touches[0].clientY;

            // Calculate delta (negative = scroll down, positive = scroll up)
            let delta = this.lastTouchY - currentTouchY;

            // Apply sensitivity
            delta *= this.config.sensitivity;

            // Clamp delta
            delta = this.clampDelta(delta);

            // Check boundaries
            if (this.isBoundary(delta)) {
                this.log('At boundary, not forwarding (touch)');
                return;
            }

            // Forward scroll to description element
            this.descriptionElement.scrollTop += delta;

            // Update last touch position
            this.lastTouchY = currentTouchY;

            // Prevent page scroll (based on config)
            if (!this.config.passthrough) {
                event.preventDefault();
            }

            this.log(`Touch delta: ${delta.toFixed(2)}, scrollTop: ${this.descriptionElement.scrollTop.toFixed(2)}`);
        }
    }

    /**
     * Handle touch end event (for mobile)
     * @param {TouchEvent} event - The touch end event
     */
    handleTouchEnd(event) {
        this.lastTouchY = null;
    }

    /**
     * Normalize wheel delta based on deltaMode
     * @param {WheelEvent} event - The wheel event
     * @returns {number} Normalized delta in pixels
     */
    normalizeDelta(event) {
        let delta = event.deltaY;

        // Normalize based on deltaMode
        // 0 = pixels (DOM_DELTA_PIXEL)
        // 1 = lines (DOM_DELTA_LINE)
        // 2 = pages (DOM_DELTA_PAGE)
        if (event.deltaMode === 1) {
            // Lines: convert to pixels (1 line ≈ 16px)
            delta *= 16;
        } else if (event.deltaMode === 2) {
            // Pages: convert to pixels (1 page = viewport height)
            delta *= window.innerHeight;
        }

        return delta;
    }

    /**
     * Clamp delta to min/max values
     * @param {number} delta - The delta value
     * @returns {number} Clamped delta
     */
    clampDelta(delta) {
        const sign = Math.sign(delta);
        const absDelta = Math.abs(delta);

        // Apply min/max
        if (absDelta < this.config.minDelta) {
            return 0;
        }
        if (absDelta > this.config.maxDelta) {
            return sign * this.config.maxDelta;
        }

        return delta;
    }

    /**
     * Check if we're at a scroll boundary
     * @param {number} delta - The scroll delta (positive = down, negative = up)
     * @returns {boolean} True if at boundary and trying to scroll further
     */
    isBoundary(delta) {
        if (!this.descriptionElement) return true;

        const scrollTop = this.descriptionElement.scrollTop;
        const scrollHeight = this.descriptionElement.scrollHeight;
        const clientHeight = this.descriptionElement.clientHeight;

        // At top and trying to scroll up
        if (scrollTop <= 0 && delta < 0) {
            return true;
        }

        // At bottom and trying to scroll down
        // Use -1 tolerance for rounding errors
        if (scrollTop + clientHeight >= scrollHeight - 1 && delta > 0) {
            return true;
        }

        return false;
    }

    /**
     * Check if an input or textarea currently has focus
     * @returns {boolean} True if input element is focused
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
    }

    /**
     * Remove event listeners and deactivate
     */
    destroy() {
        if (!this.isActive) return;

        // Remove event listeners
        window.removeEventListener('wheel', this.handleWheel);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);

        this.isActive = false;
        this.descriptionElement = null;
        this.lastTouchY = null;

        this.log('ScrollForwarding destroyed');
    }

    /**
     * Log debug messages if enabled
     * @param {string} message - The message to log
     */
    log(message) {
        if (this.config.logDebug) {
            console.log(`[ScrollForwarding] ${message}`);
        }
    }
}

// Make class available globally
window.ScrollForwardingManager = ScrollForwardingManager;
