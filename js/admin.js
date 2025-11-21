// admin.js
// Loads a JSON summary for the TurboTax training admin dashboard using JSONP

// IMPORTANT — your actual Apps Script Web App endpoint:
const SUMMARY_BASE =
  "https://script.google.com/macros/s/AKfycbzZP3DXUIniuLNupihHtBLujyOxHTgAB8TBnFeey2LZOks0hZXnwBBQKP6UOTZYNMk/exec";

// Utility to fill text in a card
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Renders the language count table
function renderLanguageTable(byLanguage) {
  const tbody = document.getElementById("language-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const entries = Object.entries(byLanguage || {});
  if (!entries.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="2">No data yet</td></tr>`;
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

// Renders event type counts
function renderEventTable(eventCounts) {
  const tbody = document.getElementById("event-types-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const entries = Object.entries(eventCounts || {});
  if (!entries.length) {
    tbody.innerHTML = `<tr><td class="empty" colspan="2">No events yet</td></tr>`;
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

// JSONP callback — Apps Script calls this function
function handleSummary(summary) {
  const errorBadge = document.getElementById("analytics-error-badge");

  try {
    // Main cards
    setText("total-learners-value", summary.totalLearners ?? "0");
    setText("completions-value", summary.completions ?? "0");

    const rate = summary.completionRate ?? 0;
    setText("completion-rate-value", Math.round(rate * 100) + "%");

    // Tables
    renderLanguageTable(summary.byLanguage);
    renderEventTable(summary.eventCounts);

    // Status badge
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

// Loads JSONP from Apps Script
function loadAdminSummary() {
  const errorBadge = document.getElementById("analytics-error-badge");
  if (errorBadge) {
    errorBadge.textContent = "Loading analytics…";
    errorBadge.classList.remove("error", "success");
  }

  // JSONP URL
  const url =
    `${SUMMARY_BASE}?mode=summary&callback=handleSummary&_=${Date.now()}`;

  const script = document.createElement("script");
  script.src = url;
  script.async = true;

  script.onerror = function () {
    console.error("Admin summary script load failed");
    if (errorBadge) {
      errorBadge.textContent = "Error loading analytics";
      errorBadge.classList.add("error");
    }
  };

  document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", loadAdminSummary);
