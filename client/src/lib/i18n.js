import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

const SUPPORTED_LANGS = ["en", "es", "bn", "fr", "ar", "tl"];
const RTL_LANGS = ["ar"];

/**
 * Update <html lang> and <html dir> when language changes.
 */
function applyDocumentDirection(lng) {
  const resolved = lng || i18n.language || "en";
  const base = resolved.split("-")[0]; // "en-US" → "en"
  document.documentElement.lang = base;
  document.documentElement.dir = RTL_LANGS.includes(base) ? "rtl" : "ltr";
}

const phDetector = {
  name: 'phDetector',
  lookup(options) {
    if (localStorage.getItem('i18nextLng')) return undefined;
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone === 'Asia/Manila') {
        return 'tl';
      }
    } catch(e) {}
    return undefined;
  },
  cacheUserLanguage(lng, options) {}
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(phDetector);

i18n
  .use(HttpBackend)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS,

    /* Only load translation files for the active language (code-split) */
    load: "languageOnly", // "en-US" → loads "en"

    /* Language detection config */
    detection: {
      order: ["localStorage", "phDetector", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },

    /* Lazy-load from /public/locales/{lng}.json */
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: true,
    },
  });

/* Set direction on initial load and every subsequent change */
i18n.on("languageChanged", applyDocumentDirection);

/* Apply immediately if language is already resolved */
if (i18n.language) {
  applyDocumentDirection(i18n.language);
}

export { SUPPORTED_LANGS, RTL_LANGS };
export default i18n;
