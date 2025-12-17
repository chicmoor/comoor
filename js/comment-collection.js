// ===========================================
// COMMENT PANEL MODULE
// User comment feature for story feedback
// ===========================================
//
// This module handles the comment panel functionality for collecting
// user feedback and comments on stories. It manages:
// - Comment panel modal display and interaction
// - Comment icon click handling
// - Form validation and submission
// - Google Apps Script Web App integration
// - Success/error message handling
//
// Usage:
//   const commentPanelManager = new CommentPanelManager();
//   // Comment icon click is handled automatically
//
// Dependencies:
//   - HTML: Comment panel elements in card.html (commentPanelOverlay, commentForm, etc.)
//   - CSS: Comment panel styles in css/comment-panel.css
//
// ===========================================

/**
 * CommentPanelManager
 *
 * Manages the comment panel modal for collecting user comments on stories.
 * Handles form validation, submission to Google Sheets via Apps Script,
 * user feedback (success/error messages), and character counter.
 */
class CommentPanelManager {
    constructor() {
        this.overlay = null;
        this.form = null;
        this.isSubmitting = false;
        this.currentStory = null;
        this.initialize();
    }

    // Initialize comment panel elements and event listeners
    initialize() {
        this.overlay = document.getElementById('commentPanelOverlay');
        this.form = document.getElementById('commentForm');
        const commentIcon = document.getElementById('commentIcon');

        if (!this.overlay || !this.form || !commentIcon) {
            console.error('❌ Comment panel elements not found');
            return;
        }

        // Comment icon click handler
        commentIcon.addEventListener('click', (e) => {
            e.stopPropagation();

            // Animation
            commentIcon.classList.add('clicked');
            setTimeout(() => {
                commentIcon.classList.remove('clicked');
            }, 600);

            // Store current story info before showing panel
            const currentStoryInfo = this.getCurrentStory();
            this.showPanel(currentStoryInfo);

            // Track to GA4
            if (window.pushToDataLayer) {
                window.pushToDataLayer('comment_icon_clicked', {
                    story_text: currentStoryInfo?.title || 'Unknown',
                    is_winner: currentStoryInfo?.won === 1,
                    time_on_page_ms: Date.now() - window.pageLoadTime
                });
            }

            console.log('💬 Comment icon clicked');
        });

        // Form submit handler
        this.form.addEventListener('submit', this.handleSubmit.bind(this));

        // Cancel button
        const cancelButton = document.getElementById('commentCancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', this.hidePanel.bind(this));
        }

        // Close button
        const closeButton = document.getElementById('commentPanelClose');
        if (closeButton) {
            closeButton.addEventListener('click', this.hidePanel.bind(this));
        }

