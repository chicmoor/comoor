// ===========================================
// WINNER CONTACT COLLECTION MODULE
// Use Case 06: Winner Contact Collection
// ===========================================
//
// This module handles the contact form functionality for winners
// who draw a card with won=1 flag. It manages:
// - Contact form modal display and interaction
// - Form validation and submission
// - Google Apps Script Web App integration
// - Success/error message handling
//
// Usage:
//   const contactFormManager = new ContactFormManager();
//   contactFormManager.showForm(); // Show the contact form modal
//   contactFormManager.hideForm(); // Hide the contact form modal
//
// Dependencies:
//   - HTML: Contact form elements in card.html (contactFormOverlay, contactForm, etc.)
//   - CSS: Contact form styles in css/contact-form.css
//
// ===========================================

/**
 * ContactFormManager
 *
 * Manages the winner contact form modal for collecting winner information.
 * Handles form validation, submission to Google Sheets via Apps Script,
 * and user feedback (success/error messages).
 */
class ContactFormManager {
    constructor() {
        this.overlay = null;
        this.form = null;
        this.isSubmitting = false;
        this.initialize();
    }

    // Initialize contact form elements and event listeners
    initialize() {
        this.overlay = document.getElementById('contactFormOverlay');
        this.form = document.getElementById('contactForm');

        if (!this.overlay || !this.form) {
            console.error('❌ Contact form elements not found');
            return;
        }

        // Bind event listeners
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        document.getElementById('cancelButton').addEventListener('click', this.hideForm.bind(this));

        // Close form when clicking overlay background
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hideForm();
            }
        });

        // Close form on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('show')) {
                this.hideForm();
            }
        });

        console.log('✅ Contact form manager initialized');
    }

    // Show the contact form modal
    showForm() {
        if (!this.overlay) return;

        // Reset form state
        this.resetForm();

        // Set prize title from appConfig (loaded in card.js)
        const prizeTitleInput = document.getElementById('prizeTitle');
        if (prizeTitleInput && typeof appConfig !== 'undefined') {
            prizeTitleInput.value = appConfig.prizeTitle || '精美禮品';
            console.log(`🎁 Prize title set to: "${prizeTitleInput.value}"`);
        }

        // Show overlay
        this.overlay.classList.add('show');

        // Track form shown
        if (window.pushToDataLayer) {
            window.pushToDataLayer('contact_form_shown', {
                prize_title: prizeTitleInput?.value || 'Unknown',
                timestamp: Date.now()
            });
        }

        // Focus on first editable input (account, not prize title)
        setTimeout(() => {
            const accountInput = document.getElementById('account');
            if (accountInput) accountInput.focus();
        }, 300);

        console.log('📝 Contact form shown');
    }

    // Hide the contact form modal
    hideForm() {
        if (!this.overlay) return;

        // Track form hidden
        if (window.pushToDataLayer) {
            window.pushToDataLayer('contact_form_hidden', {
                submission_completed: this.overlay.querySelector('#formSuccess')?.classList.contains('show') || false
            });
        }

        this.overlay.classList.remove('show');
        this.resetForm();

        console.log('❌ Contact form hidden');
    }

    // Reset form to initial state
    resetForm() {
        if (!this.form) return;

        // Reset form fields
        this.form.reset();

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

        console.log('📤 Contact form submission started');

        // Validate form
        if (!this.validateForm()) {
            console.log('❌ Form validation failed');
            return;
        }

        // Get form data
        const formData = this.getFormData();
        console.log('📋 Form data:', formData);

        // Track submission start
        const submissionStartTime = Date.now();
        if (window.pushToDataLayer) {
            window.pushToDataLayer('contact_form_submission_start', {
                prize_title: formData.prizeTitle,
                has_account: !!formData.account,
                has_phone: !!formData.phone,
                message_length: formData.message?.length || 0
            });
        }

        // Set loading state
        this.setSubmissionState(true);

        try {
            // Submit to Google Sheets
            await this.submitToGoogleSheets(formData);

            // Track submission success
            if (window.pushToDataLayer) {
                window.pushToDataLayer('contact_form_submission_success', {
                    prize_title: formData.prizeTitle,
                    submission_method: 'web_app',
                    time_to_submit_ms: Date.now() - submissionStartTime
                });
            }

            // Show success message
            this.showSuccess();

            // Auto-close form after 3 seconds
            setTimeout(() => {
                this.hideForm();
            }, 3000);

            console.log('✅ Form submitted successfully');

        } catch (error) {
            console.error('❌ Form submission failed:', error);

            // Track submission error
            if (window.pushToDataLayer) {
                window.pushToDataLayer('contact_form_submission_error', {
                    error_message: error.message || 'Unknown error',
                    error_type: error.name || 'Error',
                    retry_available: true
                });
            }

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

        // Validate account
        const account = document.getElementById('account').value.trim();
        if (!account) {
            this.showFieldError('account', '請輸入您的官網帳號');
            isValid = false;
        } else if (account.length < 2) {
            this.showFieldError('account', '官網帳號至少需要2個字');
            isValid = false;
        }

        // Validate phone
        const phone = document.getElementById('phone').value.trim();
        if (!phone) {
            this.showFieldError('phone', '請輸入連絡電話');
            isValid = false;
        } else if (!/^[\d\-\+\(\)\s]+$/.test(phone) || phone.length < 8) {
            this.showFieldError('phone', '請輸入有效的連絡電話');
            isValid = false;
        }

        // Validate recipient name
        const recipientName = document.getElementById('recipientName').value.trim();
        if (!recipientName) {
            this.showFieldError('recipientName', '請輸入收件人姓名');
            isValid = false;
        } else if (recipientName.length < 2) {
            this.showFieldError('recipientName', '收件人姓名至少需要2個字');
            isValid = false;
        }

        // Validate address
        const address = document.getElementById('address').value.trim();
        if (!address) {
            this.showFieldError('address', '請輸入收件地址');
            isValid = false;
        } else if (address.length < 10) {
            this.showFieldError('address', '請輸入完整的收件地址');
            isValid = false;
        }

        // Validate message
        const message = document.getElementById('message').value.trim();
        if (!message) {
            this.showFieldError('message', '請輸入您想說的話');
            isValid = false;
        } else if (message.length < 5) {
            this.showFieldError('message', '訊息至少需要5個字');
            isValid = false;
        }

        // Track validation errors
        if (!isValid && window.pushToDataLayer) {
            const errorFields = [];
            if (!account || account.length < 2) errorFields.push('account');
            if (!phone || phone.length < 8) errorFields.push('phone');
            if (!recipientName || recipientName.length < 2) errorFields.push('recipientName');
            if (!address || address.length < 10) errorFields.push('address');
            if (!message || message.length < 5) errorFields.push('message');

            window.pushToDataLayer('contact_form_validation_error', {
                invalid_fields: errorFields,
                error_count: errorFields.length
            });
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
        const fields = ['account', 'phone', 'recipientName', 'address', 'message'];
        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorElement = document.getElementById(fieldName + 'Error');

            if (field) {
                field.classList.remove('error');
            }

            if (errorElement) {
                errorElement.classList.remove('show');
            }
        });
    }

    // Get form data as object
    getFormData() {
        return {
            prizeTitle: document.getElementById('prizeTitle').value.trim(),
            account: document.getElementById('account').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            recipientName: document.getElementById('recipientName').value.trim(),
            address: document.getElementById('address').value.trim(),
            message: document.getElementById('message').value.trim(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }

    // Set form submission state
    setSubmissionState(isSubmitting) {
        this.isSubmitting = isSubmitting;

        const submitButton = document.getElementById('submitButton');
        const submitText = document.getElementById('submitText');
        const submitLoading = document.getElementById('submitLoading');

        if (submitButton) {
            submitButton.disabled = isSubmitting;
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
        const successElement = document.getElementById('formSuccess');
        if (successElement) {
            successElement.classList.add('show');
        }
    }

    // Show error message
    showError(message) {
        this.hideMessages();
        const errorElement = document.getElementById('formError');
        if (errorElement) {
            if (message) {
                errorElement.textContent = `❌ ${message}`;
            }
            errorElement.classList.add('show');
        }
    }

    // Hide success/error messages
    hideMessages() {
        const successElement = document.getElementById('formSuccess');
        const errorElement = document.getElementById('formError');

        if (successElement) {
            successElement.classList.remove('show');
        }

        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    // Submit form data to Google Sheets
    async submitToGoogleSheets(formData) {
        // Configuration for Google Sheets submission
        const CONTACT_SHEET_CONFIG = {
            // Google Apps Script Web App URL
            webAppUrl: 'https://script.google.com/macros/s/AKfycbxJ04YQhMx3KzzUAohIOMdcSOd5c1e280FAXLcYSd9J5JzZ-DWDr5_9eBZivRdpFN3xaw/exec'
        };

        try {
            console.log('📊 Submitting to Google Sheets:', formData);
            return await this.submitViaWebApp(formData, CONTACT_SHEET_CONFIG.webAppUrl);
        } catch (error) {
            console.error('❌ Google Sheets submission failed:', error);
            throw new Error(`提交失败: ${error.message}`);
        }
    }

    // Submit via Google Apps Script Web App
    async submitViaWebApp(formData, webAppUrl) {
        // Create FormData to avoid CORS preflight (no custom headers)
        const formDataObj = new FormData();
        formDataObj.append('data', JSON.stringify(formData));

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

    // Submit via Google Sheets API
    async submitViaAPI(formData, config) {
        const { apiKey, sheetId } = config;

        try {
            // First, get the sheet metadata to find the correct sheet name for gid 2018488710
            const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`;
            const metadataResponse = await fetch(metadataUrl);

            if (!metadataResponse.ok) {
                throw new Error(`Failed to get sheet metadata: ${metadataResponse.status}`);
            }

            const metadata = await metadataResponse.json();
            console.log('📋 Sheet metadata retrieved:', metadata.properties.title);

            // Find the sheet with gid 2018488710
            const targetGid = 2018488710;
            const targetSheet = metadata.sheets.find(sheet => sheet.properties.sheetId === targetGid);

            if (!targetSheet) {
                throw new Error(`Sheet with gid ${targetGid} not found`);
            }

            const sheetName = targetSheet.properties.title;
            console.log(`📄 Found target sheet: "${sheetName}" (gid: ${targetGid})`);

            // Prepare the row data with new fields
            const rowData = [
                new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
                formData.prizeTitle,
                formData.account,
                formData.phone,
                formData.recipientName,
                formData.address,
                formData.message,
                formData.userAgent
            ];

            // Use the correct sheet name in the range (8 columns: timestamp, prizeTitle, account, phone, recipientName, address, message, userAgent)
            const range = `${sheetName}!A:H`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW&key=${apiKey}`;

            console.log(`📊 Submitting to range: ${range}`);
            console.log('📝 Data being submitted:', rowData);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [rowData]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Sheets API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Google Sheets API submission successful:', result);
            console.log(`📍 Data added to ${result.updates.updatedRange}`);

            return {
                success: true,
                method: 'google_sheets_api',
                sheetName: sheetName,
                range: result.updates.updatedRange,
                rowsAdded: result.updates.updatedRows
            };

        } catch (error) {
            console.error('❌ Google Sheets API submission failed:', error);
            throw error;
        }
    }

    // Fallback: Log to console (for development/testing)
    async logToConsole(formData) {
        return new Promise((resolve) => {
            console.log('📋 Contact Form Submission (Manual Collection Required):');
            console.log('='.repeat(60));
            console.log(`時間: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`);
            console.log(`獎品名稱: ${formData.prizeTitle}`);
            console.log(`官網帳號: ${formData.account}`);
            console.log(`連絡電話: ${formData.phone}`);
            console.log(`收件姓名: ${formData.recipientName}`);
            console.log(`收件地址: ${formData.address}`);
            console.log(`想對 Comoor 說的話: ${formData.message}`);
            console.log(`瀏覽器: ${formData.userAgent}`);
            console.log('='.repeat(60));
            console.log('💡 To enable automatic Google Sheets submission:');
            console.log('   1. Set up Google Sheets API key, or');
            console.log('   2. Create a Google Apps Script Web App, or');
            console.log('   3. Configure alternative service URL');

            // Simulate successful submission after logging
            setTimeout(() => {
                resolve({
                    success: true,
                    method: 'console_log',
                    message: 'Data logged to console for manual collection'
                });
            }, 1000);
        });
    }
}

// Export ContactFormManager to global scope for use in card.js
window.ContactFormManager = ContactFormManager;
