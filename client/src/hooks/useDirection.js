import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RTL_LANGS } from "../lib/i18n";

/**
 * Syncs <html dir> and <html lang> with the active i18n language.
 * Returns the current direction ("ltr" | "rtl") for components that need it.
 */
export default function useDirection() {
  const { i18n } = useTranslation();
  const [dir, setDir] = useState(() => {
    const base = (i18n.language || "en").split("-")[0];
    return RTL_LANGS.includes(base) ? "rtl" : "ltr";
  });

  useEffect(() => {
    const update = (lng) => {
      const base = (lng || "en").split("-")[0];
      const next = RTL_LANGS.includes(base) ? "rtl" : "ltr";
      document.documentElement.dir = next;
      document.documentElement.lang = base;
      setDir(next);
    };

    // Apply on mount
    update(i18n.language);

    // Listen for changes
    i18n.on("languageChanged", update);
    return () => i18n.off("languageChanged", update);
  }, [i18n]);

  return dir;
}
