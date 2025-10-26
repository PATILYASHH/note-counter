// Professional 2-Step Feedback System for Note Counter
// Shows after 10 minutes, collects purpose + rating, submits to single Formspree endpoint

setTimeout(() => {
  console.log('🚀 Feedback system initializing...');

  // Clean up old localStorage keys from previous feedback system
  const oldKeys = [
    'feedback_last_shown', 'feedback_last_rating', 'feedback_last_no_thanks',
    'feedback_last_dont_show', 'feedback_disabled', 'feedback_session_count'
  ];
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🧹 Cleaned up old key: ${key}`);
    }
  });

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeedbackSystem);
  } else {
    initializeFeedbackSystem();
  }

  function initializeFeedbackSystem() {
    // Skip on localhost (comment out for testing)
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      console.log("🌐 Localhost detected - enabling feedback for testing");
      // Uncomment the line below in production to disable on localhost
      // return;
    }

    // Developer opt-out: Ctrl+Shift+Y
    window.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'Y' || e.key === 'y')) {
        localStorage.setItem('nc_feedback_dev_opt_out', 'yes');
        showDevOptOutPopup();
      }
    });

    if (localStorage.getItem('nc_feedback_dev_opt_out') === 'yes') {
      console.log('🛑 Developer opted out of feedback.');
      return;
    }

    function showDevOptOutPopup() {
      const popup = document.createElement('div');
      popup.innerHTML = `
        <div style="position:fixed;z-index:99999;top:0;left:0;width:100vw;height:100vh;
          display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,0.5);backdrop-filter:blur(3px);">
          <div style="background:linear-gradient(135deg,#6366f1,#a855f7);color:white;
            padding:2rem;border-radius:1rem;text-align:center;max-width:400px;">
            <div style="font-size:2.5rem;margin-bottom:1rem;">👨‍💻</div>
            <h3 style="margin:0 0 0.5rem 0;font-size:1.3rem;">Developer Mode</h3>
            <p style="margin:0 0 1rem 0;opacity:0.9;">Feedback system disabled for this device.</p>
            <button onclick="this.closest('div').parentElement.remove()" 
              style="background:#fbbf24;color:#1e293b;border:none;padding:0.5rem 1.5rem;
              border-radius:0.5rem;font-weight:600;cursor:pointer;">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 5000);
    }

    // Feedback System Class
    class FeedbackSystem {
      constructor() {
        console.log('🏗️ FeedbackSystem constructor called');
        this.formspreeEndpoint = 'https://formspree.io/f/manpqqpk';
        this.currentStep = 1;
        this.selectedPurpose = null;
        this.purposeSkipped = false;
        this.selectedRating = 0;
        this.init();
      }

      init() {
        // Check if user has already submitted feedback
        const hasRated = localStorage.getItem('nc_feedback_completed');
        if (hasRated) {
          console.log('✅ User has already submitted feedback - not showing again');
          return;
        }

        // Get or set first visit timestamp
        let firstVisit = localStorage.getItem('nc_feedback_first_visit');
        if (!firstVisit) {
          firstVisit = new Date().toISOString();
          localStorage.setItem('nc_feedback_first_visit', firstVisit);
          console.log('📅 First visit recorded:', firstVisit);
        }

        // Calculate time since first visit
        const firstVisitDate = new Date(firstVisit);
        const now = new Date();
        const minutesSinceFirstVisit = (now - firstVisitDate) / (1000 * 60);

        console.log(`⏱️ Minutes since first visit: ${minutesSinceFirstVisit.toFixed(1)}`);

        // Show feedback after 4 minutes (use 0.5 for testing - 30 seconds)
        const delayMinutes = 4;
        if (minutesSinceFirstVisit >= delayMinutes) {
          console.log('✅ 4 minutes passed - showing feedback modal');
          this.showFeedbackModal();
        } else {
          const remainingMinutes = delayMinutes - minutesSinceFirstVisit;
          console.log(`⏳ Feedback will show in ${remainingMinutes.toFixed(1)} minutes`);
          
          // Schedule feedback to show after remaining time
          setTimeout(() => {
            this.showFeedbackModal();
          }, remainingMinutes * 60 * 1000);
        }
      }

      showFeedbackModal() {
        console.log('🎯 Showing feedback modal - Step', this.currentStep);
        
        // Remove existing modal if any
        const existing = document.getElementById('nc-feedback-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'nc-feedback-modal';
        
        if (this.currentStep === 1) {
          modal.innerHTML = this.getStep1HTML();
        } else {
          modal.innerHTML = this.getStep2HTML();
        }

        // Add styles
        if (!document.getElementById('nc-feedback-styles')) {
          const style = document.createElement('style');
          style.id = 'nc-feedback-styles';
          style.textContent = this.getModalCSS();
          document.head.appendChild(style);
        }

        document.body.appendChild(modal);
        this.attachEventListeners();
      }

      getStep1HTML() {
        return `
          <div class="nc-feedback-overlay">
            <div class="nc-feedback-container">
              <div class="nc-feedback-header">
                <div class="nc-feedback-icon">💬</div>
                <h2>We'd love your feedback!</h2>
                <p class="nc-feedback-subtitle">Please give us feedback. That's important for us.</p>
              </div>

              <div class="nc-feedback-body">
                <div class="nc-step-indicator">
                  <span class="nc-step-dot active">1</span>
                  <span class="nc-step-line"></span>
                  <span class="nc-step-dot">2</span>
                </div>

                <h3 class="nc-question">What is the main purpose you're using this website?</h3>

                <div class="nc-purpose-options">
                  <label class="nc-purpose-card">
                    <input type="radio" name="purpose" value="Personal Finance Management">
                    <div class="nc-card-content">
                      <div class="nc-card-icon">💰</div>
                      <div class="nc-card-title">Personal Finance Management</div>
                    </div>
                  </label>

                  <label class="nc-purpose-card">
                    <input type="radio" name="purpose" value="Business Cash Handling">
                    <div class="nc-card-content">
                      <div class="nc-card-icon">🏪</div>
                      <div class="nc-card-title">Business Cash Handling</div>
                    </div>
                  </label>

                  <label class="nc-purpose-card">
                    <input type="radio" name="purpose" value="Educational / Learning">
                    <div class="nc-card-content">
                      <div class="nc-card-icon">📚</div>
                      <div class="nc-card-title">Educational / Learning</div>
                    </div>
                  </label>

                  <label class="nc-purpose-card">
                    <input type="radio" name="purpose" value="Professional Accounting">
                    <div class="nc-card-content">
                      <div class="nc-card-icon">📊</div>
                      <div class="nc-card-title">Professional Accounting</div>
                    </div>
                  </label>

                  <label class="nc-purpose-card">
                    <input type="radio" name="purpose" value="Other">
                    <div class="nc-card-content">
                      <div class="nc-card-icon">✨</div>
                      <div class="nc-card-title">Other</div>
                    </div>
                  </label>
                </div>

                <div class="nc-step-actions">
                  <button class="nc-btn nc-btn-secondary" id="nc-skip-step1">Skip</button>
                  <button class="nc-btn nc-btn-primary" id="nc-next-step" disabled>Next →</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      getStep2HTML() {
        const stepMessage = this.purposeSkipped 
          ? '<p class="nc-skipped-notice">📝 Step 1 skipped</p>' 
          : '';

        return `
          <div class="nc-feedback-overlay">
            <div class="nc-feedback-container">
              <div class="nc-feedback-header">
                <div class="nc-feedback-icon">⭐</div>
                <h2>How would you rate your experience?</h2>
                <p class="nc-feedback-subtitle">Please give us feedback. That's important for us.</p>
              </div>

              <div class="nc-feedback-body">
                <div class="nc-step-indicator">
                  <span class="nc-step-dot completed">✓</span>
                  <span class="nc-step-line completed"></span>
                  <span class="nc-step-dot active">2</span>
                </div>

                ${stepMessage}

                <div class="nc-rating-section">
                  <label class="nc-rating-label">Your Rating:</label>
                  <div class="nc-stars" id="nc-stars">
                    <span class="nc-star" data-rating="1">★</span>
                    <span class="nc-star" data-rating="2">★</span>
                    <span class="nc-star" data-rating="3">★</span>
                    <span class="nc-star" data-rating="4">★</span>
                    <span class="nc-star" data-rating="5">★</span>
                  </div>
                  <div class="nc-rating-text" id="nc-rating-text"></div>
                </div>

                <div class="nc-comment-section">
                  <label class="nc-comment-label" for="nc-comment">Your Comments (Optional):</label>
                  <textarea 
                    id="nc-comment" 
                    placeholder="Share your thoughts, suggestions, or what you like most about Note Counter..."
                    rows="4"
                    maxlength="1000"
                  ></textarea>
                  <div class="nc-char-count">
                    <span id="nc-char-count">0</span>/1000 characters
                  </div>
                </div>

                <div class="nc-step-actions">
                  <button class="nc-btn nc-btn-secondary" id="nc-back-step">← Back</button>
                  <button class="nc-btn nc-btn-primary nc-btn-submit" id="nc-submit-feedback" disabled>
                    <span id="nc-submit-text">Submit Feedback</span>
                    <span id="nc-submit-spinner" style="display:none;">⟳</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      getModalCSS() {
        return `
          .nc-feedback-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: nc-fadeIn 0.3s ease-out;
          }

          @keyframes nc-fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .nc-feedback-container {
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 95%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            animation: nc-slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }

          @keyframes nc-slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          .nc-feedback-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2.5rem 2rem 2rem 2rem;
            text-align: center;
            border-radius: 24px 24px 0 0;
          }

          .nc-feedback-icon {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            animation: nc-bounce 1s ease-in-out;
          }

          @keyframes nc-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .nc-feedback-header h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
            font-weight: 700;
            line-height: 1.3;
          }

          .nc-feedback-subtitle {
            margin: 0;
            font-size: 1rem;
            opacity: 0.95;
            font-weight: 500;
          }

          .nc-feedback-body {
            padding: 2rem;
          }

          .nc-step-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2rem;
            gap: 1rem;
          }

          .nc-step-dot {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e5e7eb;
            color: #9ca3af;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1rem;
            transition: all 0.3s;
          }

          .nc-step-dot.active {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .nc-step-dot.completed {
            background: #10b981;
            color: white;
          }

          .nc-step-line {
            width: 60px;
            height: 3px;
            background: #e5e7eb;
            transition: all 0.3s;
          }

          .nc-step-line.completed {
            background: #10b981;
          }

          .nc-question {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 1.5rem 0;
            text-align: center;
          }

          .nc-purpose-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .nc-purpose-card {
            position: relative;
            cursor: pointer;
            display: block;
          }

          .nc-purpose-card input[type="radio"] {
            position: absolute;
            opacity: 0;
            pointer-events: none;
          }

          .nc-card-content {
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 1.5rem 1rem;
            text-align: center;
            transition: all 0.3s;
            background: #ffffff;
          }

          .nc-purpose-card:hover .nc-card-content {
            border-color: #667eea;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
            transform: translateY(-3px);
          }

          .nc-purpose-card input:checked + .nc-card-content {
            border-color: #667eea;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
          }

          .nc-card-icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
          }

          .nc-card-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #374151;
            line-height: 1.3;
          }

          .nc-skipped-notice {
            background: #fef3c7;
            color: #92400e;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            text-align: center;
            font-weight: 500;
            border: 1px solid #fcd34d;
          }

          .nc-rating-section {
            margin-bottom: 2rem;
          }

          .nc-rating-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
            font-size: 1.05rem;
          }

          .nc-stars {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            margin-bottom: 1rem;
          }

          .nc-star {
            font-size: 3rem;
            color: #d1d5db;
            cursor: pointer;
            transition: all 0.2s;
            user-select: none;
          }

          .nc-star:hover,
          .nc-star.active {
            color: #fbbf24;
            transform: scale(1.15);
            text-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
          }

          .nc-rating-text {
            text-align: center;
            font-size: 1.1rem;
            font-weight: 600;
            color: #667eea;
            min-height: 30px;
          }

          .nc-comment-section {
            margin-bottom: 2rem;
          }

          .nc-comment-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.75rem;
            font-size: 1.05rem;
          }

          #nc-comment {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 1rem;
            line-height: 1.6;
            resize: vertical;
            font-family: inherit;
            transition: all 0.3s;
            outline: none;
          }

          #nc-comment:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          }

          .nc-char-count {
            text-align: right;
            font-size: 0.875rem;
            color: #9ca3af;
            margin-top: 0.5rem;
          }

          .nc-step-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
          }

          .nc-btn {
            flex: 1;
            padding: 1rem 1.5rem;
            border: none;
            border-radius: 12px;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-family: inherit;
          }

          .nc-btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 2px solid #e5e7eb;
          }

          .nc-btn-secondary:hover {
            background: #e5e7eb;
            border-color: #d1d5db;
            transform: translateY(-2px);
          }

          .nc-btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          .nc-btn-primary:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          }

          .nc-btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          #nc-submit-spinner {
            display: inline-block;
            animation: nc-spin 1s linear infinite;
          }

          @keyframes nc-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 640px) {
            .nc-feedback-container {
              width: 100%;
              margin: 0;
              border-radius: 0;
              max-height: 100vh;
            }

            .nc-feedback-header {
              border-radius: 0;
              padding: 2rem 1.5rem;
            }

            .nc-feedback-body {
              padding: 1.5rem;
            }

            .nc-purpose-options {
              grid-template-columns: 1fr;
            }

            .nc-stars {
              gap: 0.25rem;
            }

            .nc-star {
              font-size: 2.5rem;
            }

            .nc-step-actions {
              flex-direction: column;
            }
          }
        `;
      }

      attachEventListeners() {
        if (this.currentStep === 1) {
          this.attachStep1Listeners();
        } else {
          this.attachStep2Listeners();
        }
      }

      attachStep1Listeners() {
        const purposeInputs = document.querySelectorAll('input[name="purpose"]');
        const nextBtn = document.getElementById('nc-next-step');
        const skipBtn = document.getElementById('nc-skip-step1');

        // Enable next button when purpose is selected
        purposeInputs.forEach(input => {
          input.addEventListener('change', () => {
            if (input.checked) {
              this.selectedPurpose = input.value;
              nextBtn.disabled = false;
              console.log('✅ Purpose selected:', this.selectedPurpose);
            }
          });
        });

        // Next button
        nextBtn.addEventListener('click', () => {
          this.currentStep = 2;
          this.purposeSkipped = false;
          this.showFeedbackModal();
        });

        // Skip button
        skipBtn.addEventListener('click', () => {
          this.currentStep = 2;
          this.purposeSkipped = true;
          this.selectedPurpose = 'Skipped';
          console.log('⏭️ Step 1 skipped');
          this.showFeedbackModal();
        });
      }

      attachStep2Listeners() {
        const stars = document.querySelectorAll('.nc-star');
        const commentBox = document.getElementById('nc-comment');
        const charCount = document.getElementById('nc-char-count');
        const submitBtn = document.getElementById('nc-submit-feedback');
        const backBtn = document.getElementById('nc-back-step');

        // Star rating
        stars.forEach(star => {
          star.addEventListener('click', () => {
            this.selectedRating = parseInt(star.dataset.rating);
            this.updateStars(this.selectedRating);
            this.updateRatingText(this.selectedRating);
            submitBtn.disabled = this.selectedRating === 0;
          });

          star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            this.updateStars(rating);
          });

          star.addEventListener('mouseout', () => {
            this.updateStars(this.selectedRating);
          });
        });

        // Comment box character count
        commentBox.addEventListener('input', () => {
          charCount.textContent = commentBox.value.length;
        });

        // Submit button
        submitBtn.addEventListener('click', async () => {
          await this.submitFeedback(this.selectedRating, commentBox.value);
        });

        // Back button
        backBtn.addEventListener('click', () => {
          this.currentStep = 1;
          this.showFeedbackModal();
        });
      }

      updateStars(rating) {
        const stars = document.querySelectorAll('.nc-star');
        stars.forEach((star, index) => {
          if (index < rating) {
            star.classList.add('active');
          } else {
            star.classList.remove('active');
          }
        });
      }

      updateRatingText(rating) {
        const ratingText = document.getElementById('nc-rating-text');
        const texts = {
          1: '⭐ Poor',
          2: '⭐⭐ Fair',
          3: '⭐⭐⭐ Good',
          4: '⭐⭐⭐⭐ Very Good',
          5: '⭐⭐⭐⭐⭐ Excellent!'
        };
        ratingText.textContent = texts[rating] || '';
      }

      async submitFeedback(rating, comment) {
        const submitBtn = document.getElementById('nc-submit-feedback');
        const submitText = document.getElementById('nc-submit-text');
        const submitSpinner = document.getElementById('nc-submit-spinner');

        // Show loading
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitSpinner.style.display = 'inline-block';

        try {
          const formData = new FormData();
          formData.append('purpose', this.selectedPurpose || 'Not specified');
          formData.append('purpose_skipped', this.purposeSkipped ? 'Yes' : 'No');
          formData.append('rating', rating.toString());
          formData.append('comment', comment || 'No comment provided');
          formData.append('timestamp', new Date().toISOString());
          formData.append('url', window.location.href);
          formData.append('user_agent', navigator.userAgent);

          const response = await fetch(this.formspreeEndpoint, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            // Mark feedback as completed - never show again
            localStorage.setItem('nc_feedback_completed', new Date().toISOString());
            console.log('✅ Feedback submitted successfully');

            this.showSuccessToast();
            this.closeModal();
          } else {
            throw new Error('HTTP ' + response.status);
          }
        } catch (error) {
          console.error('❌ Feedback submission failed:', error);
          this.showErrorToast();

          // Re-enable button
          submitBtn.disabled = false;
          submitText.style.display = 'inline-block';
          submitSpinner.style.display = 'none';
        }
      }

      showSuccessToast() {
        this.showToast('✅ Thank you!', 'Your feedback has been submitted successfully.', 'success');
      }

      showErrorToast() {
        this.showToast('❌ Oops!', 'Failed to submit feedback. Please try again.', 'error');
      }

      showToast(title, message, type) {
        const toast = document.createElement('div');
        toast.className = 'nc-toast nc-toast-' + type;
        toast.innerHTML = 
          '<div class="nc-toast-icon">' + (type === 'success' ? '✅' : '❌') + '</div>' +
          '<div class="nc-toast-content">' +
          '<div class="nc-toast-title">' + title + '</div>' +
          '<div class="nc-toast-message">' + message + '</div>' +
          '</div>';

        // Add toast styles if not exists
        if (!document.getElementById('nc-toast-styles')) {
          const style = document.createElement('style');
          style.id = 'nc-toast-styles';
          style.textContent = `
            .nc-toast {
              position: fixed;
              top: 20px;
              right: 20px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              padding: 1rem 1.25rem;
              display: flex;
              align-items: center;
              gap: 12px;
              z-index: 1000000;
              animation: nc-slideInRight 0.3s ease-out;
              max-width: 400px;
              border-left: 4px solid;
            }
            .nc-toast-success { border-left-color: #10b981; }
            .nc-toast-error { border-left-color: #ef4444; }
            .nc-toast-icon { font-size: 1.5rem; flex-shrink: 0; }
            .nc-toast-content { flex: 1; }
            .nc-toast-title { font-weight: 700; color: #1f2937; margin-bottom: 2px; }
            .nc-toast-message { font-size: 0.9rem; color: #6b7280; }
            @keyframes nc-slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes nc-slideOutRight {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(100%); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        setTimeout(function() {
          toast.style.animation = 'nc-slideOutRight 0.3s ease-out';
          setTimeout(function() { toast.remove(); }, 300);
        }, 4000);
      }

      closeModal() {
        const modal = document.getElementById('nc-feedback-modal');
        if (modal) {
          modal.style.animation = 'nc-fadeIn 0.3s ease-out reverse';
          setTimeout(function() { modal.remove(); }, 300);
        }
      }
    }

    // Initialize the feedback system
    new FeedbackSystem();
  }
}, 3000);
