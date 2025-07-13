setTimeout(() => {
  if (localStorage.getItem("countryDataSubmitted") === "yes") return;

  // Function to get user's country automatically and submit it
  async function submitCountryData() {
    try {
      // Get country from IP geolocation
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const country = data.country_name || 'Unknown';
      
      // Automatically submit the country data
      const formData = new FormData();
      formData.append("country", country);
      formData.append("detected_automatically", "yes");
      formData.append("detection_method", "IP_geolocation");
      formData.append("timestamp", new Date().toISOString());

      await fetch("https://formspree.io/f/xovwngyk", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      // Mark as submitted to prevent future submissions
      localStorage.setItem("countryDataSubmitted", "yes");
      console.log(`Country data submitted: ${country}`);
      
    } catch (error) {
      console.log('Country data submission failed:', error);
      // Still mark as attempted to prevent retry loops
      localStorage.setItem("countryDataSubmitted", "yes");
    }
  }

  // Execute the function immediately without showing any UI
  submitCountryData();
}, 3000);
