// admin.js
// Fetch summary analytics from the Apps Script endpoint and render the admin dashboard

document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.getElementById("admin-status-pill");
  const learnersEl = document.getElementById("metric-learners");
  const completionsEl = document.getElementById("metric-completions");
  const completionRateEl = document.getElementById("metric-completion-rate");
  const languageBreakdownEl = document.getElementById("language-breakdown");
  const eventTableBodyEl = document.getElementById("event-table-body");

  async function loadSummary() {
    try {
      if (statusEl) {
        statusEl.textContent = "Loading analytics…";
      }

      // ANALYTICS_ENDPOINT is defined in analytics.js
      const url = `${ANALYTICS_ENDPOINT}?mode=summary`;
      const res = await fetch(url, { method: "GET" });
      const data = await res.json();

      if (data.status !== "ok") {
        throw new Error(data.error || "Unknown error from summary endpoint");
      }

      const totals = data.totals || {};
      const eventCounts = data.eventCounts || {};
      const registrationsByLanguage = data.registrationsByLanguage || {};
      const completionsByLanguage = data.completionsByLanguage || {};

      if (learnersEl) learnersEl.textContent = totals.learners ?? 0;
      if (completionsEl) completionsEl.textContent = totals.completions ?? 0;
      if (completionRateEl)
        completionRateEl.textContent =
          (totals.completionRate ?? 0).toString() + "%";

      // Render language pills
      if (languageBreakdownEl) {
        languageBreakdownEl.innerHTML = "";

        const langs = new Set([
          ...Object.keys(registrationsByLanguage),
          ...Object.keys(completionsByLanguage)
        ]);

        if (langs.size === 0) {
          const span = document.createElement("span");
          span.textContent = "No learner data yet.";
          span.style.opacity = "0.8";
          languageBreakdownEl.appendChild(span);
        } else {
          langs.forEach((lang) => {
            const reg = registrationsByLanguage[lang] || 0;
            const comp = completionsByLanguage[lang] || 0;
            const rate =
              reg > 0 ? Math.round((comp / reg) * 100) : 0;

            const pill = document.createElement("div");
            pill.className = "pill";
            pill.textContent = `${lang.toUpperCase()} — ${comp}/${reg} completed (${rate}%)`;
            languageBreakdownEl.appendChild(pill);
          });
        }
      }

      // Render event table
      if (eventTableBodyEl) {
        eventTableBodyEl.innerHTML = "";

        const entries = Object.entries(eventCounts);
        if (entries.length === 0) {
          const tr = document.createElement("tr");
          const td = document.createElement("td");
          td.colSpan = 2;
          td.textContent = "No events logged yet.";
          td.style.opacity = "0.8";
          tr.appendChild(td);
          eventTableBodyEl.appendChild(tr);
        } else {
          entries
            .sort((a, b) => b[1] - a[1])
            .forEach(([eventType, count]) => {
              const tr = document.createElement("tr");

              const typeTd = document.createElement("td");
              typeTd.textContent = eventType;
              tr.appendChild(typeTd);

              const countTd = document.createElement("td");
              countTd.textContent = count.toString();
              tr.appendChild(countTd);

              eventTableBodyEl.appendChild(tr);
            });
        }
      }

      if (statusEl) {
        statusEl.textContent = "Analytics live";
      }
    } catch (err) {
      console.error("Admin summary load failed:", err);
      if (statusEl) {
        statusEl.textContent = "Error loading analytics";
      }
    }
  }

  loadSummary();
});
