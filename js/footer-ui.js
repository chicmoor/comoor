// ===========================================
// FOOTER UI MODULE
// Unified comment input with like functionality
// ===========================================
//
// This module handles the footer bar with comment input and like button.
// It replaces:
//   - Heart icon logic from card.js (lines 1539-1587)
//   - Comment panel from comment-collection.js
//
// Features:
//   - Inline comment input with real-time character counter
//   - Conditional send icon (appears when typing)
//   - Heart like button with animation
//   - Google Sheets comment submission
//   - GA4 event tracking
//   - Mobile keyboard handling
//   - Toast notifications
//
// Dependencies:
//   - HTML: Footer UI elements in card.html/card-simple.html
//   - CSS: Footer UI styles in css/footer-ui.css
//   - Google Apps Script Web App (for comment submission)
//
// ===========================================

/**
 * FooterUIManager
 *
 * Manages the footer UI for comment input and like functionality.
 * Handles user interactions, form validation, submission to Google Sheets,
 * and provides visual feedback through toast notifications.
 */
class FooterUIManager {
    constructor() {
        // DOM element references
        this.footer = null;
        this.input = null;
        this.sendIcon = null;
        this.heartIcon = null;
        this.charCounter = null;
        this.toast = null;

        // State management
        this.isSubmitting = false;
        this.hasLiked = false;
        this.currentStory = null;
        this.toastTimeout = null;

        // Initialize
        this.initialize();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    /**
     * Initialize footer UI manager
     * Gets DOM elements and sets up all event listeners
     */
    initialize() {
        // Get DOM elements
        this.footer = document.getElementById('footerUI');
        this.input = document.getElementById('footerInput');
        this.sendIcon = document.getElementById('footerSendIcon');
        this.heartIcon = document.getElementById('footerHeartIcon');
        this.charCounter = document.getElementById('footerCharCounter');
        this.toast = document.getElementById('footerToast');

        // Validate required elements
        if (!this.footer || !this.input || !this.sendIcon || !this.heartIcon) {
            console.error('❌ Footer UI: Required elements not found');
            return;
        }

        // Set up event listeners
        this.setupInputEvents();
        this.setupSendIconEvents();
        this.setupHeartIconEvents();
        this.setupKeyboardHandling();

        console.log('✅ Footer UI manager initialized');
    }

    // ============================================
    // EVENT LISTENER SETUP
    // ============================================

    /**
     * Set up input field event listeners
     * Handles: text input, character counter, send icon visibility, Enter key
     */
    setupInputEvents() {
        // Input event - update send icon visibility and character counter
        this.input.addEventListener('input', () => {
            const value = this.input.value.trim();
            const length = this.input.value.length; // Use full length (with spaces)

            // Toggle send icon visibility based on content
            if (value) {
                this.sendIcon.classList.add('visible');
            } else {
                this.sendIcon.classList.remove('visible');
            }

            // Update character counter
            if (this.charCounter) {
                this.charCounter.textContent = `${length}/500`;
                this.charCounter.classList.toggle('visible', length > 0);
                this.charCounter.classList.remove('warning', 'limit');

                // Color-coded warnings
                if (length >= 500) {
                    this.charCounter.classList.add('limit');
                } else if (length >= 450) {
                    this.charCounter.classList.add('warning');
                }
            }
        });

        // Keydown event - submit on Enter (not Shift+Enter)
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit();
            }
        });
    }

    /**
     * Set up send icon event listeners
     * Handles: click to submit comment
     */
    setupSendIconEvents() {
        this.sendIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleSubmit();
        });
    }

    /**
     * Set up heart icon event listeners
     * Handles: click to like, animation, state toggle
     */
    setupHeartIconEvents() {
        this.heartIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleLike();
        });
    }

    /**
     * Set up mobile keyboard handling
     * Ensures input remains visible when keyboard appears
     */
    setupKeyboardHandling() {
        // Focus event - scroll input into view on mobile
        this.input.addEventListener('focus', () => {
            setTimeout(() => {
                this.input.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300); // Wait for keyboard animation
        });

        // Visual Viewport API for keyboard detection
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                const keyboardVisible = window.visualViewport.height < window.innerHeight;

                if (keyboardVisible && document.activeElement === this.input) {
                    // Keyboard is showing and input is focused
                    // Footer stays at bottom due to position: fixed
                    // No additional action needed
                }
            });
        }
    }

    // ============================================
    // HEART LIKE FUNCTIONALITY
    // ============================================

    /**
     * Handle heart icon click
     * Toggles between outline and filled states, triggers animation, tracks to GA4
     */
    handleLike() {
        // Only allow one like per story
        if (!this.hasLiked) {
            this.hasLiked = true;
            // Change to filled heart SVG
            this.updateHeartIcon(true);
        }

        // Trigger heartbeat animation
        this.heartIcon.classList.add('liked');
        setTimeout(() => {
            this.heartIcon.classList.remove('liked');
        }, 600);

        // Track to GA4
        if (window.pushToDataLayer) {
            window.pushToDataLayer('story_liked', {
                story_text: this.currentStory?.title || 'Unknown',
                story_description: this.currentStory?.description?.substring(0, 100) || '',
                is_winner: this.currentStory?.won === 1,
                selected_image: this.currentStory?.image || '',
                text_probability: this.currentStory?.probability || 0,
                time_on_page_ms: Date.now() - (window.pageLoadTime || Date.now())
            });
        }

        console.log('❤️ Story liked:', this.currentStory?.title);
    }

    /**
     * Update heart icon between outline and filled states
     * @param {boolean} filled - True for filled heart, false for outline
     */
    updateHeartIcon(filled) {
        if (!this.heartIcon) return;

        // Get SVG markup from data attributes
        const outlineSVG = this.heartIcon.dataset.outline;
        const filledSVG = this.heartIcon.dataset.filled;

        if (!outlineSVG || !filledSVG) {
            console.warn('⚠️ Heart icon SVG data attributes not found');
            return;
        }

        // Update SVG content
        this.heartIcon.innerHTML = filled ? filledSVG : outlineSVG;
    }

    // ============================================
    // COMMENT SUBMISSION
    // ============================================

    /**
     * Handle comment submission
     * Validates input, submits to Google Sheets, shows success/error feedback
     */
    async handleSubmit() {
        const value = this.input.value.trim();

        // Validation
        if (!value) {
            this.showToast('請輸入留言內容', 'error');
            return;
        }

        if (value.length < 5) {
            this.showToast('請輸入至少 5 個字的留言', 'error');
            return;
        }

        if (this.input.value.length > 500) {
            this.showToast('留言不能超過 500 個字', 'error');
            return;
        }

        // Prevent double submission
        if (this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;
        this.setInputState(false); // Disable input

        console.log('📤 Submitting comment:', value);

        // Track submission start time
        const submissionStartTime = Date.now();

        try {
            // Submit to Google Sheets
            await this.submitToGoogleSheets({
                commentText: value,
                storyTitle: this.currentStory?.title || 'Unknown Story',
                storyDescription: this.currentStory?.description?.substring(0, 100) || '',
                isWinner: this.currentStory?.won === 1,
                selectedImage: this.currentStory?.image || '',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            });

            // Track success to GA4
            if (window.pushToDataLayer) {
                window.pushToDataLayer('comment_submission_success', {
                    story_title: this.currentStory?.title,
                    comment_length: value.length,
                    is_winner: this.currentStory?.won === 1,
                    time_to_submit_ms: Date.now() - submissionStartTime
                });
            }

            // Show success message
            this.showToast('讓心意在此安放，成為故事溫柔的註解。', 'success');

            // Clear input and reset UI
            this.input.value = '';

            // Dispatch input event to trigger visibility update
            this.input.dispatchEvent(new Event('input', { bubbles: true }));

            console.log('✅ Comment submitted successfully');

        } catch (error) {
            console.error('❌ Comment submission failed:', error);
            this.showToast('心意沒有成功傳遞，請稍後再試', 'error');
        } finally {
            this.isSubmitting = false;
            this.setInputState(true); // Re-enable input
        }
    }

    /**
     * Submit comment data to Google Sheets via Apps Script Web App
     * @param {Object} formData - Comment data to submit
     * @returns {Promise} Submission result
     */
    async submitToGoogleSheets(formData) {
        // Google Apps Script Web App URL (same as existing comment system)
        const webAppUrl = 'https://script.google.com/macros/s/AKfycbxJ04YQhMx3KzzUAohIOMdcSOd5c1e280FAXLcYSd9J5JzZ-DWDr5_9eBZivRdpFN3xaw/exec';

        try {
            console.log('📊 Submitting to Google Sheets:', formData);

            // Create FormData to avoid CORS preflight (no custom headers)
            const formDataObj = new FormData();
            formDataObj.append('data', JSON.stringify(formData));
            formDataObj.append('type', 'comment'); // Distinguish from contact form

            const response = await fetch(webAppUrl, {
                method: 'POST',
                body: formDataObj
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Web App submission failed: ${response.status} - ${text}`);
            }

            const result = await response.json();
            console.log('✅ Google Sheets submission successful:', result);
            return result;

        } catch (error) {
            console.error('❌ Google Sheets submission error:', error);
            throw new Error(`送出失敗: ${error.message}`);
        }
    }

    // ============================================
    // UI STATE MANAGEMENT
    // ============================================

    /**
     * Enable or disable input field
     * @param {boolean} enabled - True to enable, false to disable
     */
    setInputState(enabled) {
        this.input.disabled = !enabled;
        if (this.sendIcon) {
            this.sendIcon.style.opacity = enabled ? '1' : '0.5';
            this.sendIcon.style.pointerEvents = enabled ? 'auto' : 'none';
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type: 'info', 'success', 'error'
     * @param {number} duration - Display duration in milliseconds (default: 3000)
     */
    showToast(message, type = 'info', duration = 3000) {
        if (!this.toast) return;

        // Clear any existing timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        // Set content and show
        this.toast.textContent = message;
        this.toast.className = `footer-toast show ${type}`;

        // Auto-hide after duration
        this.toastTimeout = setTimeout(() => {
            this.toast.classList.remove('show');
        }, duration);
    }

    // ============================================
    // STORY UPDATE & RESET
    // ============================================

    /**
     * Update current story information
     * Called from card.js when a new story is displayed
     * @param {Object} storyInfo - Story data (title, description, won, image, probability)
     */
    updateStory(storyInfo) {
        this.currentStory = storyInfo;
        this.hasLiked = false;
        this.updateHeartIcon(false); // Reset to outline
        console.log('📖 Footer UI: Story updated -', storyInfo.title);
    }

    /**
     * Reset footer UI to initial state
     * Clears input, resets heart icon, hides notifications
     */
    reset() {
        // Clear input
        this.input.value = '';
        this.sendIcon.classList.remove('visible');

        // Reset heart icon
        this.hasLiked = false;
        this.updateHeartIcon(false);

        // Reset character counter
        if (this.charCounter) {
            this.charCounter.textContent = '0/500';
            this.charCounter.classList.remove('visible', 'warning', 'limit');
        }

        // Hide toast
        if (this.toast) {
            this.toast.classList.remove('show');
        }

        // Re-enable input
        this.setInputState(true);
    }
}

// Export FooterUIManager to global scope
window.FooterUIManager = FooterUIManager;

// Auto-initialize on DOM ready if elements exist
document.addEventListener('DOMContentLoaded', () => {
    const footerElement = document.getElementById('footerUI');
    if (footerElement) {
        window.footerUIManager = new FooterUIManager();
    }
});
