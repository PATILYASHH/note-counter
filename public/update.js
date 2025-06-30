setTimeout(() => {
  // Check if user unsubscribed
  if (localStorage.getItem("updateUnsubscribed") === "yes") return;

  // Create notification bar
  const bar = document.createElement("div");
  bar.id = "updateNotification";
  bar.style.position = "fixed";
  bar.style.top = "0";
  bar.style.left = "0";
  bar.style.width = "100%";
  bar.style.zIndex = "9999";
  bar.style.backgroundColor = "#007bff"; // for alert color
  bar.style.color = "white";
  bar.style.padding = "12px 20px";
  bar.style.display = "flex";
  bar.style.justifyContent = "space-between";
  bar.style.alignItems = "center";
  bar.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
  bar.style.fontFamily = "Segoe UI, sans-serif";
  bar.style.fontSize = "15px";
  bar.style.transition = "top 0.3s ease";

  bar.innerHTML = `
    <div>🚀 <strong>New Currency Request</strong> If you want to add a new currency in the notecounter, please feedback the currency name, it will be added soon</div>
    <button id="unsubscribeUpdate" style="
      background: transparent;
      border: 1px solid white;
      color: white;
      padding: 4px 10px;
      border-radius: 5px;
      font-size: 13px;
      cursor: pointer;
    ">Unsubscribe</button>
  `;

  document.body.appendChild(bar);

  // Auto-hide after 2 seconds
  setTimeout(() => {
    bar.style.top = "-60px";
    setTimeout(() => {
      if (bar && bar.parentNode) {
        bar.parentNode.removeChild(bar);
      }
    }, 300); // Remove from DOM after slide-up
  }, 7000);

  // Handle unsubscribe
  document.getElementById("unsubscribeUpdate").addEventListener("click", () => {
    localStorage.setItem("updateUnsubscribed", "yes");
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
  });

}, 15000); // show after 15 seconds
