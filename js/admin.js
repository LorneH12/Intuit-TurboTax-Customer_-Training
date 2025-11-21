// admin.js
// Loads a JSON summary for the TurboTax training admin dashboard

// Use your existing web app URL + ?mode=summary
const SUMMARY_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzn27HXHggRSc2LnaNHoQfCmSZPhm0dVb12m_qVTAykiKyIuy8nxuTStoEIqr-WMBo/exec?mode=summary";

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

async function loadAdminSummary() {
  const errorBadge = document.getElementById("analytics-error-badge");

  try {
    if (errorBadge) {
      errorBadge.textContent = "Loading analytics…";
    }

    const res = await fetch(SUMMARY_ENDPOINT);
    const text = await res.text();

    let summary;
    try {
      summary = JSON.parse(text);
    } catch (err) {
      console.error("Admin summary not valid JSON. Raw response:", text);
      throw err;
    }

    // Cards
    setText("total-learners-value", summary.totalLearners ?? "0");
    setText("completions-value", summary.completions ?? "0");

    const rate = summary.completionRate ?? 0;
    setText("completion-rate-value", (rate * 100).toFixed(0) + "%");

    // Tables
    renderLanguageTable(summary.byLanguage);
    renderEventTable(summary.eventCounts);

    // Clear error badge
    if (errorBadge) {
      errorBadge.textContent = "Analytics loaded";
      errorBadge.classList.remove("error");
      errorBadge.classList.add("success");
    }
  } catch (err) {
    console.error("Admin summary load failed:", err);
    if (errorBadge) {
      errorBadge.textContent = "Error loading analytics";
      errorBadge.classList.add("error");
    }
  }
}

document.addEventListener("DOMContentLoaded", loadAdminSummary);