        // Close panel when clicking overlay background
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hidePanel();
            }
        });

        // Close panel on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('show')) {
                this.hidePanel();
            }
        });

        // Character counter
        const textarea = document.getElementById('commentText');
        const charCount = document.getElementById('charCount');
        const counter = document.querySelector('.character-counter');

        if (textarea && charCount && counter) {
            textarea.addEventListener('input', () => {
                const count = textarea.value.length;
                charCount.textContent = count;

                // Update counter styling
                counter.classList.remove('warning', 'limit');
                if (count >= 500) {
                    counter.classList.add('limit');
                } else if (count >= 450) {
                    counter.classList.add('warning');
                }
            });
        }

        console.log('✅ Comment panel manager initialized');
    }

    // Helper to get current story from text overlay elements
    getCurrentStory() {
        const titleElement = document.querySelector('.text-overlay-title');
        const descElement = document.querySelector('.text-overlay-description');
        const imageElement = document.querySelector('.card-image');

        return {
            title: titleElement?.textContent || 'Unknown Story',
            description: descElement?.textContent || '',
            won: window.currentCardIsWinner || false,
            image: imageElement?.src || ''
        };
    }

    // Show the comment panel modal
    showPanel(storyInfo) {
        if (!this.overlay) return;

        // Store current story info
        this.currentStory = storyInfo;

        // Reset form state
        this.resetForm();

        // Show overlay
        this.overlay.classList.add('show');

        // Focus on textarea
        setTimeout(() => {
            const textarea = document.getElementById('commentText');
            if (textarea) textarea.focus();
        }, 300);

        console.log('💬 Comment panel shown for story:', storyInfo.title);
    }

    // Hide the comment panel modal
    hidePanel() {
        if (!this.overlay) return;

        this.overlay.classList.remove('show');
        this.resetForm();

        console.log('❌ Comment panel hidden');
    }

    // Reset form to initial state
    resetForm() {
        if (!this.form) return;

        // Reset form fields
        this.form.reset();

        // Reset character counter
        const charCount = document.getElementById('charCount');
        const counter = document.querySelector('.character-counter');
        if (charCount) charCount.textContent = '0';
        if (counter) counter.classList.remove('warning', 'limit');

        // Clear error states
        this.clearErrors();

        // Reset submission state
        this.setSubmissionState(false);

        // Hide success/error messages
        this.hideMessages();
    }

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        console.log('📤 Comment submission started');

        // Validate form
        if (!this.validateForm()) {
            console.log('❌ Comment validation failed');
            return;
        }

        // Get form data
        const formData = this.getFormData();
        console.log('📋 Comment data:', formData);

        // Track submission time
        const submissionStartTime = Date.now();

        // Set loading state
        this.setSubmissionState(true);

        try {
            // Submit to Google Sheets
            await this.submitToGoogleSheets(formData);

            // Track submission success
            if (window.pushToDataLayer) {
                window.pushToDataLayer('comment_submission_success', {
                    story_title: this.currentStory.title,
                    comment_length: formData.commentText.length,
                    is_winner: this.currentStory.won === 1,
                    time_to_submit_ms: Date.now() - submissionStartTime
                });
            }

            // Show success message
            this.showSuccess();

            // Auto-close panel after 2 seconds
            setTimeout(() => {
                this.hidePanel();
            }, 2000);

            console.log('✅ Comment submitted successfully');

        } catch (error) {
            console.error('❌ Comment submission failed:', error);
            this.showError(error.message);
        } finally {
            this.setSubmissionState(false);
        }
    }

    // Validate form fields
    validateForm() {
        let isValid = true;

        // Clear previous errors
        this.clearErrors();

        // Validate comment text
        const commentText = document.getElementById('commentText').value.trim();
        if (!commentText) {
            this.showFieldError('commentText', '請輸入至少 5 個字的留言');
            isValid = false;
        } else if (commentText.length < 5) {
            this.showFieldError('commentText', '請輸入至少 5 個字的留言');
            isValid = false;
        }

        return isValid;
    }

    // Show field-specific error
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');

        if (field) {
            field.classList.add('error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    // Clear all field errors
    clearErrors() {
        const field = document.getElementById('commentText');
        const errorElement = document.getElementById('commentTextError');

        if (field) {
            field.classList.remove('error');
        }

        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    // Get form data as object
    getFormData() {
        return {
            commentText: document.getElementById('commentText').value.trim(),
            storyTitle: this.currentStory?.title || 'Unknown Story',
            storyDescription: this.currentStory?.description?.substring(0, 100) || '',
            isWinner: this.currentStory?.won === 1,
            selectedImage: this.currentStory?.image || '',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }

    // Set form submission state
    setSubmissionState(isSubmitting) {
        this.isSubmitting = isSubmitting;

        const submitButton = document.getElementById('commentSubmitButton');
        const submitText = document.getElementById('commentSubmitText');
        const submitLoading = document.getElementById('commentSubmitLoading');

        if (submitButton) {
            submitButton.disabled = isSubmitting;
            submitButton.classList.toggle('loading', isSubmitting);
        }

        if (submitText) {
            submitText.style.display = isSubmitting ? 'none' : 'inline';
        }

        if (submitLoading) {
            submitLoading.classList.toggle('show', isSubmitting);
        }
    }

    // Show success message
    showSuccess() {
        this.hideMessages();
        const successElement = document.getElementById('commentSuccess');
        if (successElement) {
            successElement.classList.add('show');
        }
    }

    // Show error message
    showError(message) {
        this.hideMessages();
        const errorElement = document.getElementById('commentFormError');
        if (errorElement) {
            if (message) {
                errorElement.textContent = `❌ ${message}`;
            }
            errorElement.classList.add('show');
        }
    }

    // Hide success/error messages
    hideMessages() {
        const successElement = document.getElementById('commentSuccess');
        const errorElement = document.getElementById('commentFormError');

        if (successElement) {
            successElement.classList.remove('show');
        }

        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    // Submit comment data to Google Sheets
    async submitToGoogleSheets(formData) {
        // Configuration for Google Sheets submission
        const COMMENT_SHEET_CONFIG = {
            // Google Apps Script Web App URL (same as contact form)
            webAppUrl: 'https://script.google.com/macros/s/AKfycbxJ04YQhMx3KzzUAohIOMdcSOd5c1e280FAXLcYSd9J5JzZ-DWDr5_9eBZivRdpFN3xaw/exec'
        };

        try {
            console.log('📊 Submitting comment to Google Sheets:', formData);
            return await this.submitViaWebApp(formData, COMMENT_SHEET_CONFIG.webAppUrl);
        } catch (error) {
            console.error('❌ Google Sheets submission failed:', error);
            throw new Error(`送出失败: ${error.message}`);
        }
    }

    // Submit via Google Apps Script Web App
    async submitViaWebApp(formData, webAppUrl) {
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
        console.log('✅ Web App submission successful:', result);
        return result;
    }
}

// Export CommentPanelManager to global scope for use in card.js
window.CommentPanelManager = CommentPanelManager;
