setTimeout(() => {
  // Skip location tracking if running on localhost or 127.0.0.1
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    console.log("🌐 Skipping location tracking on localhost");
    return;
  }

  // Developer opt-out: If Ctrl+Shift+Y is pressed, set a flag to never track this device
  function showDevPopup() {
    // Remove any existing popup
    const old = document.getElementById('dev-popup');
    if (old) old.remove();
    const popup = document.createElement('div');
    popup.id = 'dev-popup';
    popup.innerHTML = `
      <div style="
        position:fixed;z-index:99999;top:0;left:0;width:100vw;height:100vh;
        display:flex;align-items:center;justify-content:center;
        background:rgba(30,16,60,0.45);backdrop-filter:blur(2px);">
        <div style="
          background:linear-gradient(135deg,#6366f1 0%,#a21caf 100%);
          color:white;padding:2.5rem 2rem 2rem 2rem;border-radius:1.5rem;
          box-shadow:0 8px 32px rgba(80,0,120,0.25);
          text-align:center;max-width:90vw;min-width:320px;">
          <div style="font-size:2.5rem;line-height:1;margin-bottom:0.5rem;">👨‍💻✨</div>
          <div style="font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;">Welcome, Developer!</div>
          <div style="font-size:1.1rem;margin-bottom:1.2rem;">This device will <span style='color:#fbbf24;font-weight:600;'>not be tracked</span> for analytics or location.<br>Enjoy building! 🚀</div>
          <button id="dev-popup-close" style="background:#fbbf24;color:#1e293b;font-weight:600;padding:0.5rem 1.5rem;border:none;border-radius:0.5rem;font-size:1rem;cursor:pointer;transition:background 0.2s;">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('dev-popup-close').onclick = () => popup.remove();
    setTimeout(() => { if (popup.parentNode) popup.remove(); }, 6000);
  }

  // Listen for Ctrl+Shift+Y to opt out
  window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'Y' || e.key === 'y')) {
      localStorage.setItem('devNoTrack', 'yes');
      showDevPopup();
    }
  });

  // If developer opt-out is set, skip tracking and show popup
  if (localStorage.getItem('devNoTrack') === 'yes') {
    showDevPopup();
    console.log('🛑 Developer opted out of tracking on this device.');
    return;
  }
  // Enhanced device tracking using IP-based identification
  async function submitCountryData() {
    try {
      // Get comprehensive location and IP data
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (!data.ip) {
        console.log('Unable to retrieve IP address for device tracking');
        return;
      }

      const country = data.country_name || 'Unknown';
      const ipAddress = data.ip;
      
      // Create a simple hash of the IP for device identification (privacy-friendly)
      const ipHash = await createSimpleHash(ipAddress);
      const deviceId = `device_${ipHash}`;
      
      // Check if this device (by IP hash) has already submitted data
      const submissionKey = `countrySubmitted_${deviceId}`;
      
      if (localStorage.getItem(submissionKey) === "yes" || 
          localStorage.getItem("countryDataSubmitted") === "yes") {
        console.log('Country data already submitted from this device/IP');
        return;
      }

      // Prepare enhanced submission data
      const formData = new FormData();
      formData.append("country", country);
      formData.append("device_id", deviceId);
      formData.append("ip_region", data.region || 'Unknown');
      formData.append("ip_city", data.city || 'Unknown');
      formData.append("detected_automatically", "yes");
      formData.append("detection_method", "IP_geolocation_enhanced");
      formData.append("timestamp", new Date().toISOString());
      formData.append("user_agent", navigator.userAgent);
      formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown');

      // Submit to Formspree
      const submitResponse = await fetch("https://formspree.io/f/xovwngyk", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (submitResponse.ok) {
        // Mark as submitted with both device-specific and general flags
        localStorage.setItem(submissionKey, "yes");
        localStorage.setItem("countryDataSubmitted", "yes");
        localStorage.setItem("lastSubmissionIP", ipHash);
        localStorage.setItem("submissionTimestamp", new Date().toISOString());
        
        console.log(`✅ Country data submitted successfully: ${country} (Device: ${deviceId})`);
      } else {
        throw new Error(`Submission failed with status: ${submitResponse.status}`);
      }
      
    } catch (error) {
      console.log('❌ Country data submission failed:', error);
      // Mark as attempted to prevent retry loops
      localStorage.setItem("countryDataSubmitted", "yes");
    }
  }

  // Simple hash function for IP address (privacy-friendly)
  async function createSimpleHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 12); // Use first 12 characters for shorter ID
  }

  // Enhanced duplicate prevention check
  async function checkIfAlreadySubmitted() {
    try {
      // First check localStorage
      if (localStorage.getItem("countryDataSubmitted") === "yes") {
        return true;
      }

      // Then check IP-based tracking
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.ip) {
        const ipHash = await createSimpleHash(data.ip);
        const deviceId = `device_${ipHash}`;
        const submissionKey = `countrySubmitted_${deviceId}`;
        
        if (localStorage.getItem(submissionKey) === "yes") {
          return true;
        }

        // Also check if the current IP hash matches any previous submission
        const lastIP = localStorage.getItem("lastSubmissionIP");
        if (lastIP === ipHash) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.log('Error checking submission status:', error);
      return false; // Proceed with submission if check fails
    }
  }

  // Main execution with enhanced checking
  async function executeSubmission() {
    const alreadySubmitted = await checkIfAlreadySubmitted();
    
    if (alreadySubmitted) {
      console.log('📍 Country data already submitted from this device/IP - skipping');
      return;
    }

    console.log('🚀 Initiating country data submission...');
    await submitCountryData();
  }

  // Execute after delay
  executeSubmission();
}, 3000);
