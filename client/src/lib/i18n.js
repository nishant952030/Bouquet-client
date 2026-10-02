import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

import enTranslation from "../../public/locales/en.json";
import esTranslation from "../../public/locales/es.json";
import bnTranslation from "../../public/locales/bn.json";
import frTranslation from "../../public/locales/fr.json";
import arTranslation from "../../public/locales/ar.json";
import tlTranslation from "../../public/locales/tl.json";

const SUPPORTED_LANGS = ["en", "es", "bn", "fr", "ar", "tl"];
const RTL_LANGS = ["ar"];

/**
 * Update <html lang> and <html dir> when language changes.
 */
function applyDocumentDirection(lng) {
  if (typeof document === "undefined") return;
  const resolved = lng || i18n.language || "en";
  const base = resolved.split("-")[0]; // "en-US" → "en"
  document.documentElement.lang = base;
  document.documentElement.dir = RTL_LANGS.includes(base) ? "rtl" : "ltr";
}

const phDetector = {
  name: 'phDetector',
  lookup(options) {
    if (typeof window === "undefined" || !globalThis.localStorage) return undefined;
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
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS,
    keySeparator: false,
    nsSeparator: false,
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
      bn: { translation: bnTranslation },
      fr: { translation: frTranslation },
      ar: { translation: arTranslation },
      tl: { translation: tlTranslation },
    },

    /* Language detection config */
    detection: {
      order: ["localStorage", "phDetector", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false,
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
