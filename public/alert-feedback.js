setTimeout(() => {
  if (localStorage.getItem("feedbackSubmitted") === "yes") return;

  (function () {
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
        text-align: center;
      }
      .fb-modal h2 {
        margin-top: 0;
        color: #007bff;
      }
      .fb-message {
        font-size: 14px;
        color: #555;
        margin-top: -10px;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      .fb-form-group {
        margin-bottom: 15px;
        text-align: left;
      }
      .fb-form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 5px;
      }
      .fb-form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background: #fff;
        font-size: 14px;
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

    const countries = [
      "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
      "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
      "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
      "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Brazzaville)","Congo (Kinshasa)",
      "Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
      "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France",
      "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
      "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
      "Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, North",
      "Korea, South","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya",
      "Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
      "Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
      "Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia",
      "Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines",
      "Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa",
      "San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia",
      "Solomon Islands","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
      "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia",
      "Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
      "Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
    ];

    const overlay = document.createElement("div");
    overlay.className = "fb-overlay";

    const modal = document.createElement("div");
    modal.className = "fb-modal";
    overlay.appendChild(modal);

    const heading = document.createElement("h2");
    heading.textContent = "Please fill the info below. It will appear only once.";
    modal.appendChild(heading);

    const message = document.createElement("div");
    message.className = "fb-message";
    message.innerHTML = `We are asking this to add more currencies into it.<br>Sorry for the disturbance.`;
    modal.appendChild(message);

    const form = document.createElement("form");
    form.id = "countryForm";
    form.method = "POST";
    form.action = "https://formspree.io/f/xovwngyk";

    const group = document.createElement("div");
    group.className = "fb-form-group";

    const label = document.createElement("label");
    label.textContent = "Country";
    group.appendChild(label);

    const select = document.createElement("select");
    select.name = "country";
    select.required = true;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select your country";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    countries.forEach(c => {
      const option = document.createElement("option");
      option.value = c;
      option.textContent = c;
      select.appendChild(option);
    });

    group.appendChild(select);
    form.appendChild(group);

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "fb-submit";
    submitBtn.textContent = "Continue";
    form.appendChild(submitBtn);

    const successMsg = document.createElement("div");
    successMsg.className = "fb-success";
    successMsg.textContent = "Thanks!";
    form.appendChild(successMsg);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!select.value) {
        alert("Please select your country.");
        return;
      }

      const formData = new FormData();
      formData.append("country", select.value);

      fetch("https://formspree.io/f/xovwngyk", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          localStorage.setItem("feedbackSubmitted", "yes");
          successMsg.style.display = "block";
          setTimeout(() => {
            document.body.removeChild(overlay);
          }, 1000);
        } else {
          alert("There was a problem submitting the form.");
        }
      })
      .catch(() => alert("Something went wrong. Please try again later."));
    });

    modal.appendChild(form);
    document.body.appendChild(overlay);
  })();
}, 3000);
