import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { loadGiftCart } from "../lib/giftCart.js";

export default function CreatorNavbar({ showCart = true, backLink = "/", backText }) {
  const { t } = useTranslation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const items = loadGiftCart();
      setCartCount(items.length);
    };

    updateCount();
    window.addEventListener("gift-cart-updated", updateCount);
    return () => window.removeEventListener("gift-cart-updated", updateCount);
  }, []);

  return (
    <header className="sticky top-3 z-50 mx-auto mb-5 w-[calc(100%-24px)] max-w-5xl rounded-full border border-rose-200/50 bg-white/80 p-2.5 shadow-lg shadow-rose-900/5 backdrop-blur-xl sm:px-5 sm:py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back / Home Pill */}
        <Link
          to={backLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
        >
          {backText || t("common.home", "← Home")}
        </Link>

        {/* Center: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 transition hover:opacity-90">
          <img
            src="/logo-transparent.png"
            alt="Petals & Words Logo"
            className="h-7 w-auto object-contain sm:h-9"
          />
        </Link>

        {/* Right: Cart & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showCart && (
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center rounded-full border border-stone-200/80 bg-white/90 p-2 text-stone-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              title={t("cart.title", "Gift Cart")}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
