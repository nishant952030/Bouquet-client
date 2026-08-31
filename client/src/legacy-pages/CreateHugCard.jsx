import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { applySeo, seoKeywords } from "../lib/seo";
import { trackEvent } from "../lib/analytics";
import { addGiftCartItem } from "../lib/giftCart";
import MusicSelector from "../components/MusicSelector";

/* ── Message presets ── */
const PRESETS = [
  "I love you thiiiiiiis much",
  "Sending you a giant digital hug! 🤗",
  "Wish I could be there to hug you in person.",
  "You're the best mom in the whole wide world!",
  "A little hug to brighten your day.",
  "Thinking of you and sending lots of love. ❤️"
];

const PRESETS_PH = [
  "Mahigpit na yakap mula sa malayo! 🤗💕",
  "Sana nandito ako para mayakap kita nang totoo. Miss na miss kita! 🌸",
  "Pang-alis ng pagod at lungkot — isang mahigpit na yakap para sa'yo! ✨",
  "Kahit malayo tayo, hinding-hindi ka nag-iisa. Nandito lang ako palagi. ❤️",
  "Sending you the biggest, warmest virtual hug today!",
  "Ikaw ang pinakamagandang biyaya sa buhay ko. Yakap nang mahigpit! 🌷",
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&family=Caveat:wght@700&family=Patrick+Hand&display=swap');
  *,*::before,*::after{box-sizing:border-box}

  .chc-root{font-family:'Manrope',sans-serif;min-height:100vh;background:linear-gradient(160deg,#fdf6f0 0%,#f8edf0 55%,#fdf0f5 100%);color:#3E2723}

  .chc-header{position:sticky;top:0;z-index:40;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);background:rgba(253,246,240,0.88);border-bottom:1px solid rgba(200,130,140,0.10);box-shadow:0 2px 20px rgba(200,100,120,0.06)}
  .chc-header-inner{max-width:560px;margin:0 auto;padding:0.75rem 1.25rem;display:flex;align-items:center;justify-content:space-between}

  .chc-body{max-width:560px;margin:0 auto;padding:1rem 1.25rem 6rem}

  .chc-card{background:rgba(255,255,255,0.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.85);border-radius:1.5rem;box-shadow:0 8px 32px rgba(200,130,140,0.10);padding:1.25rem;margin-bottom:1rem}

  .chc-label{font-size:0.65rem;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#a65d5d;margin-bottom:0.5rem;display:block;font-family:'Montserrat',sans-serif}

  .chc-input{width:100%;padding:0.75rem 1rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.22);font-family:'Manrope',sans-serif;font-size:0.9rem;color:#3E2723;background:rgba(255,255,255,0.85);outline:none;transition:border-color 0.2s,box-shadow 0.2s;margin-bottom:0.4rem}
  .chc-input:focus{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.12)}

  .chc-textarea{width:100%;padding:0.75rem 1rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.22);font-family:'Patrick Hand',cursive;font-size:1.05rem;color:#3E2723;background:rgba(255,255,255,0.85);outline:none;resize:vertical;min-height:100px;line-height:1.5;transition:border-color 0.2s,box-shadow 0.2s}
  .chc-textarea:focus{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.12)}

  .chc-presets{display:flex;flex-direction:column;gap:0.4rem;margin-top:0.6rem}
  .chc-preset{text-align:left;padding:0.65rem 0.9rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.18);background:rgba(255,255,255,0.75);font-family:'Patrick Hand',cursive;font-size:1rem;color:#7b5455;line-height:1.4;cursor:pointer;transition:all 0.18s}
  .chc-preset:hover{border-color:#a65d5d;background:#fff5f4;transform:translateY(-1px)}
  .chc-preset.active{border-color:#a65d5d;background:#fff5f4}

  /* Live preview */
  .chc-preview-wrap{display:flex;justify-content:center;margin:0.75rem 0}
  .chc-preview{position:relative;width:220px;border-radius:14px;padding:1.5rem 1rem;text-align:center;display:flex;flex-direction:column;align-items:center;box-shadow:0 8px 30px rgba(166,93,93,0.12);background:rgba(255,255,255,0.9);border:2px dashed rgba(166,93,93,0.35)}
  .chc-prev-title{font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#a65d5d;line-height:1.1;margin-bottom:0.5rem}
  .chc-prev-msg{font-family:'Patrick Hand',cursive;font-size:1rem;color:#3E2723;line-height:1.4}

  /* Shimmer CTA — matches landing page */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .chc-cta{width:100%;padding:0 1.5rem;min-height:54px;border:none;border-radius:999px;background:linear-gradient(135deg,#a65d5d 0%,#7c3f4f 100%);color:#fff;font-family:'Montserrat',sans-serif;font-size:0.88rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;animation:pw-pulse 2.5s infinite;transition:transform 0.2s ease;display:flex;align-items:center;justify-content:center;gap:8px}
  .chc-cta:hover{transform:translateY(-2px)}
  .chc-cta:disabled{background:#e4e2de;color:#a0888d;cursor:not-allowed;box-shadow:none;transform:none;animation:none}

  .chc-ghost{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.7);color:#7c4343;font-size:0.78rem;font-weight:600;font-family:'Montserrat',sans-serif;border:1.5px solid rgba(124,67,67,0.22);border-radius:999px;padding:0.3rem 0.8rem;cursor:pointer;text-decoration:none;transition:all 0.15s}
  .chc-ghost:hover{background:#ffd9d8;border-color:#7c4343;transform:translateY(-1px)}
  .chc-cart-cta{width:100%;min-height:44px;justify-content:center;margin-top:0.55rem;background:rgba(255,255,255,0.85)}
  .chc-bottom{position:fixed;inset:auto 0 0;z-index:40;background:rgba(253,246,240,0.96);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-top:1px solid rgba(200,130,140,0.10);padding:0.75rem 1.25rem 1.1rem}
`;

export default function CreateHugCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [country, setCountry] = useState(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz === "Asia/Manila") return "PH";
    } catch {}
    return "OTHER";
  });

  useEffect(() => {
    fetch("https://api.country.is/")
      .then(r => r.json())
      .then(d => { if (d?.country) setCountry(d.country); })
      .catch(() => {});
  }, []);

  const isPH = country === "PH";
  const activePresets = isPH ? PRESETS_PH : PRESETS;

  const [line1, setLine1] = useState(isPH ? "Warm" : "Happy");
  const [line2, setLine2] = useState(isPH ? "Virtual" : "Mother's");
  const [line3, setLine3] = useState(isPH ? "Hug!" : "Day!");
  const [message, setMessage] = useState(activePresets[0]);
  const [toName, setToName] = useState("");
  const [fromName, setFromName] = useState("");
  const [musicTrack, setMusicTrack] = useState("none");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    applySeo({
      title: "Create a Virtual Hug Card | Personalize & Share Free",
      description: "Create a personalized, interactive virtual hug card with a custom message. Share it instantly via link or WhatsApp!",
      keywords: seoKeywords.mothersDay, // fallback
      path: "/create-hug-card",
    });
    trackEvent("hug_card_create_start");
  }, []);

  const buildCardData = () => (
    { line1: line1.trim(), line2: line2.trim(), line3: line3.trim(), msg: message.trim(), to: toName.trim(), from: fromName.trim(), musicTrack }
  );

  const handlePreview = () => {
    const cardData = buildCardData();
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(cardData))));
    navigate("/hug-card?data=" + encodeURIComponent(encoded));
  };

  const addCardToCart = () => {
    const cardData = buildCardData();
    addGiftCartItem("hug_card", { title: "Virtual Hug Card", payload: cardData });
    trackEvent("gift_cart_add", { type: "hug_card_custom" });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="chc-root">
      <style>{CSS}</style>

      <header className="chc-header">
        <div className="chc-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src="/logo-transparent.png" alt="Petals & Words" style={{ height: 28, width: "auto" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Link to="/" className="chc-ghost">🏠 Home</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="chc-body">
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>🤗</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.2rem", fontWeight: 500, color: "#3d3028", lineHeight: 1.2, margin: 0 }}>
            {isPH ? "Gumawa ng Virtual Hug" : "Create a Hug Card"}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#705f58", marginTop: "0.4rem" }}>
            {isPH ? "Magpadala ng mahigpit na yakap na bubukas sa screen nila" : "Customize your pull-to-open virtual hug and share it instantly."}
          </p>
        </div>

        {/* Live Preview */}
        <div className="chc-card">
          <span className="chc-label">✨ Live Preview</span>
          <div className="chc-preview-wrap">
            <div className="chc-preview">
              {toName && <p style={{fontFamily:"'Patrick Hand',cursive", color:"#be185d", fontSize:"0.9rem", marginBottom: "0.5rem"}}>To {toName}</p>}
              <h2 className="chc-prev-title">
                {line1 || "..."}<br/>{line2}<br/>{line3}
              </h2>
              <div style={{ width: 40, height: 1.5, background: "#fecdd3", margin: "0.4rem 0" }} />
              <p className="chc-prev-msg">{(message || "Your inside message here...").slice(0, 80)}{message.length > 80 ? "..." : ""}</p>
              {fromName && <p style={{fontFamily:"'Patrick Hand',cursive", color:"#be185d", fontSize:"0.9rem", marginTop: "0.5rem"}}>— {fromName}</p>}
            </div>
          </div>
        </div>

        {/* To field */}
        <div className="chc-card">
          <label className="chc-label" htmlFor="hc-to">💝 To (Optional)</label>
          <input id="hc-to" className="chc-input" value={toName} onChange={e => setToName(e.target.value)} placeholder="Recipient's Name" maxLength={30} />
        </div>

        {/* Cover text */}
        <div className="chc-card">
          <label className="chc-label">🌟 Cover Text (3 Lines)</label>
          <input className="chc-input" value={line1} onChange={e => setLine1(e.target.value)} placeholder="Line 1 (e.g. Happy)" maxLength={15} />
          <input className="chc-input" value={line2} onChange={e => setLine2(e.target.value)} placeholder="Line 2 (e.g. Mother's)" maxLength={15} />
          <input className="chc-input" value={line3} onChange={e => setLine3(e.target.value)} placeholder="Line 3 (e.g. Day!)" maxLength={15} />
        </div>

        {/* Inside Message */}
        <div className="chc-card">
          <label className="chc-label" htmlFor="hc-msg">✍️ Inside Message</label>
          <textarea id="hc-msg" className="chc-textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write something from the heart..." maxLength={150} rows={3} />
          <span className="chc-label" style={{ marginTop: "0.5rem" }}>💡 Or pick a message</span>
          <div className="chc-presets">
            {activePresets.map((p, i) => (
              <button key={i} type="button" className={`chc-preset ${message === p ? "active" : ""}`} onClick={() => setMessage(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* From field */}
        <div className="chc-card">
          <label className="chc-label" htmlFor="hc-from">💌 From (Optional)</label>
          <input id="hc-from" className="chc-input" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Your Name" maxLength={30} />
        </div>

        <MusicSelector selectedTrackId={musicTrack} onChange={setMusicTrack} />
      </div>

      {/* Fixed bottom CTA bar */}
      <div className="chc-bottom">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <button type="button" className="chc-cta" onClick={handlePreview} disabled={!message.trim() || !line1.trim()}>
            Preview & Share ✨
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" className="chc-ghost chc-cart-cta" onClick={addCardToCart} disabled={!message.trim() || !line1.trim()} style={{ width: "100%", margin: 0 }}>
              <ShoppingCart size={16} />
              {added ? "Added!" : "Add to cart"}
            </button>
            <button type="button" className="chc-ghost chc-cart-cta" onClick={() => navigate("/cart")} style={{ width: "100%", margin: 0 }}>
              View cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

