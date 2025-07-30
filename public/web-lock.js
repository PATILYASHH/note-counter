/**
 * Note Counter Web Lock System
 * Simple PIN/Password protection for the website
 * Uses localStorage for persistence
 */

class WebLock {
    constructor() {
        this.storageKey = 'notecounter_web_lock';
        this.isLockedKey = 'notecounter_is_locked';
        this.lockData = this.getLockData();
        this.init();
    }

    init() {
        // Check if lock is enabled and user hasn't unlocked in this session
        if (this.isLockEnabled() && !this.isCurrentlyUnlocked()) {
            this.showLockScreen();
        }
        
        // Add settings menu option
        this.addSettingsMenuOption();
        
        // Add keyboard shortcut listener for instant lock (Shift+L)
        this.addKeyboardShortcuts();
    }

    getLockData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : null;
    }

    saveLockData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.lockData = data;
    }

    removeLockData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.isLockedKey);
        this.lockData = null;
    }

    isLockEnabled() {
        return this.lockData && this.lockData.enabled;
    }

    isCurrentlyUnlocked() {
        return sessionStorage.getItem('notecounter_unlocked') === 'true';
    }

    setUnlocked() {
        sessionStorage.setItem('notecounter_unlocked', 'true');
    }

    addKeyboardShortcuts() {
        // Add keyboard shortcut for instant lock (Shift+L)
        document.addEventListener('keydown', (e) => {
            // Check for Shift+L combination
            if (e.shiftKey && e.key.toLowerCase() === 'l') {
                // Prevent default behavior
                e.preventDefault();
                
                // Only lock if Web Lock is enabled
                if (this.isLockEnabled()) {
                    this.instantLock();
                } else {
                    // Show a notification that Web Lock needs to be enabled
                    this.showLockNotEnabledMessage();
                }
            }
        });
    }

    instantLock() {
        // Clear the unlocked session
        sessionStorage.removeItem('notecounter_unlocked');
        
        // Show lock screen immediately
        this.showLockScreen();
        
        // Optional: Show a brief notification
        this.showLockNotification();
    }

    showLockNotEnabledMessage() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = '#ef4444';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '10002';
        notification.style.fontFamily = 'Segoe UI, sans-serif';
        notification.style.fontSize = '14px';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.innerHTML = '🔒 Web Lock not enabled! Go to Settings to enable it first.';
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showLockNotification() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = '#10b981';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '10002';
        notification.style.fontFamily = 'Segoe UI, sans-serif';
        notification.style.fontSize = '14px';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.innerHTML = '🔐 App locked! Use Shift+L for quick lock.';
        
        document.body.appendChild(notification);
        
        // Auto-remove after 2 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    addSettingsMenuOption() {
        // Provide a global method that can be called from the React settings panel
        window.showWebLockSettings = () => this.showSettingsModal();
        
        // No floating button - integration with existing React settings
    }

    showLockScreen() {
        // Create lock screen overlay
        const overlay = document.createElement('div');
        overlay.id = 'web-lock-overlay';
        overlay.innerHTML = this.getLockScreenHTML();
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = this.getLockScreenCSS();
        document.head.appendChild(style);
        
        // Add to body
        document.body.appendChild(overlay);
        
        // Hide main content
        document.body.style.overflow = 'hidden';
        const mainContent = document.querySelector('main, .app-content, #root');
        if (mainContent) {
            mainContent.style.display = 'none';
        }

        // Add event listeners
        this.addLockScreenListeners();
    }

    getLockScreenHTML() {
        const isPin = this.lockData.type === 'pin';
        const title = isPin ? 'Enter PIN' : 'Enter Password';
        const inputType = isPin ? 'number' : 'password';
        const placeholder = isPin ? 'Enter 4-digit PIN' : 'Enter password';
        const maxLength = isPin ? '4' : '';

        return `
            <div class="lock-container">
                <div class="lock-card">
                    <div class="lock-header">
                        <img src="https://yashpatil.tech/assets/images/projectimg/countnote.png" 
                             alt="Note Counter" class="lock-logo">
                        <h1>Note Counter</h1>
                        <h2>${title}</h2>
                    </div>
                    
                    <div class="lock-form">
                        <input type="${inputType}" 
                               id="lock-input" 
                               placeholder="${placeholder}"
                               ${maxLength ? `maxlength="${maxLength}"` : ''}
                               autocomplete="off"
                               autofocus>
                        
                        <button id="unlock-btn" class="unlock-btn">
                            <span id="unlock-text">Unlock</span>
                            <span id="unlock-spinner" class="spinner" style="display: none;">⟳</span>
                        </button>
                        
                        <div id="lock-error" class="lock-error" style="display: none;"></div>
                    </div>
                    
                    <div class="lock-footer">
                        <p>Enter your ${isPin ? 'PIN' : 'password'} to access Note Counter</p>
                    </div>
                </div>
                
                <div class="lock-background">
                    <div class="money-icon">💰</div>
                    <div class="money-icon">💵</div>
                    <div class="money-icon">💴</div>
                    <div class="money-icon">💶</div>
                    <div class="money-icon">💷</div>
                </div>
            </div>
        `;
    }

    getLockScreenCSS() {
        return `
            #web-lock-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .lock-container {
                position: relative;
                width: 100%;
                max-width: 400px;
                margin: 20px;
            }

            .lock-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                padding: 40px 30px;
                text-align: center;
                position: relative;
                z-index: 2;
            }

            .lock-header {
                margin-bottom: 30px;
            }

            .lock-logo {
                width: 60px;
                height: 60px;
                margin: 0 auto 15px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            }

            .lock-header h1 {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 5px 0;
            }

            .lock-header h2 {
                font-size: 18px;
                font-weight: 500;
                color: #4f46e5;
                margin: 0;
            }

            .lock-form {
                margin-bottom: 30px;
            }

            #lock-input {
                width: 100%;
                padding: 15px 20px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 16px;
                text-align: center;
                margin-bottom: 20px;
                transition: all 0.3s ease;
                outline: none;
            }

            #lock-input:focus {
                border-color: #4f46e5;
                box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            }

            .unlock-btn {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .unlock-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
            }

            .unlock-btn:active {
                transform: translateY(0);
            }

            .unlock-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }

            .spinner {
                display: inline-block;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .lock-error {
                background: #fee2e2;
                color: #dc2626;
                padding: 12px;
                border-radius: 8px;
                margin-top: 15px;
                font-size: 14px;
                border: 1px solid #fca5a5;
            }

            .lock-footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                color: #6b7280;
                font-size: 14px;
            }

            .lock-footer p {
                margin: 0 0 15px 0;
            }

            .lock-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }

            .money-icon {
                position: absolute;
                font-size: 30px;
                opacity: 0.1;
                animation: float 6s ease-in-out infinite;
            }

            .money-icon:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
            .money-icon:nth-child(2) { top: 20%; right: 15%; animation-delay: 1s; }
            .money-icon:nth-child(3) { bottom: 30%; left: 20%; animation-delay: 2s; }
            .money-icon:nth-child(4) { bottom: 15%; right: 10%; animation-delay: 3s; }
            .money-icon:nth-child(5) { top: 50%; left: 5%; animation-delay: 4s; }

            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }

            @media (max-width: 480px) {
                .lock-card {
                    margin: 20px;
                    padding: 30px 20px;
                }
                
                .lock-header h1 {
                    font-size: 20px;
                }
                
                .lock-header h2 {
                    font-size: 16px;
                }
            }
        `;
    }

    addLockScreenListeners() {
        const input = document.getElementById('lock-input');
        const unlockBtn = document.getElementById('unlock-btn');
        const errorDiv = document.getElementById('lock-error');

        // Enter key to unlock
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.attemptUnlock();
            }
        });

        // Unlock button
        unlockBtn.addEventListener('click', () => {
            this.attemptUnlock();
        });

        // Auto-submit for 4-digit PIN
        if (this.lockData.type === 'pin') {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 4) {
                    setTimeout(() => this.attemptUnlock(), 500);
                }
            });
        }
    }

    attemptUnlock() {
        const input = document.getElementById('lock-input');
        const unlockBtn = document.getElementById('unlock-btn');
        const unlockText = document.getElementById('unlock-text');
        const unlockSpinner = document.getElementById('unlock-spinner');
        const errorDiv = document.getElementById('lock-error');
        
        const enteredValue = input.value.trim();
        
        if (!enteredValue) {
            this.showError('Please enter your ' + (this.lockData.type === 'pin' ? 'PIN' : 'password'));
            return;
        }

        // Show loading state
        unlockBtn.disabled = true;
        unlockText.style.display = 'none';
        unlockSpinner.style.display = 'inline-block';
        errorDiv.style.display = 'none';

        // Simulate verification delay
        setTimeout(() => {
            if (this.verifyCredentials(enteredValue)) {
                this.unlockSuccess();
            } else {
                this.unlockFailed();
            }
        }, 1000);
    }

    verifyCredentials(value) {
        if (this.lockData.type === 'pin') {
            return value === this.lockData.pin;
        } else {
            return value === this.lockData.password;
        }
    }

    unlockSuccess() {
        const unlockBtn = document.getElementById('unlock-btn');
        const unlockText = document.getElementById('unlock-text');
        const unlockSpinner = document.getElementById('unlock-spinner');

        unlockSpinner.style.display = 'none';
        unlockText.textContent = 'Success!';
        unlockText.style.display = 'inline-block';
        unlockBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

        // Mark as unlocked
        this.setUnlocked();

        // Remove lock screen with animation
        setTimeout(() => {
            const overlay = document.getElementById('web-lock-overlay');
            overlay.style.opacity = '0';
            overlay.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
                const mainContent = document.querySelector('main, .app-content, #root');
                if (mainContent) {
                    mainContent.style.display = '';
                }
            }, 300);
        }, 1000);
    }

    unlockFailed() {
        const unlockBtn = document.getElementById('unlock-btn');
        const unlockText = document.getElementById('unlock-text');
        const unlockSpinner = document.getElementById('unlock-spinner');
        const input = document.getElementById('lock-input');

        unlockBtn.disabled = false;
        unlockSpinner.style.display = 'none';
        unlockText.textContent = 'Unlock';
        unlockText.style.display = 'inline-block';

        this.showError('Incorrect ' + (this.lockData.type === 'pin' ? 'PIN' : 'password') + '. Please try again.');
        
        // Shake animation
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
            input.style.animation = '';
            input.focus();
            input.select();
        }, 500);

        // Add shake animation CSS if not exists
        if (!document.querySelector('#shake-animation')) {
            const shakeStyle = document.createElement('style');
            shakeStyle.id = 'shake-animation';
            shakeStyle.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(shakeStyle);
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('lock-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    showSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.innerHTML = this.getSettingsModalHTML();
        
        const modalStyle = document.createElement('style');
        modalStyle.textContent = this.getSettingsModalCSS();
        document.head.appendChild(modalStyle);
        
        document.body.appendChild(modal);
        this.addSettingsModalListeners();
    }

    getSettingsModalHTML() {
        const hasLock = this.isLockEnabled();
        const lockType = hasLock ? this.lockData.type : '';

        return `
            <div class="settings-overlay">
                <div class="settings-modal">
                    <div class="settings-header">
                        <h2>🔒 Web Lock Settings</h2>
                        <button class="close-btn" id="close-settings">&times;</button>
                    </div>
                    
                    <div class="settings-content">
                        <!-- Main Toggle Section -->
                        <div class="setting-section">
                            <div class="setting-row">
                                <div class="setting-info">
                                    <h3>Web Lock Protection</h3>
                                    <p class="setting-description">Secure your Note Counter with PIN or password protection</p>
                                </div>
                                <div class="toggle-container">
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="lock-toggle" ${hasLock ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Status Display -->
                        <div class="setting-section">
                            <div class="status-card ${hasLock ? 'enabled' : 'disabled'}">
                                <div class="status-indicator">
                                    <span class="status-icon">${hasLock ? '🔒' : '🔓'}</span>
                                    <div class="status-text">
                                        <strong>${hasLock ? 'Protected' : 'Unprotected'}</strong>
                                        <span>${hasLock ? `${lockType.toUpperCase()} enabled` : 'No security set'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Configuration Section -->
                        <div class="setting-section" id="lock-config" style="${hasLock ? 'display: block;' : 'display: none;'}">
                            <h3>Security Configuration</h3>
                            
                            <!-- Current Lock Info -->
                            ${hasLock ? `
                                <div class="current-lock-info">
                                    <div class="lock-detail">
                                        <span class="lock-label">Type:</span>
                                        <span class="lock-value">${lockType === 'pin' ? '4-Digit PIN' : 'Password'}</span>
                                    </div>
                                    <div class="lock-detail">
                                        <span class="lock-label">Created:</span>
                                        <span class="lock-value">${new Date(this.lockData.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div class="action-buttons">
                                    <button class="action-btn primary" id="change-lock">
                                        <span class="btn-icon">🔄</span>
                                        Change ${lockType === 'pin' ? 'PIN' : 'Password'}
                                    </button>
                                    <button class="action-btn secondary" id="switch-lock-type">
                                        <span class="btn-icon">🔀</span>
                                        Switch to ${lockType === 'pin' ? 'Password' : 'PIN'}
                                    </button>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Setup Section -->
                        <div class="setting-section" id="lock-setup" style="${hasLock ? 'display: none;' : 'display: block;'}">
                            <h3>Choose Security Type</h3>
                            <p class="setting-description">Select how you want to protect your Note Counter application</p>
                            
                            <div class="lock-type-grid">
                                <button class="lock-type-card" id="setup-pin">
                                    <div class="card-icon">🔢</div>
                                    <div class="card-content">
                                        <h4>4-Digit PIN</h4>
                                        <p>Quick access with numeric PIN</p>
                                        <ul class="card-features">
                                            <li>✓ Fast to enter</li>
                                            <li>✓ Easy to remember</li>
                                            <li>✓ Good for personal use</li>
                                        </ul>
                                    </div>
                                </button>
                                
                                <button class="lock-type-card" id="setup-password">
                                    <div class="card-icon">�</div>
                                    <div class="card-content">
                                        <h4>Password</h4>
                                        <p>Enhanced security with text password</p>
                                        <ul class="card-features">
                                            <li>✓ Higher security</li>
                                            <li>✓ Alphanumeric support</li>
                                            <li>✓ Great for business</li>
                                        </ul>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Security Tips -->
                        <div class="setting-section">
                            <h3>Security Information</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="info-icon">🛡️</span>
                                    <div class="info-text">
                                        <strong>Local Storage</strong>
                                        <p>All data stays on your device</p>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">⏱️</span>
                                    <div class="info-text">
                                        <strong>Session Based</strong>
                                        <p>Unlock once per browser session</p>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">🔒</span>
                                    <div class="info-text">
                                        <strong>Privacy First</strong>
                                        <p>No data sent to servers</p>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">📱</span>
                                    <div class="info-text">
                                        <strong>Cross Device</strong>
                                        <p>Works on mobile and desktop</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsModalCSS() {
        return `
            .settings-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(8px);
                animation: fadeIn 0.3s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .settings-modal {
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.25);
                width: 95%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 30px;
                border-bottom: 1px solid #e5e7eb;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 20px 20px 0 0;
            }

            .settings-header h2 {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                font-size: 24px;
                color: white;
                cursor: pointer;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            }

            .close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            .settings-content {
                padding: 30px;
            }

            .setting-section {
                margin-bottom: 30px;
            }

            .setting-section:last-child {
                margin-bottom: 0;
            }

            .setting-section h3 {
                margin: 0 0 15px 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .setting-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: #f8fafc;
                border-radius: 12px;
                border: 2px solid #e2e8f0;
            }

            .setting-info h3 {
                margin: 0 0 5px 0;
                font-size: 16px;
                color: #1e293b;
            }

            .setting-description {
                color: #64748b;
                font-size: 14px;
                margin: 0;
                line-height: 1.4;
            }

            /* Toggle Switch */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 34px;
            }

            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e1;
                transition: .4s;
                border-radius: 34px;
            }

            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 26px;
                width: 26px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            input:checked + .toggle-slider {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }

            input:checked + .toggle-slider:before {
                transform: translateX(26px);
            }

            /* Status Card */
            .status-card {
                padding: 20px;
                border-radius: 12px;
                border: 2px solid;
                transition: all 0.3s ease;
            }

            .status-card.enabled {
                background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                border-color: #10b981;
                color: #065f46;
            }

            .status-card.disabled {
                background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                border-color: #ef4444;
                color: #991b1b;
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .status-icon {
                font-size: 24px;
            }

            .status-text strong {
                display: block;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 2px;
            }

            .status-text span {
                font-size: 14px;
                opacity: 0.8;
            }

            /* Current Lock Info */
            .current-lock-info {
                background: #f1f5f9;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .lock-detail {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .lock-detail:last-child {
                border-bottom: none;
            }

            .lock-label {
                font-weight: 500;
                color: #64748b;
            }

            .lock-value {
                font-weight: 600;
                color: #1e293b;
            }

            /* Action Buttons */
            .action-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }

            .action-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
            }

            .action-btn.primary {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
            }

            .action-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
            }

            .action-btn.secondary {
                background: #f1f5f9;
                color: #475569;
                border: 1px solid #cbd5e1;
            }

            .action-btn.secondary:hover {
                background: #e2e8f0;
                color: #334155;
            }

            .btn-icon {
                font-size: 16px;
            }

            /* Lock Type Grid */
            .lock-type-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }

            .lock-type-card {
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 16px;
                padding: 24px 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .lock-type-card:hover {
                border-color: #3b82f6;
                transform: translateY(-4px);
                box-shadow: 0 12px 30px rgba(59, 130, 246, 0.15);
            }

            .lock-type-card:hover .card-icon {
                transform: scale(1.1);
            }

            .card-icon {
                font-size: 36px;
                margin-bottom: 12px;
                transition: transform 0.3s ease;
            }

            .card-content h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
            }

            .card-content > p {
                margin: 0 0 16px 0;
                font-size: 14px;
                color: #64748b;
            }

            .card-features {
                list-style: none;
                padding: 0;
                margin: 0;
                text-align: left;
            }

            .card-features li {
                font-size: 12px;
                color: #475569;
                padding: 4px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            /* Info Grid */
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-top: 15px;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }

            .info-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .info-text strong {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 2px;
            }

            .info-text p {
                margin: 0;
                font-size: 12px;
                color: #64748b;
                line-height: 1.3;
            }

            /* Mobile Responsive */
            @media (max-width: 640px) {
                .settings-modal {
                    width: 95%;
                    margin: 10px;
                    max-height: 95vh;
                }
                
                .settings-header {
                    padding: 20px;
                }
                
                .settings-content {
                    padding: 20px;
                }
                
                .lock-type-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .action-buttons {
                    grid-template-columns: 1fr;
                }
                
                .info-grid {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                
                .setting-row {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }
            }

            @media (max-width: 480px) {
                .settings-header h2 {
                    font-size: 18px;
                }
                
                .card-icon {
                    font-size: 30px;
                }
                
                .lock-type-card {
                    padding: 20px 16px;
                }
            }
        `;
    }

    addSettingsModalListeners() {
        const closeBtn = document.getElementById('close-settings');
        const overlay = document.querySelector('.settings-overlay');
        const lockToggle = document.getElementById('lock-toggle');
        
        // Close modal
        closeBtn?.addEventListener('click', () => this.closeSettingsModal());
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeSettingsModal();
        });

        // Main toggle switch
        lockToggle?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.showLockTypeSelection();
            } else {
                this.disableLockWithToggle();
            }
        });

        // Setup buttons
        document.getElementById('setup-pin')?.addEventListener('click', () => this.setupLock('pin'));
        document.getElementById('setup-password')?.addEventListener('click', () => this.setupLock('password'));
        
        // Management buttons
        document.getElementById('change-lock')?.addEventListener('click', () => this.changeLock());
        document.getElementById('switch-lock-type')?.addEventListener('click', () => this.switchLockType());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('settings-modal')) {
                this.closeSettingsModal();
            }
        });
    }

    showLockTypeSelection() {
        const setupSection = document.getElementById('lock-setup');
        const configSection = document.getElementById('lock-config');
        
        if (setupSection && configSection) {
            setupSection.style.display = 'block';
            configSection.style.display = 'none';
            
            // Add a highlight effect
            setupSection.style.animation = 'slideDown 0.3s ease-out';
        }
    }

    disableLockWithToggle() {
        if (!this.isLockEnabled()) return;
        
        const currentType = this.lockData.type;
        const currentLabel = currentType === 'pin' ? 'PIN' : 'password';
        
        // Create a custom prompt modal for better UX
        this.showConfirmationModal(
            'Disable Web Lock',
            `Enter your current ${currentLabel} to disable the web lock:`,
            currentLabel,
            currentType === 'pin' ? 'number' : 'password',
            (enteredValue) => {
                if (this.verifyCredentials(enteredValue)) {
                    this.removeLockData();
                    this.updateSettingsUI();
                    this.showSuccessMessage('Web lock has been disabled successfully.');
                } else {
                    this.showErrorMessage(`Incorrect ${currentLabel}. Web lock remains enabled.`);
                    // Reset toggle
                    const toggle = document.getElementById('lock-toggle');
                    if (toggle) toggle.checked = true;
                }
            },
            () => {
                // On cancel, reset toggle
                const toggle = document.getElementById('lock-toggle');
                if (toggle) toggle.checked = true;
            }
        );
    }

    switchLockType() {
        const currentType = this.lockData.type;
        const currentLabel = currentType === 'pin' ? 'PIN' : 'password';
        const newType = currentType === 'pin' ? 'password' : 'pin';
        const newLabel = newType === 'pin' ? 'PIN' : 'password';

        this.showConfirmationModal(
            `Switch to ${newLabel.toUpperCase()}`,
            `Enter your current ${currentLabel} to continue:`,
            currentLabel,
            currentType === 'pin' ? 'number' : 'password',
            (enteredValue) => {
                if (this.verifyCredentials(enteredValue)) {
                    this.closeSettingsModal();
                    this.setupLock(newType);
                } else {
                    this.showErrorMessage(`Incorrect ${currentLabel}. Cannot switch lock type.`);
                }
            }
        );
    }

    updateSettingsUI() {
        // Close and reopen settings to refresh the UI
        this.closeSettingsModal();
        setTimeout(() => this.showSettingsModal(), 100);
    }

    showConfirmationModal(title, message, inputLabel, inputType, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'confirmation-overlay';
        modal.innerHTML = `
            <div class="confirmation-modal">
                <div class="confirmation-header">
                    <h3>${title}</h3>
                </div>
                <div class="confirmation-content">
                    <p>${message}</p>
                    <input type="${inputType}" 
                           id="confirmation-input" 
                           placeholder="Enter ${inputLabel}"
                           ${inputType === 'number' ? 'maxlength="4"' : ''}
                           autocomplete="off"
                           autofocus>
                    <div class="confirmation-buttons">
                        <button class="confirm-btn" id="confirm-action">Confirm</button>
                        <button class="cancel-btn" id="cancel-action">Cancel</button>
                    </div>
                    <div id="confirmation-error" class="confirmation-error" style="display: none;"></div>
                </div>
            </div>
        `;

        // Add styles for confirmation modal
        if (!document.querySelector('#confirmation-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'confirmation-modal-styles';
            style.textContent = `
                .confirmation-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(8px);
                }

                .confirmation-modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    width: 90%;
                    max-width: 400px;
                    overflow: hidden;
                    animation: popIn 0.3s ease-out;
                }

                @keyframes popIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .confirmation-header {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                }

                .confirmation-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .confirmation-content {
                    padding: 24px;
                }

                .confirmation-content p {
                    margin: 0 0 20px 0;
                    color: #374151;
                    font-size: 14px;
                    line-height: 1.5;
                    text-align: center;
                }

                #confirmation-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 16px;
                    text-align: center;
                    margin-bottom: 20px;
                    transition: border-color 0.3s;
                }

                #confirmation-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .confirmation-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .confirm-btn, .cancel-btn {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .confirm-btn {
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                    color: white;
                }

                .confirm-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
                }

                .cancel-btn {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .cancel-btn:hover {
                    background: #e5e7eb;
                }

                .confirmation-error {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 10px;
                    border-radius: 6px;
                    margin-top: 12px;
                    font-size: 13px;
                    text-align: center;
                    border: 1px solid #fca5a5;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        const input = document.getElementById('confirmation-input');
        const confirmBtn = document.getElementById('confirm-action');
        const cancelBtn = document.getElementById('cancel-action');
        const errorDiv = document.getElementById('confirmation-error');

        const handleConfirm = () => {
            const value = input.value.trim();
            if (!value) {
                errorDiv.textContent = `Please enter your ${inputLabel}`;
                errorDiv.style.display = 'block';
                return;
            }
            modal.remove();
            onConfirm(value);
        };

        const handleCancel = () => {
            modal.remove();
            if (onCancel) onCancel();
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') handleCancel();
        });

        // Auto-submit for 4-digit PIN
        if (inputType === 'number') {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 4) {
                    setTimeout(handleConfirm, 500);
                }
            });
        }
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add toast styles if not exists
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 24px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    font-size: 14px;
                    z-index: 10002;
                    animation: slideInRight 0.3s ease-out;
                    max-width: 300px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }

                .toast-success {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .toast-error {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                }

                .toast-info {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                }

                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    closeSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.remove();
        }
    }

    setupLock(type) {
        this.closeSettingsModal();
        
        const isPin = type === 'pin';
        const title = isPin ? 'Set 4-Digit PIN' : 'Set Password';
        const placeholder = isPin ? 'Enter 4-digit PIN' : 'Enter password (min 4 characters)';
        
        this.showInputModal(
            title,
            `Create your ${isPin ? 'PIN' : 'password'} for Note Counter protection:`,
            placeholder,
            isPin ? 'number' : 'password',
            isPin ? 4 : null,
            (value) => {
                // Validate input
                if (isPin) {
                    if (!/^\d{4}$/.test(value)) {
                        this.showErrorMessage('PIN must be exactly 4 digits!');
                        return this.setupLock(type);
                    }
                } else {
                    if (value.length < 4) {
                        this.showErrorMessage('Password must be at least 4 characters long!');
                        return this.setupLock(type);
                    }
                }
                
                // Confirm the value
                this.showInputModal(
                    'Confirm ' + (isPin ? 'PIN' : 'Password'),
                    `Please confirm your ${isPin ? 'PIN' : 'password'}:`,
                    'Confirm ' + (isPin ? 'PIN' : 'password'),
                    isPin ? 'number' : 'password',
                    isPin ? 4 : null,
                    (confirmValue) => {
                        if (confirmValue !== value) {
                            this.showErrorMessage('Values do not match. Please try again.');
                            return this.setupLock(type);
                        }
                        
                        // Save the lock
                        const lockData = {
                            enabled: true,
                            type: type,
                            [type]: value,
                            createdAt: new Date().toISOString()
                        };
                        
                        this.saveLockData(lockData);
                        this.showSuccessMessage(`Web lock has been enabled successfully! You will need to enter your ${isPin ? 'PIN' : 'password'} when you visit the website next time.`);
                        
                        // Show updated settings after a delay
                        setTimeout(() => this.showSettingsModal(), 1500);
                    },
                    () => this.setupLock(type) // On cancel, restart setup
                );
            },
            () => {
                // On cancel, show settings again
                setTimeout(() => this.showSettingsModal(), 100);
            }
        );
    }

    showInputModal(title, message, placeholder, inputType, maxLength = null, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'input-overlay';
        modal.innerHTML = `
            <div class="input-modal">
                <div class="input-header">
                    <h3>${title}</h3>
                </div>
                <div class="input-content">
                    <p>${message}</p>
                    <input type="${inputType}" 
                           id="input-field" 
                           placeholder="${placeholder}"
                           ${maxLength ? `maxlength="${maxLength}"` : ''}
                           autocomplete="off"
                           autofocus>
                    <div class="input-buttons">
                        <button class="confirm-btn" id="confirm-input">Confirm</button>
                        <button class="cancel-btn" id="cancel-input">Cancel</button>
                    </div>
                    <div id="input-error" class="input-error" style="display: none;"></div>
                </div>
            </div>
        `;

        // Add styles for input modal
        if (!document.querySelector('#input-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'input-modal-styles';
            style.textContent = `
                .input-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(8px);
                }

                .input-modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    width: 90%;
                    max-width: 420px;
                    overflow: hidden;
                    animation: popIn 0.3s ease-out;
                }

                .input-header {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    padding: 24px;
                    text-align: center;
                }

                .input-header h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                }

                .input-content {
                    padding: 28px;
                }

                .input-content p {
                    margin: 0 0 24px 0;
                    color: #374151;
                    font-size: 15px;
                    line-height: 1.5;
                    text-align: center;
                }

                #input-field {
                    width: 100%;
                    padding: 16px 20px;
                    border: 2px solid #d1d5db;
                    border-radius: 12px;
                    font-size: 16px;
                    text-align: center;
                    margin-bottom: 24px;
                    transition: all 0.3s;
                    font-family: inherit;
                }

                #input-field:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    transform: scale(1.02);
                }

                .input-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .confirm-btn, .cancel-btn {
                    padding: 14px 24px;
                    border: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .confirm-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                }

                .confirm-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
                }

                .cancel-btn {
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }

                .cancel-btn:hover {
                    background: #e5e7eb;
                    transform: translateY(-1px);
                }

                .input-error {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 16px;
                    font-size: 14px;
                    text-align: center;
                    border: 1px solid #fca5a5;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        const input = document.getElementById('input-field');
        const confirmBtn = document.getElementById('confirm-input');
        const cancelBtn = document.getElementById('cancel-input');
        const errorDiv = document.getElementById('input-error');

        const handleConfirm = () => {
            const value = input.value.trim();
            if (!value) {
                errorDiv.textContent = 'This field is required';
                errorDiv.style.display = 'block';
                input.focus();
                return;
            }
            modal.remove();
            onConfirm(value);
        };

        const handleCancel = () => {
            modal.remove();
            if (onCancel) onCancel();
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') handleCancel();
        });

        input.addEventListener('input', () => {
            errorDiv.style.display = 'none';
        });

        // Auto-submit for 4-digit PIN
        if (inputType === 'number' && maxLength === 4) {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 4) {
                    setTimeout(handleConfirm, 800);
                }
            });
        }
    }

    changeLock() {
        this.closeSettingsModal();
        
        const currentType = this.lockData.type;
        const currentLabel = currentType === 'pin' ? 'PIN' : 'password';
        
        // Verify current credentials first
        const currentValue = prompt('Enter your current ' + currentLabel + ' to continue:');
        
        if (!this.verifyCredentials(currentValue)) {
            alert('Incorrect ' + currentLabel + '. Cannot change lock.');
            return;
        }
        
        // Ask for new type
        const newType = confirm('Choose lock type:\n\nOK = PIN (4 digits)\nCancel = Password') ? 'pin' : 'password';
        
        this.setupLock(newType);
    }

    disableLock() {
        this.closeSettingsModal();
        
        const currentType = this.lockData.type;
        const currentLabel = currentType === 'pin' ? 'PIN' : 'password';
        
        // Verify current credentials first
        const currentValue = prompt('Enter your current ' + currentLabel + ' to disable lock:');
        
        if (!this.verifyCredentials(currentValue)) {
            alert('Incorrect ' + currentLabel + '. Cannot disable lock.');
            return;
        }
        
        if (confirm('Are you sure you want to disable the web lock? This will remove all protection.')) {
            this.removeLockData();
            alert('Web lock has been disabled successfully.');
        }
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WebLock());
} else {
    new WebLock();
}

// Export for potential external use
window.WebLock = WebLock;
