// script.js
// Multi-page TurboTax flow with:
// - Theme toggle
// - Language dropdown + preview
// - LocalStorage for user + language
// - Quiz submission and completion events

let committedLanguage = "en";

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function getStoredLanguageOrDefault() {
  return localStorage.getItem("tt_language") || "en";
}

function storeLanguage(lang) {
  localStorage.setItem("tt_language", lang);
}

function getStoredThemeOrDefault() {
  return localStorage.getItem("tt_theme") || "dark";
}

function storeTheme(theme) {
  localStorage.setItem("tt_theme", theme);
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("tt_user")) || {};
  } catch (e) {
    return {};
  }
}

function storeUser(user) {
  localStorage.setItem("tt_user", JSON.stringify(user));
}

function storeQuizScore(score, maxScore) {
  localStorage.setItem(
    "tt_quiz",
    JSON.stringify({ score, maxScore, ts: new Date().toISOString() })
  );
}

/* THEME TOGGLE */

function initThemeToggle() {
  const checkbox = document.getElementById("theme-checkbox");
  const label = document.getElementById("theme-label");
  if (!checkbox || !label) return;

  const storedTheme = getStoredThemeOrDefault();
  if (storedTheme === "light") {
    document.body.classList.add("light-mode");
    checkbox.checked = false;
    label.textContent = "Light";
  } else {
    document.body.classList.remove("light-mode");
    checkbox.checked = true;
    label.textContent = "Dark";
  }

  trackEvent("theme_initialized", { theme: storedTheme });

  checkbox.addEventListener("change", () => {
    const isDark = checkbox.checked;
    if (isDark) {
      document.body.classList.remove("light-mode");
      label.textContent = "Dark";
      storeTheme("dark");
      trackEvent("theme_changed", { theme: "dark" });
    } else {
      document.body.classList.add("light-mode");
      label.textContent = "Light";
      storeTheme("light");
      trackEvent("theme_changed", { theme: "light" });
    }
  });
}

/* LANGUAGE DROPDOWN */

function initLanguageDropdown() {
  const dropdown = document.getElementById("language-dropdown");
  const trigger = document.getElementById("language-trigger");
  const menu = document.getElementById("language-menu");
  if (!dropdown || !trigger || !menu) return;

  committedLanguage = getStoredLanguageOrDefault();
  applyLanguage(committedLanguage);

  const hiddenInput = document.getElementById("language-input");
  if (hiddenInput) {
    hiddenInput.value = committedLanguage;
  }

  trigger.addEventListener("click", () => {
    const isOpen = dropdown.classList.toggle("open");
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  const items = menu.querySelectorAll("li");

  items.forEach((item) => {
    const lang = item.dataset.lang;

    if (!isTouchDevice()) {
      item.addEventListener("mouseenter", () => {
        applyLanguage(lang);
        trackEvent("language_preview", { lang });
      });
    }

    item.addEventListener("click", () => {
      committedLanguage = lang;
      storeLanguage(lang);
      applyLanguage(lang);
      dropdown.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");

      if (hiddenInput) hiddenInput.value = lang;

      trackEvent("language_selected", { lang });
    });
  });

  if (!isTouchDevice()) {
    dropdown.addEventListener("mouseleave", () => {
      applyLanguage(committedLanguage);
    });
  }

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      if (!isTouchDevice()) {
        applyLanguage(committedLanguage);
      }
    }
  });
}

/* PAGE-SPECIFIC LOGIC */

// Welcome page
function initWelcomePage() {
  const form = document.getElementById("welcome-form");
  if (!form) return;

  const user = getStoredUser();
  if (user.name) {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    if (nameInput) nameInput.value = user.name || "";
    if (emailInput) emailInput.value = user.email || "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const langInput = document.getElementById("language-input");
    const langValue = (langInput && langInput.value) || committedLanguage;

    if (!name || !email) {
      alert("Please complete all fields to continue.");
      return;
    }

    const userObj = { name, email, language: langValue };
    storeUser(userObj);
    storeLanguage(langValue);
    committedLanguage = langValue;

    trackEvent("registration_submitted", {
      name,
      email,
      language: langValue
    });

    window.location.href = "benefits.html";
  });
}

// Benefits page
function initBenefitsPage() {
  const btn = document.getElementById("btn-start-objectives");
  if (!btn) return;

  btn.addEventListener("click", () => {
    trackEvent("cta_clicked", {
      fromPage: "benefits",
      action: "to_objectives",
      language: committedLanguage
    });
    window.location.href = "objectives.html";
  });
}

// Objectives page
function initObjectivesPage() {
  const btn = document.getElementById("btn-to-quiz");
  if (!btn) return;

  btn.addEventListener("click", () => {
    trackEvent("cta_clicked", {
      fromPage: "objectives",
      action: "to_quiz",
      language: committedLanguage
    });
    window.location.href = "quiz.html";
  });
}

// Quiz page
function initQuizPage() {
  const quizForm = document.getElementById("quiz-form");
  const feedbackEl = document.getElementById("quiz-feedback");
  if (!quizForm || !feedbackEl) return;

  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const selected = quizForm.querySelector("input[name='q1']:checked");
    if (!selected) {
      alert("Please select an answer before continuing.");
      return;
    }

    const answer = selected.value;
    const isCorrect = answer === "b";
    const score = isCorrect ? 1 : 0;

    const dict = translations[currentLanguage] || translations["en"];
    const msg = isCorrect
      ? dict.quiz_feedback_correct
      : dict.quiz_feedback_incorrect;

    feedbackEl.textContent = msg;

    storeQuizScore(score, 1);

    const user = getStoredUser();

    trackEvent("quiz_submitted", {
      questionId: "q1_turbotax_benefit",
      selectedAnswer: answer,
      isCorrect,
      score,
      maxScore: 1,
      language: committedLanguage,
      email: user.email || "",
      name: user.name || ""
    });

    trackEvent("intro_completed", {
      name: user.name || "",
      email: user.email || "",
      language: committedLanguage,
      quizScore: score,
      quizMax: 1
    });

    setTimeout(() => {
      window.location.href = "complete.html";
    }, 1300);
  });
}

// Complete page
function initCompletePage() {
  const user = getStoredUser();
  const name = user.name || "Customer";
  const nameEl = document.getElementById("complete-name");
  if (nameEl) {
    nameEl.textContent = name;
  }
}

/* INIT */

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page || "unknown";
  const initialLang = getStoredLanguageOrDefault();

  await initTranslations(initialLang);
  committedLanguage = initialLang;

  initThemeToggle();
  initLanguageDropdown();

  if (page === "welcome") initWelcomePage();
  if (page === "benefits") initBenefitsPage();
  if (page === "objectives") initObjectivesPage();
  if (page === "quiz") initQuizPage();
  if (page === "complete") initCompletePage();

  trackEvent("page_view", {
    page,
    language: committedLanguage,
    theme: getStoredThemeOrDefault()
  });
});
