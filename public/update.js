/*
 * DYNAMIC UPDATE NOTIFICATION SYSTEM
 * 
 * HOW TO NOTIFY ALL USERS:
 * 1. Change the 'currentUpdateTimestamp' below to current date-time
 * 2. Format: "YYYY-MM-DD-HH:MM:SS" (e.g., "2025-07-30-15:45:00")
 * 3. Update the content in modalContent.innerHTML if needed
 * 4. All users will see the popup once, even if they've seen previous updates
 * 
 * EXAMPLE: To push a new notification on July 30, 2025 at 3:45 PM:
 * Change: currentUpdateTimestamp = "2025-07-30-15:45:00";
 */

setTimeout(() => {
  // Dynamic update system - change this timestamp to notify all users
  const currentUpdateTimestamp = "2025-07-30-14:30:00"; // Change this to notify all users
  const currentUpdateVersion = "10.7.0";
  const lastSeenTimestamp = localStorage.getItem("lastSeenUpdateTimestamp");
  
  // If user hasn't seen this specific update timestamp, show popup
  if (lastSeenTimestamp === currentUpdateTimestamp) return;

  // Create popup modal
  const modal = document.createElement("div");
  modal.id = "updateModal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modal.style.zIndex = "10000";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.fontFamily = "Segoe UI, sans-serif";

  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#ffffff";
  modalContent.style.borderRadius = "12px";
  modalContent.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
  modalContent.style.maxWidth = "600px";
  modalContent.style.width = "90%";
  modalContent.style.maxHeight = "80vh";
  modalContent.style.overflowY = "auto";
  modalContent.style.position = "relative";
  modalContent.style.animation = "slideIn 0.3s ease-out";

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .update-modal-content {
      color: #333;
      line-height: 1.6;
    }
    .update-modal-content h1 {
      color: #1f2937;
      margin-bottom: 10px;
      font-size: 1.8rem;
    }
    .update-modal-content h2 {
      color: #3b82f6;
      margin: 20px 0 10px 0;
      font-size: 1.3rem;
    }
    .update-modal-content ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .update-modal-content li {
      margin: 8px 0;
    }
    .feature-highlight {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
      margin: 15px 0;
    }
    .security-badge {
      background: #dcfce7;
      color: #166534;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: bold;
      display: inline-block;
      margin: 5px 5px 5px 0;
    }
    .shortcut-badge {
      background: #fef3c7;
      color: #92400e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: bold;
      font-family: monospace;
    }
  `;
  document.head.appendChild(style);

  modalContent.innerHTML = `
    <div style="padding: 30px; position: relative;" class="update-modal-content">
      <!-- Close Button -->
      <button id="closeUpdateModal" style="
        position: sticky;
        top: 15px;
        right: 15px;
        float: right;
        background: #f3f4f6;
        border: none;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        transition: all 0.2s ease;
        z-index: 10001;
        margin-bottom: 10px;
      " onmouseover="this.style.background='#e5e7eb'; this.style.color='#374151';" onmouseout="this.style.background='#f3f4f6'; this.style.color='#6b7280';">
        ✕
      </button>

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="font-size: 3rem; margin-bottom: 10px;">🔐</div>
        <h1>Note Counter 10.7.0 Released!</h1>
        <p style="color: #6b7280; font-size: 1.1rem;">Revolutionary Web Lock Security System</p>
        <div style="margin-top: 15px;">
          <span class="security-badge">🔐 Web Lock</span>
          <span class="security-badge">🔢 PIN/Password</span>
          <span class="security-badge">⚙️ Settings Integration</span>
          <span class="security-badge">🔄 Session Management</span>
          <span class="security-badge">⚡ Quick Lock</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="feature-highlight">
        <h2 style="margin-top: 0;">🚀 What's New in Version 10.7.0</h2>
        <p><strong>Major Security Update!</strong> We've introduced comprehensive Web Lock protection to keep your financial data completely secure.</p>
      </div>

      <h2>🔐 New Security Features</h2>
      <ul>
        <li><strong>PIN Protection System:</strong> Set customizable 4-8 digit PIN codes for quick, secure access</li>
        <li><strong>Password Security:</strong> Advanced password protection with complex character support</li>
        <li><strong>Smart Session Management:</strong> Automatic lock/unlock with secure browser session handling</li>
        <li><strong>Settings Integration:</strong> Professional toggle switches seamlessly integrated into Settings tab</li>
        <li><strong>Enhanced Data Protection:</strong> Complete security with modal interfaces and secure storage</li>
        <li><strong>⚡ Quick Lock Shortcut:</strong> Press <span class="shortcut-badge">Shift+L</span> for instant app locking from anywhere!</li>
      </ul>

      <h2>💼 Perfect for Businesses</h2>
      <ul>
        <li><strong>Till Protection:</strong> Secure daily cash counts and financial records</li>
        <li><strong>Multi-User Security:</strong> Control access in shared computer environments</li>
        <li><strong>Professional Security:</strong> Enterprise-grade protection for sensitive data</li>
        <li><strong>Quick Access:</strong> PIN system for fast authentication during busy hours</li>
        <li><strong>Instant Lock:</strong> Use <span class="shortcut-badge">Shift+L</span> to lock immediately when stepping away</li>
      </ul>

      <h2>⚙️ How to Use Web Lock</h2>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <ol style="margin: 0; padding-left: 20px;">
          <li>Go to <strong>Settings</strong> tab in the main menu</li>
          <li>Find <strong>"Web Lock Settings"</strong> section</li>
          <li>Click <strong>"Configure Web Lock"</strong></li>
          <li>Choose PIN or Password protection</li>
          <li>Your data is now secured! 🔒</li>
          <li><strong>Bonus:</strong> Use <span class="shortcut-badge">Shift+L</span> for quick locking anytime! ⚡</li>
        </ol>
      </div>

      <h2>⌨️ New Keyboard Shortcut</h2>
      <div style="background: #fef7cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
        <h3 style="color: #92400e; margin-top: 0;">⚡ Instant Lock Feature</h3>
        <p style="color: #78350f; margin-bottom: 10px;">
          <strong>Press <span class="shortcut-badge">Shift+L</span></strong> anywhere in the app to instantly lock Note Counter!
        </p>
        <ul style="color: #78350f; margin: 0; padding-left: 20px;">
          <li>✅ Works from any tab or screen</li>
          <li>✅ Perfect for shared computers</li>
          <li>✅ Quick protection when stepping away</li>
          <li>✅ Shows helpful notifications</li>
        </ul>
      </div>

      <h2>🛡️ Why Web Lock Security?</h2>
      <p>Financial data security is critical for businesses and individuals handling cash. Whether you're protecting daily till counts, client financial records, or personal expense tracking, Web Lock provides professional-grade security with an easy-to-use interface.</p>

      <!-- Action Buttons -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <button id="tryWebLock" style="
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 15px;
          transition: all 0.2s ease;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
          🚀 Try Web Lock Now
        </button>
        <button id="continueWithoutUpdate" style="
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        " onmouseover="this.style.background='#f3f4f6'; this.style.color='#374151';" onmouseout="this.style.background='transparent'; this.style.color='#6b7280';">
          Continue to App
        </button>
      </div>

      <div style="text-align: center; margin-top: 15px;">
        <p style="color: #9ca3af; font-size: 0.9rem;">
          Release Date: July 30, 2025 | Version 10.7.0 | <span class="shortcut-badge">Shift+L</span> to lock!
        </p>
      </div>
    </div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Handle close button
  document.getElementById("closeUpdateModal").addEventListener("click", () => {
    closeModal();
  });

  // Handle "Try Web Lock" button
  document.getElementById("tryWebLock").addEventListener("click", () => {
    closeModal();
    // Try to trigger settings modal if available
    if (window.showWebLockSettings) {
      window.showWebLockSettings();
    } else {
      // Fallback: scroll to settings or show alert
      alert("Go to Settings → Web Lock Settings to configure your security protection!");
    }
  });

  // Handle "Continue" button
  document.getElementById("continueWithoutUpdate").addEventListener("click", () => {
    closeModal();
  });

  // Handle click outside modal to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Handle ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("updateModal")) {
      closeModal();
    }
  });

  function closeModal() {
    // Mark this update timestamp as seen (not just version)
    localStorage.setItem("lastSeenUpdateTimestamp", currentUpdateTimestamp);
    localStorage.setItem("lastSeenUpdate", currentUpdateVersion); // Keep for backward compatibility
    
    // Remove modal with animation
    modalContent.style.animation = "slideOut 0.3s ease-in";
    modal.style.opacity = "0";
    
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  // Add slide out animation
  const slideOutStyle = document.createElement("style");
  slideOutStyle.textContent = `
    @keyframes slideOut {
      from {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      to {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
    }
  `;
  document.head.appendChild(slideOutStyle);

}, 3000); // Show after 3 seconds
