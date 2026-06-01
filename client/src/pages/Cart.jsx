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

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box}
  .cart-root{min-height:100vh;background:#fbf9f5;color:#2f2824;font-family:'Manrope',sans-serif}
  .cart-header{position:sticky;top:0;z-index:30;background:rgba(251,249,245,.9);backdrop-filter:blur(18px);border-bottom:1px solid rgba(97,75,61,.08)}
  .cart-header-inner{max-width:980px;margin:0 auto;padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
  .cart-logo{height:30px;width:auto}
  .cart-header-actions{display:flex;align-items:center;gap:.6rem}
  .cart-shell{max-width:980px;margin:0 auto;padding:1.25rem 1rem 7rem}
  .cart-top{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin:1.2rem 0 1rem}
  .cart-kicker{display:inline-flex;align-items:center;gap:.4rem;color:#7b5455;font-size:.72rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:.35rem}
  .cart-title{font-family:'Noto Serif',serif;font-size:clamp(1.7rem,4vw,2.45rem);line-height:1.1;font-weight:500;margin:0;color:#312722}
  .cart-copy{font-size:.9rem;color:#705f58;margin:.45rem 0 0;max-width:560px;line-height:1.6}
  .cart-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:1rem;align-items:start}
  .cart-panel,.cart-item,.cart-empty{background:#fff;border:1px solid rgba(97,75,61,.09);border-radius:8px;box-shadow:0 10px 28px rgba(46,35,28,.05)}
  .cart-list{display:flex;flex-direction:column;gap:.75rem}
  .cart-item{padding:1rem;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:.85rem;align-items:center}
  .cart-icon{width:44px;height:44px;border-radius:8px;background:#fff3e7;color:#7b5455;display:grid;place-items:center;flex:none}
  .cart-item h2{font-size:.98rem;margin:0;color:#312722;line-height:1.3}
  .cart-item p{font-size:.78rem;margin:.25rem 0 0;color:#7b6b64;line-height:1.45}
  .cart-price{font-size:.86rem;font-weight:800;color:#7b5455;white-space:nowrap;text-align:right}
  .cart-remove{width:38px;height:38px;border:1px solid rgba(127,86,80,.16);border-radius:8px;background:#fff;color:#9a4b4b;display:grid;place-items:center;cursor:pointer}
  .cart-remove:hover{background:#fff3f1}
  .cart-summary{padding:1rem;position:sticky;top:78px;display:block}
  .cart-summary h2{font-family:'Noto Serif',serif;font-size:1.25rem;font-weight:500;margin:0 0 .85rem}
  .cart-row{display:flex;justify-content:space-between;gap:1rem;font-size:.86rem;color:#6b5e58;padding:.5rem 0;border-bottom:1px solid rgba(97,75,61,.08)}
  .cart-total{display:flex;justify-content:space-between;gap:1rem;align-items:flex-end;padding:1rem 0 .85rem}
  .cart-total span{font-size:.78rem;color:#7b6b64;text-transform:uppercase;letter-spacing:.12em;font-weight:800}
  .cart-total strong{font-size:1.55rem;color:#312722}
  .cart-btn{min-height:44px;border:0;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-family:'Manrope',sans-serif;font-size:.88rem;font-weight:800;cursor:pointer;text-decoration:none;transition:transform .16s ease,box-shadow .16s ease}
  .cart-btn:active{transform:scale(.98)}
  .cart-btn-primary{width:100%;background:#7b5455;color:#fff;box-shadow:0 14px 30px rgba(123,84,85,.2)}
  .cart-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 18px 38px rgba(123,84,85,.26)}
  .cart-btn-primary:disabled{background:#d8ccca;color:#8d817e;cursor:not-allowed;box-shadow:none}
  .cart-btn-ghost{border:1px solid rgba(123,84,85,.18);background:#fff;color:#7b5455;padding:.55rem .85rem}
  .cart-btn-soft{background:#fff3e7;color:#7b5455;padding:.7rem .9rem;width:100%;border:1px solid rgba(123,84,85,.12)}
  .cart-add-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem;margin-top:1rem}
  .cart-status{border-radius:8px;background:#fff5ef;color:#7b5455;padding:.75rem .85rem;font-size:.8rem;line-height:1.5;margin-top:.75rem}
  .cart-empty{padding:2rem 1.25rem;text-align:center}
  .cart-empty-icon{width:58px;height:58px;margin:0 auto .9rem;border-radius:8px;background:#fff3e7;color:#7b5455;display:grid;place-items:center}
  .cart-empty h1{font-family:'Noto Serif',serif;font-size:1.45rem;font-weight:500;margin:0 0 .35rem}
  .cart-empty p{font-size:.86rem;color:#6b5e58;line-height:1.6;margin:0 auto 1rem;max-width:360px}
  .cart-success{max-width:560px;margin:2rem auto 0;text-align:center}
  .cart-share-box{background:#fff;border:1px solid rgba(97,75,61,.1);border-radius:8px;box-shadow:0 10px 28px rgba(46,35,28,.05);padding:1rem;text-align:left;margin:1rem 0}
  .cart-url{background:#f7f0ea;border-radius:8px;color:#6f4748;word-break:break-all;padding:.8rem;font-size:.82rem;line-height:1.45;margin:.7rem 0}
  .cart-share-actions{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
  .cart-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.45);border-top-color:#fff;animation:cartSpin .8s linear infinite}
  @keyframes cartSpin{to{transform:rotate(360deg)}}
  /* --- Add another gift panel --- */
  .cart-add-panel{background:#fff;border:1px solid rgba(97,75,61,.09);border-radius:8px;box-shadow:0 10px 28px rgba(46,35,28,.05);padding:1.1rem 1rem;margin-top:.85rem}
  .cart-add-panel-heading{display:flex;align-items:center;gap:.5rem;font-size:.78rem;font-weight:800;color:#7b5455;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.75rem}
  .cart-add-products{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem}
  .cart-add-product{display:flex;flex-direction:column;align-items:flex-start;gap:.18rem;background:#faf7f4;border:1.5px solid rgba(123,84,85,.1);border-radius:8px;padding:.7rem .75rem;text-decoration:none;color:#2f2824;transition:border-color .18s,background .18s,transform .15s}
  .cart-add-product:hover{border-color:#7b5455;background:#fff3e7;transform:translateY(-1px)}
  .cart-add-product-icon{width:34px;height:34px;border-radius:6px;background:#fff3e7;color:#7b5455;display:grid;place-items:center;margin-bottom:.3rem;flex:none}
  .cart-add-product-label{font-size:.82rem;font-weight:800;color:#312722;line-height:1.2}
  .cart-add-product-desc{font-size:.7rem;color:#8a7670;line-height:1.35}
  .cart-add-product-plus{width:20px;height:20px;border-radius:50%;background:#7b5455;color:#fff;display:grid;place-items:center;margin-left:auto;margin-top:.25rem;align-self:flex-end;flex:none}
  /* Tier selector */
  .tier-selector { display: flex; gap: 4px; background: #f5f3ef; padding: 4px; border-radius: 8px; margin-top: 12px; }
  .tier-btn { flex: 1; border: none; background: transparent; padding: 8px 4px; font-size: 0.75rem; font-weight: 600; color: #7b6b64; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .tier-btn:hover { background: rgba(123, 84, 85, 0.08); }
  .tier-btn.active { background: #fff; color: #7b5455; box-shadow: 0 2px 8px rgba(123, 84, 85, 0.15); }
  .tier-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .tier-price { font-size: 0.8rem; font-weight: 800; }
  /* Fixed payment bar */
  .cart-pay-bar{position:fixed;inset:auto 0 0;z-index:40;background:rgba(251,249,245,.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(97,75,61,.1);padding:.75rem 1rem 1.1rem;display:none}
  .cart-pay-bar-inner{max-width:980px;margin:0 auto;display:flex;align-items:center;gap:.85rem}
  .cart-pay-bar-meta{flex:1;min-width:0}
  .cart-pay-bar-label{font-size:.68rem;font-weight:800;color:#7b6b64;letter-spacing:.12em;text-transform:uppercase}
  .cart-pay-bar-total{font-size:1.3rem;font-weight:800;color:#312722;line-height:1.15}
  .cart-pay-bar-sub{font-size:.72rem;color:#9a8880;margin-top:.1rem}
  .cart-pay-bar-btn{flex:none;min-height:48px;padding:0 1.4rem;border-radius:8px;background:#7b5455;color:#fff;border:0;font-family:'Manrope',sans-serif;font-size:.9rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:.5rem;box-shadow:0 10px 28px rgba(123,84,85,.22);transition:transform .16s,box-shadow .16s}
  .cart-pay-bar-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 16px 36px rgba(123,84,85,.3)}
  .cart-pay-bar-btn:disabled{background:#d8ccca;color:#8d817e;cursor:not-allowed;box-shadow:none}
  .cart-pay-bar-status{font-size:.76rem;color:#7b5455;background:#fff5ef;border-radius:6px;padding:.45rem .7rem;margin-top:.5rem;max-width:980px;margin-left:auto;margin-right:auto}
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
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || locale.includes("-IN")) return "IN";
    return "OTHER";
  } catch {
    return "IN";
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

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
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
          receipt: `bundle_${Date.now()}`,
          notes: { type: "gift_bundle", itemCount: items.length },
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
        description: `Gift bundle (${items.length} items)`,
        theme: { color: "#7b5455" },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setStatusMsg("Payment cancelled. Complete payment to generate the gift link.");
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(apiUrl("/api/razorpay/verify"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            await readApi(verifyRes);
          } catch {
            // The old flows also treat verification errors as non-blocking once checkout returns.
          }
          await generateBundleLink("razorpay");
          setPaying(false);
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
            <span className="cart-kicker"><ShoppingCart size={15} /> Gift cart</span>
            <h1 className="cart-title">Build your gift bundle</h1>
            <p className="cart-copy">Add multiple gifts, pay once, and send a single link to the receiver.</p>
          </div>
        </div>

        {!items.length ? (
          <section className="cart-empty">
            <div className="cart-empty-icon"><ShoppingCart size={26} /></div>
            <h1>Your gift cart is empty</h1>
            <p>Create a bouquet, cake, card, or hug first. Each one can be added here as an individual product.</p>
            <div className="cart-add-grid" style={{ maxWidth: 520, margin: "0 auto" }}>
              {Object.entries({
                bouquet: "/create",
                cake: "/create-cake",
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
                      <h2>Gift {index + 1}: {getGiftItemTitle(item)}</h2>
                      <p>{getGiftItemSubtitle(item)}</p>
                      <p>{meta?.label}</p>
                      
                      <div className="tier-selector">
                        {meta?.priceTiers?.map((tier) => {
                          const tierPriceMinor = tier.priceMinor[currency === "INR" ? "INR" : "USD"];
                          const isActive = (item.tierId || "tier2") === tier.id;
                          return (
                            <button 
                              key={tier.id} 
                              className={`tier-btn ${isActive ? "active" : ""}`}
                              onClick={() => {
                                setItems(updateGiftCartItemTier(item.cartItemId, tier.id));
                              }}
                              type="button"
                            >
                              <span className="tier-label">{tier.label}</span>
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

            {/* Add another gift to this bundle */}
            <div className="cart-add-panel">
              <div className="cart-add-panel-heading">
                <Plus size={14} /> Add another gift to this bundle
              </div>
              <div className="cart-add-products">
                {[
                  { type: "bouquet", path: "/create", icon: "💐", desc: "Flower arrangement with note" },
                  { type: "cake", path: "/create-cake", icon: "🎂", desc: "3D virtual birthday cake" },
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

            <aside className="cart-panel cart-summary">
              <h2>Checkout</h2>
              <div className="cart-row"><span>Products</span><strong>{totals.itemCount}</strong></div>
              <div className="cart-row"><span>Currency</span><strong>{currency}</strong></div>
              <div className="cart-total">
                <span>Total</span>
                <strong>{formatCartMoney(totals.totalMinor, currency)}</strong>
              </div>

              <button
                className="cart-btn cart-btn-primary"
                disabled={detectingCountry || paying || generating}
                onClick={startCheckout}
                type="button"
              >
                {paying || generating ? (
                  <>
                    <span className="cart-spinner" /> Processing
                  </>
                ) : totals.totalMinor > 0 ? (
                  <>
                    Pay {formatCartMoney(totals.totalMinor, currency)} <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Create bundle link <ArrowRight size={16} />
                  </>
                )}
              </button>

              {statusMsg && <div className="cart-status">{statusMsg}</div>}
            </aside>
          </div>
        )}
      </div>

      {/* Fixed bottom payment bar (mobile) */}
      {items.length > 0 && (
        <div className="cart-pay-bar" role="region" aria-label="Checkout summary">
          <div className="cart-pay-bar-inner">
            <div className="cart-pay-bar-meta">
              <div className="cart-pay-bar-label">Total · {totals.itemCount} gift{totals.itemCount !== 1 ? "s" : ""}</div>
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
                <><span className="cart-spinner" /> Processing</>
              ) : totals.totalMinor > 0 ? (
                <>Pay {formatCartMoney(totals.totalMinor, currency)} <ArrowRight size={16} /></>
              ) : (
                <>Create link <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
