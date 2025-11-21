// analytics.js
// Simple event tracking to your Google Apps Script endpoint

const ANALYTICS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzZP3DXUIniuLNupihHtBLujyOxHTgAB8TBnFeey2LZOks0hZXnwBBQKP6UOTZYNMk/exec";

function trackEvent(eventType, data = {}) {
  const payload = {
    eventType,
    data,
    ts: new Date().toISOString()
  };

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
