// analytics.js
// Simple event tracking to your Google Apps Script endpoint

const ANALYTICS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyDYDlaYYcTp87Ps2Be5harfGXz6zcOBL1ad4099qvemZEADM2IDt0LCS12RHbnISM/exec";

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
