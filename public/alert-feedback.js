setTimeout(() => {
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
