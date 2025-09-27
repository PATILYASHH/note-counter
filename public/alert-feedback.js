// Enhanced Feedback and Rating System
setTimeout(() => {
  console.log('🚀 Feedback system timeout triggered');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 DOM ready, initializing feedback system');
      initializeFeedbackSystem();
    });
  } else {
    console.log('📄 DOM already ready, initializing feedback system');
    initializeFeedbackSystem();
  }

  function initializeFeedbackSystem() {
    // Skip feedback system if running on localhost or 127.0.0.1 (temporarily disabled for testing)
    // if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    //   console.log("🌐 Skipping feedback system on localhost");
    //   return;
    // }

  // Developer opt-out: If Ctrl+Shift+Y is pressed, set a flag to never show feedback
  function showDevPopup() {
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
          <div style="font-size:1.1rem;margin-bottom:1.2rem;">This device will <span style='color:#fbbf24;font-weight:600;'>not show feedback</span> for analytics.<br>Enjoy building! 🚀</div>
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
      localStorage.setItem('devNoFeedback', 'yes');
      showDevPopup();
    }
  });

  // If developer opt-out is set, skip feedback
  if (localStorage.getItem('devNoFeedback') === 'yes') {
    showDevPopup();
    console.log('🛑 Developer opted out of feedback on this device.');
    return;
  }

  // Feedback System Class
  class FeedbackSystem {
    constructor() {
      console.log('🏗️ FeedbackSystem constructor called');
      this.formspreeEndpoint = 'https://formspree.io/f/manpqqpk';
      this.init();
    }

    init() {
      console.log('🔄 FeedbackSystem initializing...');
      // For testing: show feedback immediately
      console.log('🧪 TEST MODE: Showing feedback immediately');
      setTimeout(() => {
        this.showFeedbackModal();
      }, 1000); // Show after 1 second for testing
    }

    shouldShowFeedback() {
      console.log('🔍 Checking if should show feedback...');
      const now = new Date();
      const lastRating = localStorage.getItem('feedback_last_rating');
      const lastNoThanks = localStorage.getItem('feedback_last_no_thanks');
      const lastDontShow = localStorage.getItem('feedback_last_dont_show');
      const feedbackDisabled = localStorage.getItem('feedback_disabled') === 'true';

      console.log('📊 Feedback state:', { lastRating, lastNoThanks, lastDontShow, feedbackDisabled });

      // If user has given a rating, never show again
      if (lastRating) {
        console.log('❌ User has already rated - not showing');
        return false;
      }

      // If feedback is permanently disabled, never show
      if (feedbackDisabled) {
        console.log('❌ Feedback permanently disabled - not showing');
        return false;
      }

      // If user clicked "Don't show again", show once a month
      if (lastDontShow) {
        const lastDontShowDate = new Date(lastDontShow);
        const daysSinceDontShow = (now - lastDontShowDate) / (1000 * 60 * 60 * 24);
        console.log(`📅 Days since "Don't show again": ${daysSinceDontShow.toFixed(1)}`);
        if (daysSinceDontShow < 30) { // 30 days = 1 month
          console.log('❌ Too soon since "Don\'t show again" - not showing');
          return false;
        }
      }

      // If user clicked "No thanks", show once a day
      if (lastNoThanks) {
        const lastNoThanksDate = new Date(lastNoThanks);
        const hoursSinceNoThanks = (now - lastNoThanksDate) / (1000 * 60 * 60);
        console.log(`🕐 Hours since "No thanks": ${hoursSinceNoThanks.toFixed(1)}`);
        if (hoursSinceNoThanks < 24) { // 24 hours = 1 day
          console.log('❌ Too soon since "No thanks" - not showing');
          return false;
        }
      }

      // Check if user has used the app enough times (at least 1 session for testing)
      const sessionCount = parseInt(localStorage.getItem('feedback_session_count') || '0');
      console.log(`🔢 Session count: ${sessionCount}`);
      if (sessionCount < 1) {
        localStorage.setItem('feedback_session_count', (sessionCount + 1).toString());
        console.log('❌ Not enough sessions - not showing');
        return false;
      }

      console.log('✅ All checks passed - should show feedback');
      return true;
    }

    showFeedbackModal() {
      console.log('🎯 Showing feedback modal');
      const modal = document.createElement('div');
      modal.id = 'feedback-modal';
      modal.innerHTML = this.getFeedbackModalHTML();

      // Add styles
      const style = document.createElement('style');
      style.textContent = this.getFeedbackModalCSS();
      document.head.appendChild(style);

      document.body.appendChild(modal);
      this.addFeedbackModalListeners();
    }

    getFeedbackModalHTML() {
      return `
        <div class="feedback-overlay">
          <div class="feedback-modal">
            <div class="feedback-header">
              <div class="feedback-icon">⭐</div>
              <h2>How's your experience with Note Counter?</h2>
              <p>Your feedback helps us improve!</p>
            </div>

            <div class="feedback-content">
              <!-- Star Rating -->
              <div class="rating-section">
                <label>Rate your experience:</label>
                <div class="stars" id="star-rating">
                  <span class="star" data-rating="1">★</span>
                  <span class="star" data-rating="2">★</span>
                  <span class="star" data-rating="3">★</span>
                  <span class="star" data-rating="4">★</span>
                  <span class="star" data-rating="5">★</span>
                </div>
                <div class="rating-text" id="rating-text"></div>
              </div>

              <!-- Feedback Text -->
              <div class="feedback-section">
                <label for="feedback-text">Share your thoughts or suggestions:</label>
                <textarea
                  id="feedback-text"
                  placeholder="What do you like? What can we improve? Any suggestions?"
                  rows="4"
                  maxlength="500"
                ></textarea>
                <div class="char-count">
                  <span id="char-count">0</span>/500 characters
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="feedback-actions">
                <button class="btn btn-secondary" id="no-thanks-btn">No thanks</button>
                <button class="btn btn-secondary" id="dont-show-btn">Don't show again</button>
                <button class="btn btn-primary" id="submit-feedback-btn" disabled>
                  <span id="submit-text">Submit Feedback</span>
                  <span id="submit-spinner" class="spinner" style="display: none;">⟳</span>
                </button>
              </div>
            </div>

            <div class="feedback-footer">
              <p>💝 Your feedback is valuable to us!</p>
            </div>
          </div>
        </div>
      `;
    }

    getFeedbackModalCSS() {
      return `
        .feedback-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .feedback-modal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
          width: 95%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .feedback-header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 30px 25px 25px 25px;
          text-align: center;
          border-radius: 20px 20px 0 0;
        }

        .feedback-icon {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        .feedback-header h2 {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .feedback-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
        }

        .feedback-content {
          padding: 25px;
        }

        .rating-section, .feedback-section {
          margin-bottom: 25px;
        }

        .rating-section label, .feedback-section label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
          font-size: 0.95rem;
        }

        .stars {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .star {
          font-size: 2rem;
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .star:hover, .star.active {
          color: #fbbf24;
          transform: scale(1.1);
        }

        .rating-text {
          font-size: 0.9rem;
          color: #6b7280;
          min-height: 20px;
        }

        textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          line-height: 1.5;
          resize: vertical;
          transition: border-color 0.3s;
          font-family: inherit;
          outline: none;
        }

        textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .char-count {
          text-align: right;
          font-size: 0.8rem;
          color: #9ca3af;
          margin-top: 4px;
        }

        .feedback-actions {
          display: flex;
          gap: 12px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 120px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .feedback-footer {
          text-align: center;
          padding: 20px 25px;
          background: #f9fafb;
          border-radius: 0 0 20px 20px;
          border-top: 1px solid #e5e7eb;
        }

        .feedback-footer p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        @media (max-width: 480px) {
          .feedback-modal {
            width: 95%;
            margin: 10px;
          }

          .feedback-header {
            padding: 25px 20px 20px 20px;
          }

          .feedback-content {
            padding: 20px;
          }

          .feedback-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `;
    }

    addFeedbackModalListeners() {
      const modal = document.getElementById('feedback-modal');
      const overlay = document.querySelector('.feedback-overlay');
      const stars = document.querySelectorAll('.star');
      const feedbackText = document.getElementById('feedback-text');
      const submitBtn = document.getElementById('submit-feedback-btn');
      const noThanksBtn = document.getElementById('no-thanks-btn');
      const dontShowBtn = document.getElementById('dont-show-btn');
      const charCount = document.getElementById('char-count');

      let selectedRating = 0;

      // Close modal when clicking overlay
      overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeFeedbackModal();
        }
      });

      // Star rating functionality
      stars.forEach(star => {
        star.addEventListener('click', () => {
          selectedRating = parseInt(star.dataset.rating);
          this.updateStarDisplay(selectedRating);
          this.updateRatingText(selectedRating);
          this.updateSubmitButton(selectedRating, feedbackText.value.trim());
        });

        star.addEventListener('mouseover', () => {
          const rating = parseInt(star.dataset.rating);
          this.updateStarDisplay(rating, true);
        });

        star.addEventListener('mouseout', () => {
          this.updateStarDisplay(selectedRating);
        });
      });

      // Feedback text functionality
      feedbackText.addEventListener('input', () => {
        const text = feedbackText.value.trim();
        charCount.textContent = text.length;
        this.updateSubmitButton(selectedRating, text);
      });

      // Submit feedback
      submitBtn.addEventListener('click', () => {
        this.submitFeedback(selectedRating, feedbackText.value.trim());
      });

      // No thanks button
      noThanksBtn.addEventListener('click', () => {
        this.handleNoThanks();
      });

      // Don't show again button
      dontShowBtn.addEventListener('click', () => {
        this.handleDontShowAgain();
      });

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal) {
          this.closeFeedbackModal();
        }
      });
    }

    updateStarDisplay(rating, isHover = false) {
      const stars = document.querySelectorAll('.star');
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
    }

    updateRatingText(rating) {
      const ratingText = document.getElementById('rating-text');
      const texts = {
        1: 'Poor - Needs improvement',
        2: 'Fair - Could be better',
        3: 'Good - Meets expectations',
        4: 'Very Good - Exceeds expectations',
        5: 'Excellent - Outstanding!'
      };
      ratingText.textContent = rating > 0 ? texts[rating] : '';
    }

    updateSubmitButton(rating, text) {
      const submitBtn = document.getElementById('submit-feedback-btn');
      const hasContent = rating > 0 || text.length > 0;
      submitBtn.disabled = !hasContent;
    }

    async submitFeedback(rating, feedback) {
      const submitBtn = document.getElementById('submit-feedback-btn');
      const submitText = document.getElementById('submit-text');
      const submitSpinner = document.getElementById('submit-spinner');

      // Show loading state
      submitBtn.disabled = true;
      submitText.style.display = 'none';
      submitSpinner.style.display = 'inline-block';

      try {
        const formData = new FormData();
        formData.append('rating', rating.toString());
        formData.append('feedback', feedback);
        formData.append('timestamp', new Date().toISOString());
        formData.append('user_agent', navigator.userAgent);
        formData.append('url', window.location.href);

        const response = await fetch(this.formspreeEndpoint, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // Mark that user has given feedback
          localStorage.setItem('feedback_last_rating', new Date().toISOString());

          // Show success message
          this.showSuccessMessage();
          this.closeFeedbackModal();
        } else {
          throw new Error(`Submission failed: ${response.status}`);
        }
      } catch (error) {
        console.error('Feedback submission failed:', error);
        this.showErrorMessage();
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.style.display = 'inline-block';
        submitSpinner.style.display = 'none';
      }
    }

    handleNoThanks() {
      // Record that user clicked "No thanks"
      localStorage.setItem('feedback_last_no_thanks', new Date().toISOString());

      // Send feedback about "No thanks"
      this.sendSimpleFeedback('User said: No thanks');

      this.closeFeedbackModal();
    }

    handleDontShowAgain() {
      // Record that user clicked "Don't show again"
      localStorage.setItem('feedback_last_dont_show', new Date().toISOString());

      // Send feedback about "Don't show again"
      this.sendSimpleFeedback('User said: Don\'t show me again');

      this.closeFeedbackModal();
    }

    async sendSimpleFeedback(message) {
      try {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('timestamp', new Date().toISOString());
        formData.append('action_type', 'dismissal');

        await fetch(this.formspreeEndpoint, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
      } catch (error) {
        console.error('Simple feedback submission failed:', error);
      }
    }

    showSuccessMessage() {
      const toast = document.createElement('div');
      toast.className = 'feedback-toast success';
      toast.innerHTML = `
        <div class="toast-icon">✅</div>
        <div class="toast-content">
          <div class="toast-title">Thank you!</div>
          <div class="toast-message">Your feedback has been submitted successfully.</div>
        </div>
      `;

      this.showToast(toast);
    }

    showErrorMessage() {
      const toast = document.createElement('div');
      toast.className = 'feedback-toast error';
      toast.innerHTML = `
        <div class="toast-icon">❌</div>
        <div class="toast-content">
          <div class="toast-title">Oops!</div>
          <div class="toast-message">Failed to submit feedback. Please try again.</div>
        </div>
      `;

      this.showToast(toast);
    }

    showToast(toast) {
      // Add toast styles if not exists
      if (!document.querySelector('#feedback-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'feedback-toast-styles';
        style.textContent = `
          .feedback-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
            max-width: 350px;
            border-left: 4px solid;
          }

          .feedback-toast.success {
            border-left-color: #10b981;
          }

          .feedback-toast.error {
            border-left-color: #ef4444;
          }

          .toast-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
          }

          .toast-content {
            flex: 1;
          }

          .toast-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
          }

          .toast-message {
            font-size: 0.9rem;
            color: #6b7280;
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

      // Remove after 4 seconds
      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    closeFeedbackModal() {
      const modal = document.getElementById('feedback-modal');
      if (modal) {
        modal.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => modal.remove(), 300);
      }
    }
  }

  // Initialize the feedback system
  new FeedbackSystem();

  // Add test button for debugging (remove in production)
  const testButton = document.createElement('button');
  testButton.textContent = 'Test Feedback';
  testButton.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;padding:5px 10px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;';
  testButton.onclick = () => {
    console.log('🧪 Manual feedback test triggered');
    const feedbackSystem = new FeedbackSystem();
    feedbackSystem.showFeedbackModal();
  };
    document.body.appendChild(testButton);
  }
}, 3000);
