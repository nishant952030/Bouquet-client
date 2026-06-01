import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { applySeo, seoKeywords } from "../lib/seo";
import { trackEvent } from "../lib/analytics";
import { addGiftCartItem } from "../lib/giftCart";

/* ── Message presets ── */
const PRESETS = [
  "I love you thiiiiiiis much",
  "Sending you a giant digital hug! 🤗",
  "Wish I could be there to hug you in person.",
  "You're the best mom in the whole wide world!",
  "A little hug to brighten your day.",
  "Thinking of you and sending lots of love. ❤️"
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@400;500;600;700&family=Caveat:wght@700&family=Patrick+Hand&display=swap');
  *,*::before,*::after{box-sizing:border-box}

  .chc-root{font-family:'Manrope',sans-serif;min-height:100vh;background:linear-gradient(160deg,#fdf2f8 0%,#fce7f3 50%,#fbcfe8 100%);color:#3E2723}

  .chc-header{position:sticky;top:0;z-index:40;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);background:rgba(253,242,248,0.85);border-bottom:1px solid rgba(244,114,182,0.1)}
  .chc-header-inner{max-width:560px;margin:0 auto;padding:0.7rem 1.25rem;display:flex;align-items:center;justify-content:space-between}

  .chc-body{max-width:560px;margin:0 auto;padding:1rem 1.25rem 6rem}

  .chc-card{background:#fff;border-radius:1.25rem;box-shadow:0 6px 24px rgba(0,0,0,0.06);padding:1.25rem;margin-bottom:1rem}

  .chc-label{font-size:0.7rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#be185d;margin-bottom:0.5rem;display:block}

  .chc-input{width:100%;padding:0.7rem 0.9rem;border-radius:0.75rem;border:1.5px solid #fecdd3;font-family:'Manrope',sans-serif;font-size:0.9rem;color:#3E2723;background:#fffbfc;outline:none;transition:border-color 0.2s;margin-bottom:0.4rem}
  .chc-input:focus{border-color:#ec4899}

  .chc-textarea{width:100%;padding:0.7rem 0.9rem;border-radius:0.75rem;border:1.5px solid #fecdd3;font-family:'Patrick Hand',cursive;font-size:1.1rem;color:#3E2723;background:#fffbfc;outline:none;resize:vertical;min-height:100px;line-height:1.5;transition:border-color 0.2s}
  .chc-textarea:focus{border-color:#ec4899}

  .chc-presets{display:flex;flex-direction:column;gap:0.4rem;margin-top:0.6rem}
  .chc-preset{text-align:left;padding:0.6rem 0.8rem;border-radius:0.65rem;border:1.5px solid #fce7f3;background:#fffbfc;font-family:'Patrick Hand',cursive;font-size:1rem;color:#831843;line-height:1.4;cursor:pointer;transition:all 0.15s}
  .chc-preset:hover{border-color:#f9a8d4;background:#fdf2f8}
  .chc-preset.active{border-color:#ec4899;background:#fce7f3}

  /* Live preview */
  .chc-preview-wrap{display:flex;justify-content:center;margin:0.75rem 0}
  .chc-preview{position:relative;width:220px;border-radius:14px;padding:1.5rem 1rem;text-align:center;display:flex;flex-direction:column;align-items:center;box-shadow:0 8px 30px rgba(190,50,90,0.1);background:#fff;border:2px dashed #f48fb1}
  .chc-prev-title{font-family:'Caveat',cursive;font-size:1.8rem;font-weight:700;color:#d81b60;line-height:1.1;margin-bottom:0.5rem}
  .chc-prev-msg{font-family:'Patrick Hand',cursive;font-size:1rem;color:#333;line-height:1.4}
  
  /* CTA */
  .chc-cta{width:100%;padding:0.85rem;border:none;border-radius:999px;background:linear-gradient(135deg,#be185d 0%,#ec4899 100%);color:#fff;font-family:'Manrope',sans-serif;font-size:0.9rem;font-weight:700;letter-spacing:0.05em;cursor:pointer;box-shadow:0 8px 28px rgba(190,50,90,0.3);transition:all 0.2s}
  .chc-cta:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(190,50,90,0.4)}
  .chc-cta:disabled{background:#e4d0d5;color:#a0888d;cursor:not-allowed;box-shadow:none;transform:none}

  .chc-ghost{display:inline-flex;align-items:center;gap:5px;background:none;color:#be185d;font-size:0.78rem;font-weight:600;border:1.5px solid rgba(190,50,90,0.25);border-radius:999px;padding:0.3rem 0.8rem;cursor:pointer;text-decoration:none;transition:all 0.15s}
  .chc-ghost:hover{background:#fdf2f8;border-color:#ec4899}
  .chc-cart-cta{width:100%;min-height:44px;justify-content:center;margin-top:0.55rem;background:#fff}
`;

export default function CreateHugCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [line1, setLine1] = useState("Happy");
  const [line2, setLine2] = useState("Mother's");
  const [line3, setLine3] = useState("Day!");
  const [message, setMessage] = useState(PRESETS[0]);
  const [toName, setToName] = useState("");
  const [fromName, setFromName] = useState("");

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
    { line1: line1.trim(), line2: line2.trim(), line3: line3.trim(), msg: message.trim(), to: toName.trim(), from: fromName.trim() }
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
    navigate("/cart");
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
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", fontWeight: 700, color: "#9d174d", lineHeight: 1.2, margin: 0 }}>
            Create a Hug Card
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#be185d", marginTop: "0.4rem", opacity: 0.7 }}>
            Customize your pull-to-open virtual hug and share it instantly.
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
            {PRESETS.map((p, i) => (
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

        {/* CTA */}
        <button type="button" className="chc-cta" onClick={handlePreview} disabled={!message.trim() || !line1.trim()}>
          Preview & Share ✨
        </button>
        <button type="button" className="chc-ghost chc-cart-cta" onClick={addCardToCart} disabled={!message.trim() || !line1.trim()}>
          <ShoppingCart size={16} />
          Add card to cart
        </button>
      </div>
    </main>
  );
}
