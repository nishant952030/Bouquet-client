import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Copy,
  Gift,
  Home,
  Link2,
  Plus,
  Send,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { trackEvent } from "../lib/analytics";
import { createGiftBundle } from "../lib/giftBundle";
import {
  clearGiftCart,
  formatCartMoney,
  getGiftCartTotals,
  getGiftItemPriceMinor,
  getGiftItemSubtitle,
  getGiftItemTitle,
  getGiftProductMeta,
  loadGiftCart,
  normalizeCurrency,
  removeGiftCartItem,
  updateGiftCartItemTier,
} from "../lib/giftCart";
import { loadRazorpayScript } from "../lib/razorpay";
import { applySeo } from "../lib/seo";

const API_BASE_URL = String((typeof process !== "undefined" && process.env && process.env.VITE_API_BASE_URL) || "").replace(/\/+$/, "");

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box}

  .cart-root{min-height:100vh;background:linear-gradient(160deg,#fdf6f0 0%,#f8edf0 55%,#fdf0f5 100%);color:#3E2723;font-family:'Manrope',sans-serif}

  .cart-header{position:sticky;top:0;z-index:30;background:rgba(253,246,240,0.88);backdrop-filter:blur(22px);border-bottom:1px solid rgba(200,130,140,0.10);box-shadow:0 2px 20px rgba(200,100,120,0.06)}
  .cart-header-inner{max-width:980px;margin:0 auto;padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
  .cart-logo{height:32px;width:auto}
  .cart-header-actions{display:flex;align-items:center;gap:.6rem}

  .cart-shell{max-width:980px;margin:0 auto;padding:1.25rem 1rem 7rem}
  .cart-top{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin:1.2rem 0 1rem}
  .cart-kicker{display:inline-flex;align-items:center;gap:.4rem;color:#a65d5d;font-family:'Montserrat',sans-serif;font-size:.7rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;margin-bottom:.35rem}
  .cart-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4.5vw,2.7rem);line-height:1.15;font-weight:500;margin:0;color:#3d3028}
  .cart-copy{font-size:.9rem;color:#705f58;margin:.45rem 0 0;max-width:560px;line-height:1.6}

  .cart-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:1.25rem;align-items:start}
  .cart-panel,.cart-item,.cart-empty{background:rgba(255,255,255,0.82);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.85);border-radius:1.5rem;box-shadow:0 8px 32px rgba(200,130,140,0.10)}
  .cart-list{display:flex;flex-direction:column;gap:.75rem}
  .cart-item{padding:1.25rem;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:1rem;align-items:center}
  .cart-icon{width:48px;height:48px;border-radius:1rem;background:linear-gradient(135deg,#fff5f4,#ffd9d8);color:#a65d5d;display:grid;place-items:center;flex:none;font-size:1.4rem}
  .cart-item h2{font-family:'Montserrat',sans-serif;font-size:.95rem;font-weight:700;margin:0;color:#3d3028;line-height:1.3}
  .cart-item p{font-size:.8rem;margin:.25rem 0 0;color:#705f58;line-height:1.45}
  .cart-price{font-family:'Montserrat',sans-serif;font-size:.92rem;font-weight:800;color:#a65d5d;white-space:nowrap;text-align:right}
  .cart-remove{width:36px;height:36px;border:1px solid rgba(166,93,93,0.2);border-radius:50%;background:rgba(255,255,255,0.8);color:#a65d5d;display:grid;place-items:center;cursor:pointer;transition:all .18s}
  .cart-remove:hover{background:#ffd9d8;transform:scale(1.05)}

  .cart-summary{padding:1.5rem;position:sticky;top:78px;display:block}
  .cart-summary h2{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:500;margin:0 0 .85rem;color:#3d3028}
  .cart-row{display:flex;justify-content:space-between;gap:1rem;font-size:.86rem;color:#705f58;padding:.5rem 0;border-bottom:1px solid rgba(200,130,140,0.12)}
  .cart-total{display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;padding:1rem 0 .85rem}
  .cart-total span{font-family:'Montserrat',sans-serif;font-size:.72rem;color:#a65d5d;text-transform:uppercase;letter-spacing:.14em;font-weight:800}
  .cart-total strong{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;color:#7c3f4f}

  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .cart-btn{min-height:50px;border:0;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-family:'Montserrat',sans-serif;font-size:.88rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;text-decoration:none;transition:transform .18s ease}
  .cart-btn:active{transform:scale(.98)}
  .cart-btn-primary{width:100%;background:linear-gradient(135deg,#a65d5d 0%,#7c3f4f 100%);color:#fff;animation:pw-pulse 2.5s infinite}
  .cart-btn-primary:hover:not(:disabled){transform:translateY(-2px)}
  .cart-btn-primary:disabled{background:#e4e2de;color:#9e8f90;cursor:not-allowed;box-shadow:none;animation:none}
  .cart-btn-ghost{border:1.5px solid rgba(124,67,67,0.22);background:rgba(255,255,255,0.7);color:#7c4343;padding:.4rem .9rem;border-radius:9999px;font-size:.78rem;font-weight:600}
  .cart-btn-ghost:hover{background:#ffd9d8;border-color:#7c4343}
  .cart-btn-soft{background:#fff5f4;color:#a65d5d;padding:.7rem .9rem;width:100%;border:1px solid rgba(200,130,140,0.2);border-radius:9999px}
  .cart-add-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem;margin-top:1rem}
  .cart-status{border-radius:.875rem;background:#fff5f4;color:#a65d5d;padding:.75rem .85rem;font-size:.8rem;line-height:1.5;margin-top:.75rem;border:1px solid rgba(200,130,140,0.2)}
  .cart-empty{padding:2.5rem 1.5rem;text-align:center}
  .cart-empty-icon{width:64px;height:64px;margin:0 auto 1rem;border-radius:1.25rem;background:linear-gradient(135deg,#fff5f4,#ffd9d8);color:#a65d5d;display:grid;place-items:center;font-size:1.8rem}
  .cart-empty h1{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:500;margin:0 0 .35rem;color:#3d3028}
  .cart-empty p{font-size:.86rem;color:#705f58;line-height:1.6;margin:0 auto 1.25rem;max-width:360px}
  .cart-success{max-width:560px;margin:2rem auto 0;text-align:center}
  .cart-share-box{background:rgba(255,255,255,0.85);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.85);border-radius:1.5rem;box-shadow:0 8px 32px rgba(200,130,140,0.10);padding:1.25rem;text-align:left;margin:1rem 0}
  .cart-url{background:rgba(255,243,240,0.7);border-radius:.875rem;color:#7b5455;word-break:break-all;padding:.85rem 1rem;font-size:.84rem;line-height:1.5;margin:.75rem 0;font-family:'Manrope',monospace}
  .cart-share-actions{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
  .cart-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.45);border-top-color:#fff;animation:cartSpin .8s linear infinite}
  @keyframes cartSpin{to{transform:rotate(360deg)}}

  /* --- Add another gift panel --- */
  .cart-add-panel{background:rgba(255,255,255,0.78);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.85);border-radius:1.5rem;box-shadow:0 8px 32px rgba(200,130,140,0.10);padding:1.25rem;margin-top:1rem}
  .cart-add-panel-heading{display:flex;align-items:center;gap:.5rem;font-family:'Montserrat',sans-serif;font-size:.72rem;font-weight:800;color:#a65d5d;letter-spacing:.14em;text-transform:uppercase;margin-bottom:.85rem}
  .cart-add-products{display:grid;grid-template-columns:repeat(2,1fr);gap:.65rem}
  .cart-add-product{display:flex;flex-direction:column;align-items:flex-start;gap:.2rem;background:rgba(255,255,255,0.75);border:1.5px solid rgba(200,130,140,0.15);border-radius:1rem;padding:.75rem .85rem;text-decoration:none;color:#3d3028;transition:all .18s}
  .cart-add-product:hover{border-color:#a65d5d;background:#fff5f4;transform:translateY(-2px)}
  .cart-add-product-icon{width:36px;height:36px;border-radius:.75rem;background:#fff5f4;color:#a65d5d;display:grid;place-items:center;margin-bottom:.3rem;flex:none}
  .cart-add-product-label{font-family:'Montserrat',sans-serif;font-size:.82rem;font-weight:700;color:#3d3028;line-height:1.2}
  .cart-add-product-desc{font-size:.72rem;color:#705f58;line-height:1.35}
  .cart-add-product-plus{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#a65d5d,#7c3f4f);color:#fff;display:grid;place-items:center;margin-left:auto;margin-top:.25rem;align-self:flex-end;flex:none}

  /* Tier selector */
  .tier-selector { display: flex; gap: 4px; background: rgba(200,130,140,0.1); padding: 4px; border-radius: 9999px; margin-top: 12px; }
  .tier-btn { flex: 1; border: none; background: transparent; padding: 6px 4px; font-size: 0.72rem; font-weight: 600; color: #705f58; border-radius: 9999px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 1px; font-family:'Montserrat',sans-serif }
  .tier-btn:hover { background: rgba(255,255,255,0.6); }
  .tier-btn.active { background: #fff; color: #7c3f4f; font-weight: 700; box-shadow: 0 2px 8px rgba(124,63,79,0.15); }
  .tier-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .tier-price { font-size: 0.78rem; font-weight: 800; }

  /* Fixed payment bar */
  .cart-pay-bar{position:fixed;inset:auto 0 0;z-index:40;background:rgba(253,246,240,0.96);backdrop-filter:blur(22px);border-top:1px solid rgba(200,130,140,0.12);padding:.75rem 1rem 1.1rem;display:none}
  .cart-pay-bar-inner{max-width:980px;margin:0 auto;display:flex;align-items:center;gap:.85rem}
  .cart-pay-bar-meta{flex:1;min-width:0}
  .cart-pay-bar-label{font-family:'Montserrat',sans-serif;font-size:.65rem;font-weight:800;color:#a65d5d;letter-spacing:.12em;text-transform:uppercase}
  .cart-pay-bar-total{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:700;color:#3d3028;line-height:1.15}
  .cart-pay-bar-sub{font-size:.72rem;color:#705f58;margin-top:.1rem}
  .cart-pay-bar-btn{flex:none;min-height:50px;padding:0 1.6rem;border-radius:9999px;background:linear-gradient(135deg,#a65d5d,#7c3f4f);color:#fff;border:0;font-family:'Montserrat',sans-serif;font-size:.88rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:.5rem;animation:pw-pulse 2.5s infinite}
  .cart-pay-bar-btn:disabled{background:#e4e2de;color:#9e8f90;cursor:not-allowed;box-shadow:none;animation:none}
  .cart-pay-bar-status{font-size:.76rem;color:#a65d5d;background:#fff5f4;border-radius:.75rem;padding:.45rem .7rem;margin-top:.5rem;max-width:980px;margin-left:auto;margin-right:auto}

  @media(max-width:780px){
    .cart-top{align-items:flex-start;flex-direction:column}
    .cart-grid{grid-template-columns:1fr}
    .cart-summary{display:none}
    .cart-pay-bar{display:block}
  }
  @media(min-width:781px){
    .cart-pay-bar{display:none}
  }
  @media(max-width:460px){
    .cart-item{grid-template-columns:auto minmax(0,1fr);align-items:start}
    .cart-price{grid-column:2;text-align:left}
    .cart-remove{grid-row:1;grid-column:1;margin-top:52px}
    .cart-add-grid,.cart-share-actions{grid-template-columns:1fr}
    .cart-add-products{grid-template-columns:1fr}
  }
`;

function apiUrl(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

async function readApi(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await res.text();
    return text ? { error: text } : null;
  } catch {
    return null;
  }
}

function getLikelyCountryFromClient() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const locale = String(navigator?.language || "").toUpperCase();
    if (tz === "Asia/Manila" || locale.includes("-PH")) return "PH";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || locale.includes("-IN")) return "IN";
    return "OTHER";
  } catch {
    return "OTHER";
  }
}

function trackCart(name, payload) {
  track(name, payload);
  trackEvent(name, payload);
}

export default function Cart() {
  const [items, setItems] = useState(() => loadGiftCart());
  const [checkedOutItems, setCheckedOutItems] = useState([]);
  const [countryCode, setCountryCode] = useState(() => getLikelyCountryFromClient());
  const [detectingCountry, setDetectingCountry] = useState(true);
  const [paying, setPaying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [paid, setPaid] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const razorpayKey =
    typeof process !== "undefined" && process.env
      ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID
      : undefined;
  const currency = normalizeCurrency(countryCode);
  const totals = useMemo(() => getGiftCartTotals(items, currency), [items, currency]);
  const displayItems = paid ? checkedOutItems : items;

  useEffect(() => {
    applySeo({
      title: "Gift Cart | Petals and Words",
      description: "Review your digital gifts and generate one combined receiver link.",
      path: "/cart",
      robots: "noindex,nofollow",
    });
  }, []);

  useEffect(() => {
    const update = () => setItems(loadGiftCart());
    window.addEventListener("gift-cart-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("gift-cart-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDetectingCountry(true);
      try {
        const res = await fetch(apiUrl("/api/geo"));
        const data = await readApi(res);
        const nextCountry = String(data?.country || "").toUpperCase();
        if (!cancelled) setCountryCode(nextCountry || getLikelyCountryFromClient());
      } catch {
        if (!cancelled) setCountryCode(getLikelyCountryFromClient());
      } finally {
        if (!cancelled) setDetectingCountry(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const generateBundleLink = useCallback(async (provider = "free") => {
    if (!items.length || generating) return null;
    setStatusMsg("");
    setGenerating(true);
    try {
      const result = await createGiftBundle(items, {
        provider,
        currency,
        amountMinor: totals.totalMinor,
        itemCount: items.length,
      });
      if (!result?.url) throw new Error("Could not create gift link.");
      setCheckedOutItems(items);
      setShareUrl(result.url);
      setPaid(true);
      clearGiftCart();
      try {
        localStorage.setItem("pw_has_paid", "true");
        window.dispatchEvent(new CustomEvent("pw-payment-success"));
      } catch (e) {}
      trackCart("gift_bundle_created", {
        itemCount: items.length,
        currency,
        amountMinor: totals.totalMinor,
        provider,
      });
      return result;
    } catch (err) {
      setStatusMsg(err?.message || "Could not create gift link. Please try again.");
      return null;
    } finally {
      setGenerating(false);
    }
  }, [currency, generating, items, totals.totalMinor]);

  const startCheckout = async () => {
    if (!items.length || paying || generating) return;
    if (totals.totalMinor <= 0) {
      await generateBundleLink("free");
      return;
    }
    if (!razorpayKey) {
      setStatusMsg("Payment setup is incomplete. Razorpay key is missing.");
      return;
    }

    setStatusMsg("");
    setPaying(true);

    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) throw new Error("Could not load Razorpay checkout.");

      const orderRes = await fetch(apiUrl("/api/razorpay/create-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "gift_bundle",
          amountMinor: totals.totalMinor,
          currency,
          receipt: `rcpt_bundle_${Date.now()}`,
          notes: {
            gift_type: "Digital Gift Bundle",
            item_count: String(items.length),
            items_included: items.map(i => i.type || "gift").join(", ").slice(0, 100),
            website: "www.petalsandwords.com",
          },
        }),
      });
      const orderData = await readApi(orderRes);
      if (!orderRes.ok || !orderData?.orderId) {
        throw new Error(orderData?.error || `Unable to create payment order (${orderRes.status}).`);
      }

      const checkout = new window.Razorpay({
        key: razorpayKey,
        order_id: orderData.orderId,
        currency: orderData.currency || currency,
        name: "Petals and Words",
        description: `Digital Gift Bundle (${items.length} gifts: ${items.map(i => i.type).join(", ")})`,
        image: "https://www.petalsandwords.com/logo-transparent.png",
        theme: { color: "#7b5455" },
        notes: {
          gift_type: "Digital Gift Bundle",
          item_count: String(items.length),
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setStatusMsg("Payment cancelled. Complete payment to generate the gift link.");
          },
        },
        handler: async (response) => {
          // Capture a stable snapshot of items/currency/amount at the time
          // the Razorpay handler fires (not from the stale useCallback closure)
          const itemsSnapshot = loadGiftCart();
          const currencySnapshot = currency;
          const amountSnapshot = totals.totalMinor;
          try {
            const verifyRes = await fetch(apiUrl("/api/razorpay/verify"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            await readApi(verifyRes);
          } catch {
            // Treat verification errors as non-blocking.
          }
          // Use the fresh snapshot for bundle creation
          setStatusMsg("");
          setGenerating(true);
          try {
            const result = await createGiftBundle(itemsSnapshot, {
              provider: "razorpay",
              currency: currencySnapshot,
              amountMinor: amountSnapshot,
              itemCount: itemsSnapshot.length,
            });
            if (!result?.url) throw new Error("Could not create gift link.");
            setCheckedOutItems(itemsSnapshot);
            setShareUrl(result.url);
            setPaid(true);
            clearGiftCart();
            try {
              localStorage.setItem("pw_has_paid", "true");
              window.dispatchEvent(new CustomEvent("pw-payment-success"));
            } catch (e) {}
            trackCart("gift_bundle_created", {
              itemCount: itemsSnapshot.length,
              currency: currencySnapshot,
              amountMinor: amountSnapshot,
              provider: "razorpay",
            });
          } catch (err) {
            setStatusMsg(err?.message || "Could not create gift link. Please try again.");
          } finally {
            setGenerating(false);
            setPaying(false);
          }
        },
      });

      checkout.on("payment.failed", () => {
        setPaying(false);
        setStatusMsg("Payment did not go through. Please try again.");
      });

      checkout.open();
    } catch (err) {
      setStatusMsg(err?.message || "Payment error. Please try again.");
      setPaying(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setStatusMsg("Copy failed. Select the link manually.");
    }
  };

  const removeItem = (cartItemId) => {
    setItems(removeGiftCartItem(cartItemId));
  };

  if (paid && shareUrl) {
    return (
      <main className="cart-root">
        <style>{CSS}</style>
        <header className="cart-header">
          <div className="cart-header-inner">
            <Link to="/">
              <img src="/logo-transparent.png" className="cart-logo" alt="Petals and Words" />
            </Link>
            <div className="cart-header-actions">
              <LanguageSwitcher />
              <Link to="/" className="cart-btn cart-btn-ghost"><Home size={16} /> Home</Link>
            </div>
          </div>
        </header>
        <section className="cart-shell cart-success">
          <span className="cart-kicker"><Link2 size={15} /> Bundle link ready</span>
          <h1 className="cart-title">One link for {displayItems.length} gifts</h1>
          <p className="cart-copy">Send this link to the receiver. They will see each gift as a separate option.</p>

          <div className="cart-share-box">
            <strong>Your gift bundle link</strong>
            <div className="cart-url">{shareUrl}</div>
            <div className="cart-share-actions">
              <button className="cart-btn cart-btn-primary" type="button" onClick={copyLink}>
                <Copy size={16} /> {copied ? "Copied" : "Copy link"}
              </button>
              <a
                className="cart-btn cart-btn-primary"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`I made these gifts for you: ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{ background: "#1b8f55" }}
              >
                <Send size={16} /> WhatsApp
              </a>
            </div>
          </div>

          <div className="cart-list" style={{ textAlign: "left" }}>
            {displayItems.map((item, index) => (
              <article className="cart-item" key={item.cartItemId || index}>
                <div className="cart-icon"><Gift size={20} /></div>
                <div>
                  <h2>Gift {index + 1}: {getGiftItemTitle(item)}</h2>
                  <p>{getGiftItemSubtitle(item)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-root">
      <style>{CSS}</style>
      <header className="cart-header">
        <div className="cart-header-inner">
          <Link to="/">
            <img src="/logo-transparent.png" className="cart-logo" alt="Petals and Words" />
          </Link>
          <div className="cart-header-actions">
            <LanguageSwitcher />
            <Link to="/" className="cart-btn cart-btn-ghost"><Home size={16} /> Home</Link>
          </div>
        </div>
      </header>

      <div className="cart-shell">
        <div className="cart-top">
          <div>
            <span className="cart-kicker"><ShoppingCart size={15} /> {countryCode === "PH" ? "Cart ng mga Regalo" : "Gift cart"}</span>
            <h1 className="cart-title">{countryCode === "PH" ? "Bumuo ng iyong Gift Bundle" : "Build your gift bundle"}</h1>
            <p className="cart-copy">{countryCode === "PH" ? "Magdagdag ng iba't ibang regalo, magbayad nang minsanan, at mag-send ng iisang link sa receiver." : "Add multiple gifts, pay once, and send a single link to the receiver."}</p>
          </div>
        </div>

        {!items.length ? (
          <section className="cart-empty">
            <div className="cart-empty-icon"><ShoppingCart size={26} /></div>
            <h1>{countryCode === "PH" ? "Walang laman ang iyong gift cart" : "Your gift cart is empty"}</h1>
            <p>{countryCode === "PH" ? "Gumawa muna ng bouquet, greeting card, o virtual hug bago mag-checkout." : "Create a bouquet, card, or hug first. Each one can be added here as an individual product."}</p>
            <div className="cart-add-grid" style={{ maxWidth: 520, margin: "0 auto" }}>
              {Object.entries({
                bouquet: "/create",
                greeting_card: "/create-greeting-card",
                hug_card: "/create-hug-card",
              }).map(([type, path]) => (
                <Link className="cart-btn cart-btn-soft" to={path} key={type}>
                  <Plus size={16} /> {getGiftProductMeta(type)?.shortLabel}
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="cart-grid">
            <section className="cart-list" aria-label="Gift cart items">
              {items.map((item, index) => {
                const meta = getGiftProductMeta(item.type);
                const price = getGiftItemPriceMinor(item, currency);
                return (
                  <article className="cart-item" key={item.cartItemId}>
                    <div className="cart-icon"><Gift size={20} /></div>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <h2>{countryCode === "PH" ? "Regalo" : "Gift"} {index + 1}: {getGiftItemTitle(item)}</h2>
                      <p>{getGiftItemSubtitle(item)}</p>
                      <p>{meta?.label}</p>
                      
                      <div className="tier-selector">
                        {meta?.priceTiers?.map((tier) => {
                          const tierPriceMinor = tier.priceMinor[currency === "INR" ? "INR" : "USD"];
                          const isActive = (item.tierId || "tier2") === tier.id;
                          const tierDisplayLabel = tier.id === "tier3" ? "Please Please" : tier.id === "tier2" ? "Please" : "Basic";
                          return (
                            <button 
                              key={tier.id} 
                              className={`tier-btn ${isActive ? "active" : ""}`}
                              onClick={() => {
                                setItems(updateGiftCartItemTier(item.cartItemId, tier.id));
                              }}
                              type="button"
                            >
                              <span className="tier-label">{tierDisplayLabel}</span>
                              <span className="tier-price">{formatCartMoney(tierPriceMinor, currency)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: ".55rem", alignSelf: "flex-start" }}>
                      <span className="cart-price">{formatCartMoney(price, currency)}</span>
                      <button
                        aria-label={`Remove ${getGiftItemTitle(item)}`}
                        className="cart-remove"
                        onClick={() => removeItem(item.cartItemId)}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Right column: Checkout on top, Add another gift below */}
            <div style={{ display: "flex", flexDirection: "column", gap: ".85rem", alignItems: "stretch" }}>
              <aside className="cart-panel cart-summary" style={{ position: "sticky", top: "78px" }}>
                <h2>{countryCode === "PH" ? "Pagbabayad (Checkout)" : "Checkout"}</h2>
                <div className="cart-row"><span>{countryCode === "PH" ? "Mga Regalo" : "Products"}</span><strong>{totals.itemCount}</strong></div>
                <div className="cart-row"><span>{countryCode === "PH" ? "Pera" : "Currency"}</span><strong>{currency}</strong></div>
                <div className="cart-total">
                  <span>{countryCode === "PH" ? "KABUUAN" : "Total"}</span>
                  <strong>{formatCartMoney(totals.totalMinor, currency)}</strong>
                </div>

                {/* Please prefix: Standard → 'Please', Premium → 'Please Please' */}
                {(() => {
                  const basicMinor = currency === "INR" ? 2900 : 199;
                  const standardMinor = currency === "INR" ? 5900 : 299;
                  const pleasePrefix = totals.totalMinor > standardMinor
                    ? "Please Please "
                    : totals.totalMinor > basicMinor
                    ? "Please "
                    : "";
                  return (
                    <button
                      className="cart-btn cart-btn-primary"
                      disabled={detectingCountry || paying || generating}
                      onClick={startCheckout}
                      type="button"
                    >
                      {paying || generating ? (
                        <>
                          <span className="cart-spinner" /> {countryCode === "PH" ? "Pinoproseso..." : "Processing"}
                        </>
                      ) : totals.totalMinor > 0 ? (
                        <>
                          {countryCode === "PH"
                            ? `Magbayad ng ${formatCartMoney(totals.totalMinor, currency)}`
                            : `${pleasePrefix}Pay ${formatCartMoney(totals.totalMinor, currency)}`} <ArrowRight size={16} />
                        </>
                      ) : (
                        <>
                          {countryCode === "PH" ? "Gumawa ng bundle link" : "Create bundle link"} <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  );
                })()}

                {statusMsg && <div className="cart-status">{statusMsg}</div>}

                <div style={{ marginTop: "0.85rem", fontSize: "0.72rem", color: "#a65d5d", lineHeight: 1.5, textAlign: "center" }}>
                  {countryCode === "PH"
                    ? "🇵🇭 GCash & Cards via Razorpay · Mabilis at Ligtas"
                    : countryCode === "IN"
                    ? "🇮🇳 UPI, Cards & NetBanking via Razorpay · Fast & Secure"
                    : "🔒 Secure checkout via Razorpay · International cards accepted"}
                </div>
              </aside>


              {/* Add another gift to this bundle */}
              <div className="cart-add-panel">
                <div className="cart-add-panel-heading">
                  <Plus size={14} /> Add another gift to this bundle
                </div>
                <div className="cart-add-products">
                  {[
                    { type: "bouquet", path: "/create", icon: "💐", desc: "Flower arrangement with note" },
                    { type: "greeting_card", path: "/create-greeting-card", icon: "💌", desc: "Personalised envelope card" },
                    { type: "hug_card", path: "/create-hug-card", icon: "🤗", desc: "Interactive pull-to-open hug" },
                  ].map(({ type, path, icon, desc }) => (
                    <Link key={type} to={path} className="cart-add-product">
                      <div className="cart-add-product-icon" style={{ fontSize: "1.15rem" }}>{icon}</div>
                      <span className="cart-add-product-label">{getGiftProductMeta(type)?.shortLabel}</span>
                      <span className="cart-add-product-desc">{desc}</span>
                      <span className="cart-add-product-plus"><Plus size={11} /></span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom payment bar (mobile) */}
      {items.length > 0 && (
        <div className="cart-pay-bar" role="region" aria-label="Checkout summary">
          <div className="cart-pay-bar-inner">
            <div className="cart-pay-bar-meta">
              <div className="cart-pay-bar-label">
                {countryCode === "PH"
                  ? `Kabuuan · ${totals.itemCount} regalo`
                  : `Total · ${totals.itemCount} gift${totals.itemCount !== 1 ? "s" : ""}`}
              </div>
              <div className="cart-pay-bar-total">{formatCartMoney(totals.totalMinor, currency)}</div>
              {statusMsg && <div className="cart-pay-bar-sub">{statusMsg}</div>}
            </div>
            <button
              className="cart-pay-bar-btn"
              disabled={detectingCountry || paying || generating}
              onClick={startCheckout}
              type="button"
            >
              {paying || generating ? (
                <><span className="cart-spinner" /> {countryCode === "PH" ? "Pinoproseso..." : "Processing"}</>
              ) : totals.totalMinor > 0 ? (
                <>
                  {countryCode === "PH"
                    ? `Magbayad ng ${formatCartMoney(totals.totalMinor, currency)}`
                    : `${totals.totalMinor > (currency === "INR" ? 5900 : 299)
                        ? "Please Please "
                        : totals.totalMinor > (currency === "INR" ? 2900 : 199)
                        ? "Please "
                        : ""}Pay ${formatCartMoney(totals.totalMinor, currency)}`} <ArrowRight size={16} />
                </>
              ) : (
                <>{countryCode === "PH" ? "Gumawa ng link" : "Create link"} <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
