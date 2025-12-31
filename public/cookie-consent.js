/**
 * Cookie Consent Banner for Google AdSense Compliance
 * Required by Google Publisher Policies
 */

(function() {
    'use strict';
    
    const CONSENT_KEY = 'note_counter_cookie_consent';
    const CONSENT_VERSION = '1.0';
    
    // Check if consent has already been given
    function hasConsent() {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) return false;
        
        try {
            const data = JSON.parse(consent);
            return data.version === CONSENT_VERSION && data.accepted === true;
        } catch (e) {
            return false;
        }
    }
    
    // Save consent
    function saveConsent(accepted) {
        const data = {
            accepted: accepted,
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    }
    
    // Create and show the consent banner
    function showConsentBanner() {
        if (hasConsent()) return;
        
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(17, 24, 39, 0.98);
                color: white;
                padding: 20px;
                box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                animation: slideUp 0.3s ease-out;
            ">
                <style>
                    @keyframes slideUp {
                        from {
                            transform: translateY(100%);
                        }
                        to {
                            transform: translateY(0);
                        }
                    }
                    @media (max-width: 640px) {
                        #cookie-consent-content {
                            flex-direction: column !important;
                            gap: 15px !important;
                        }
                        #cookie-consent-buttons {
                            flex-direction: column !important;
                            width: 100% !important;
                        }
                        #cookie-consent-buttons button {
                            width: 100% !important;
                        }
                    }
                </style>
                <div id="cookie-consent-content" style="
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                ">
                    <div style="flex: 1;">
                        <h3 style="
                            margin: 0 0 8px 0;
                            font-size: 18px;
                            font-weight: 600;
                        ">🍪 Cookie Notice</h3>
                        <p style="
                            margin: 0;
                            font-size: 14px;
                            line-height: 1.5;
                            color: #D1D5DB;
                        ">
                            We use cookies to improve your experience and serve personalized ads through Google AdSense. 
                            Third parties like Google may place and read cookies on your browser. 
                            <a href="/privacy-policy.html" style="color: #60A5FA; text-decoration: underline;" target="_blank">Learn more</a>
                        </p>
                    </div>
                    <div id="cookie-consent-buttons" style="
                        display: flex;
                        gap: 10px;
                        flex-shrink: 0;
                    ">
                        <button id="cookie-settings-btn" style="
                            background: transparent;
                            color: white;
                            border: 1px solid rgba(255, 255, 255, 0.3);
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s;
                            white-space: nowrap;
                        " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'" onmouseout="this.style.background='transparent'">
                            Cookie Settings
                        </button>
                        <button id="cookie-accept-btn" style="
                            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                            color: white;
                            border: none;
                            padding: 10px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s;
                            white-space: nowrap;
                        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Add event listeners
        document.getElementById('cookie-accept-btn').addEventListener('click', function() {
            saveConsent(true);
            hideBanner();
            // Reload ads if AdSense is present
            if (window.adsbygoogle) {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    console.log('AdSense reload error:', e);
                }
            }
        });
        
        document.getElementById('cookie-settings-btn').addEventListener('click', function() {
            window.open('https://adssettings.google.com/', '_blank');
        });
    }
    
    // Hide the banner
    function hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }
    
    // Add slideDown animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateY(0);
            }
            to {
                transform: translateY(100%);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Show banner when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showConsentBanner);
    } else {
        showConsentBanner();
    }
    
    // Export function to check consent (for other scripts)
    window.hasAdConsent = hasConsent;
    
})();
