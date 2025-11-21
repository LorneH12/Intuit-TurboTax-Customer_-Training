// admin.js
// Loads a JSON summary for the TurboTax training admin dashboard using JSONP

// Base web app URL (no query params)
const SUMMARY_BASE =
  "https://script.google.com/macros/s/AKfycbzZP3DXUIniuLNupihHtBLujyOxHTgAB8TBnFeey2LZOks0hZXnwBBQKP6UOTZYNMk/exec";

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderLanguageTable(byLanguage) {
  const tbody = document.getElementById("language-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const entries = Object.entries(byLanguage || {});
  if (!entries.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="empty" colspan="2">No data yet</td>`;
    tbody.appendChild(tr);
    return;
  }

  entries.forEach(([lang, count]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="lang-label">${lang}</td>
      <td class="lang-count">${count}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderEventTable(eventCounts) {
  const tbody = document.getElementById("event-types-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const entries = Object.entries(eventCounts || {});
  if (!entries.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="empty" colspan="2">No events logged yet</td>`;
    tbody.appendChild(tr);
    return;
  }

  entries.forEach(([evt, count]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="evt-label">${evt}</td>
      <td class="evt-count">${count}</td>
    `;
    tbody.appendChild(tr);
  });
}

// This is the JSONP callback that Apps Script will call
function handleSummary(summary) {
  const errorBadge = document.getElementById("analytics-error-badge");

  try {
    // Cards
    setText("total-learners-value", summary.totalLearners ?? "0");
    setText("completions-value", summary.completions ?? "0");

    const rate = summary.completionRate ?? 0;
    setText("completion-rate-value", (rate * 100).toFixed(0) + "%");

    // Tables
    renderLanguageTable(summary.byLanguage);
    renderEventTable(summary.eventCounts);

    if (errorBadge) {
      errorBadge.textContent = "Analytics loaded";
      errorBadge.classList.remove("error");
      errorBadge.classList.add("success");
    }
  } catch (err) {
    console.error("Error rendering admin summary:", err);
    if (errorBadge) {
      errorBadge.textContent = "Error rendering analytics";
      errorBadge.classList.add("error");
    }
  }
}

function loadAdminSummary() {
  const errorBadge = document.getElementById("analytics-error-badge");
  if (errorBadge) {
    errorBadge.textContent = "Loading analytics…";
    errorBadge.classList.remove("error", "success");
  }

  // Build JSONP URL: ?mode=summary&callback=handleSummary
  const url =
    `${SUMMARY_BASE}?mode=summary&callback=handleSummary&_=${Date.now()}`;

  const script = document.createElement("script");
  script.src = url;
  script.async = true;

  script.onerror = function (err) {
    console.error("Admin summary script load failed:", err);
    if (errorBadge) {
      errorBadge.textContent = "Error loading analytics";
      errorBadge.classList.add("error");
    }
  };

  document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", loadAdminSummary);
