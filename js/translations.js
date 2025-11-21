// translations.js
// Loads translations from data/translations.json and applies them.
// Also works with hover-preview for the language dropdown.

let translations = {};
let currentLanguage = "en";

async function initTranslations(initialLang) {
  try {
    const res = await fetch("data/translations.json");
    translations = await res.json();
    applyLanguage(initialLang);
  } catch (err) {
    console.error("Error loading translations:", err);
  }
}

function applyLanguage(lang) {
  if (!translations[lang]) {
    console.warn("No translations for language:", lang);
    return;
  }

  currentLanguage = lang;
  const dict = translations[lang];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  const trigger = document.getElementById("language-trigger");
  if (trigger) {
    const labelMap = {
      en: "English",
      es: "Español",
      zh: "中文 (Mandarin)",
      hi: "हिन्दी"
    };
    trigger.textContent = labelMap[lang] || "Language";
  }
}
