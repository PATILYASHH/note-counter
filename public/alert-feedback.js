setTimeout(() => {
  if (localStorage.getItem("feedbackSubmitted") === "yes") return;

  (function () {
    const endpoint = "https://formspree.io/f/xovwngyk"; // ✅ Your Formspree endpoint

    // === STYLES ===
    const style = document.createElement("style");
    style.innerHTML = `
      .fb-overlay {
        position: fixed; top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.4);
        display: flex; justify-content: center; align-items: center;
        z-index: 9999;
        font-family: 'Segoe UI', sans-serif;
      }
      .fb-modal {
        background: linear-gradient(135deg, #ffffff, #f0f8ff);
        border-radius: 14px;
        padding: 25px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 0 25px rgba(0,0,0,0.2);
        position: relative;
        animation: fadeIn 0.4s ease;
      }
      .fb-modal h2 {
        margin-top: 0;
        text-align: center;
        color: #007bff;
      }
      .fb-close {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 22px;
        cursor: pointer;
        color: #333;
      }
      .fb-form-group {
        margin-bottom: 15px;
      }
      .fb-form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 5px;
      }
      .fb-form-group input,
      .fb-form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background: #fff;
        font-size: 14px;
      }
      .fb-stars span {
        font-size: 28px;
        cursor: pointer;
        color: #ccc;
        transition: color 0.2s;
      }
      .fb-stars .active {
        color: #ffc107;
      }
      .fb-submit {
        width: 100%;
        padding: 12px;
        border: none;
        background: #28a745;
        color: white;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
      }
      .fb-submit:hover {
        background: #218838;
      }
      .fb-success {
        text-align: center;
        color: #28a745;
        margin-top: 10px;
        font-weight: bold;
        display: none;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);

    // === OVERLAY & MODAL ===
    const overlay = document.createElement("div");
    overlay.className = "fb-overlay";

    const modal = document.createElement("div");
    modal.className = "fb-modal";
    overlay.appendChild(modal);

    const close = document.createElement("span");
    close.className = "fb-close";
    close.innerHTML = "&times;";
    close.onclick = () => document.body.removeChild(overlay);
    modal.appendChild(close);

    const heading = document.createElement("h2");
    heading.textContent = "Help Us Improve Our Service";
    modal.appendChild(heading);

    // === FORM ===
    const form = document.createElement("form");
    form.id = "feedbackForm";

    const fields = [
      { id: "country", label: "Country", type: "text", required: true },
      { id: "business", label: "Business Type (optional)", type: "text", required: false },
      { id: "feedback", label: "Feedback / Improvements", type: "textarea", required: true },
      { id: "testimonial", label: "Testimonial (optional)", type: "textarea", required: false }
    ];

    fields.forEach(f => {
      const group = document.createElement("div");
      group.className = "fb-form-group";

      const label = document.createElement("label");
      label.textContent = f.label;
      group.appendChild(label);

      let input = f.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
      input.id = input.name = f.id;
      input.required = f.required;
      group.appendChild(input);

      form.appendChild(group);
    });

    // === STAR RATING ===
    const starGroup = document.createElement("div");
    starGroup.className = "fb-form-group";
    const starLabel = document.createElement("label");
    starLabel.textContent = "Experience (out of 5)";
    starGroup.appendChild(starLabel);

    const starDiv = document.createElement("div");
    starDiv.className = "fb-stars";

    let selectedRating = 0;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.innerHTML = "★";
      star.dataset.value = i;
      star.onclick = () => {
        selectedRating = i;
        stars.forEach((s, idx) => {
          s.classList.toggle("active", idx < i);
        });
      };
      stars.push(star);
      starDiv.appendChild(star);
    }

    // hidden input to submit star rating
    const ratingInput = document.createElement("input");
    ratingInput.type = "hidden";
    ratingInput.name = "experience";
    form.appendChild(ratingInput);

    starGroup.appendChild(starDiv);
    form.appendChild(starGroup);

    // === SUBMIT BUTTON ===
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "fb-submit";
    submitBtn.textContent = "Submit Feedback";
    form.appendChild(submitBtn);

    // === SUCCESS MESSAGE ===
    const successMsg = document.createElement("div");
    successMsg.className = "fb-success";
    successMsg.textContent = "Thanks for your feedback!";
    form.appendChild(successMsg);

    // === FORM HANDLER ===
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (selectedRating === 0) {
        alert("Please rate your experience.");
        return;
      }

      ratingInput.value = selectedRating + " / 5";

      const formData = new FormData(form);
      fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      }).then(res => {
        if (res.ok) {
          successMsg.style.display = "block";
          localStorage.setItem("feedbackSubmitted", "yes");

          form.reset();
          selectedRating = 0;
          stars.forEach(s => s.classList.remove("active"));

          setTimeout(() => {
            document.body.removeChild(overlay);
          }, 2000);
        } else {
          alert("Submission failed. Please try again.");
        }
      }).catch(() => alert("Network error. Please check your connection."));
    });

    modal.appendChild(form);
    document.body.appendChild(overlay);
  })();
}, 3000);
