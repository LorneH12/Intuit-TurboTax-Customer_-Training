// analytics.js
// Simple event tracking to your Google Apps Script endpoint

const ANALYTICS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwmm1HguMiy1S7PDBjU1pTihNgD94xcvmlAkaiiOawty3hcJbMc8VfiXrFUO6NbIqA/exec";

function trackEvent(eventType, data = {}) {
  const payload = {
    eventType,
    data,
    ts: new Date().toISOString()
  };

  // Fire-and-forget
  fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).catch((err) => {
    console.warn("Analytics send failed:", err);
  });
}
