import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { applySeo, seoKeywords } from "../lib/seo";
import { trackEvent } from "../lib/analytics";
import { addGiftCartItem } from "../lib/giftCart";
import MusicSelector from "../components/MusicSelector";

/* ── Paper textures (CSS only) ── */
const PAPERS = [
  { id: "blush", label: "Blush Rose", bg: "linear-gradient(175deg,#ffffff 0%,#fff5f7 40%,#fdf2f8 100%)", border: "rgba(212,175,55,0.2)" },
  { id: "cream", label: "Cream Classic", bg: "linear-gradient(175deg,#fffdf7 0%,#fef9ef 40%,#fdf5e6 100%)", border: "rgba(180,150,80,0.2)" },
  { id: "lavender", label: "Lavender Dream", bg: "linear-gradient(175deg,#faf5ff 0%,#f3e8ff 40%,#ede9fe 100%)", border: "rgba(140,100,200,0.2)" },
  { id: "mint", label: "Mint Soft", bg: "linear-gradient(175deg,#f0fdf4 0%,#ecfdf5 40%,#d1fae5 100%)", border: "rgba(60,160,120,0.2)" },
  { id: "gold", label: "Warm Gold", bg: "linear-gradient(175deg,#fffbeb 0%,#fef3c7 40%,#fde68a 100%)", border: "rgba(180,130,30,0.25)" },
  { id: "white", label: "Pure White", bg: "linear-gradient(175deg,#ffffff 0%,#fafafa 40%,#f5f5f5 100%)", border: "rgba(150,150,150,0.15)" },
];

/* ── Decorations (emoji stickers) ── */
const DECOS = [
  { id: "hearts", emoji: "💕", label: "Hearts" },
  { id: "flowers", emoji: "🌸", label: "Flowers" },
  { id: "sparkles", emoji: "✨", label: "Sparkles" },
  { id: "butterflies", emoji: "🦋", label: "Butterflies" },
  { id: "stars", emoji: "⭐", label: "Stars" },
  { id: "ribbons", emoji: "🎀", label: "Ribbons" },
];

/* ── Message presets ── */
const PRESETS = [
  "Wishing you a day filled with happiness and a year filled with joy. 🌟",
  "Thank you for being such an amazing person. I appreciate you more than words can say. 💛",
  "Sending you smiles for every moment of your special day. Have a wonderful time! 🌷",
  "Just a little note to say you are on my mind and in my heart today. 💌",
  "Cheers to you! Hoping all your dreams come true today and always. 🥂",
  "You mean the world to me. Thank you for everything you do! ✨",
];

const PRESETS_PH = [
  "Happy Monthsary, my love! Salamat sa pagiging tahanan at pahinga ko. Mahal na mahal kita! 💕",
  "Happy Birthday! Sobrang thankful ako kay Lord na dumating ka sa buhay ko. Enjoy your day! 🎂✨",
  "Miss na miss na kita. Kahit magkalayo tayo, laging ikaw ang nasa puso't isip ko. 🌸",
  "Salamat sa lahat ng sakripisyo at pag-aalaga mo, Mama. You deserve all the blessings! 💐",
  "Peace offering muna bago ako bumawi sa'yo. Bati na tayo please? 🥺❤️",
  "Naisip lang kita at gusto kitang pangitiin. Ingat ka palagi, ha? 🌟",
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&family=Great+Vibes&display=swap');
  *,*::before,*::after{box-sizing:border-box}

  .cmc-root{font-family:'Manrope',sans-serif;min-height:100vh;background:linear-gradient(160deg,#fdf6f0 0%,#f8edf0 55%,#fdf0f5 100%);color:#3E2723}

  .cmc-header{position:sticky;top:0;z-index:40;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);background:rgba(253,246,240,0.88);border-bottom:1px solid rgba(200,130,140,0.10);box-shadow:0 2px 20px rgba(200,100,120,0.06)}
  .cmc-header-inner{max-width:560px;margin:0 auto;padding:0.75rem 1.25rem;display:flex;align-items:center;justify-content:space-between}

  .cmc-body{max-width:560px;margin:0 auto;padding:1rem 1.25rem 6rem}

  .cmc-card{background:rgba(255,255,255,0.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.85);border-radius:1.5rem;box-shadow:0 8px 32px rgba(200,130,140,0.10);padding:1.25rem;margin-bottom:1rem}

  .cmc-label{font-size:0.65rem;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:#a65d5d;margin-bottom:0.5rem;display:block;font-family:'Montserrat',sans-serif}

  .cmc-input{width:100%;padding:0.75rem 1rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.22);font-family:'Manrope',sans-serif;font-size:0.9rem;color:#3E2723;background:rgba(255,255,255,0.85);outline:none;transition:border-color 0.2s,box-shadow 0.2s}
  .cmc-input:focus{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.12)}

  .cmc-textarea{width:100%;padding:0.75rem 1rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.22);font-family:'Cormorant Garamond',serif;font-size:1rem;font-style:italic;color:#3E2723;background:rgba(255,255,255,0.85);outline:none;resize:vertical;min-height:100px;line-height:1.7;transition:border-color 0.2s,box-shadow 0.2s}
  .cmc-textarea:focus{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.12)}

  .cmc-presets{display:flex;flex-direction:column;gap:0.4rem;margin-top:0.6rem}
  .cmc-preset{text-align:left;padding:0.65rem 0.9rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.18);background:rgba(255,255,255,0.75);font-family:'Cormorant Garamond',serif;font-size:0.88rem;font-style:italic;color:#7b5455;line-height:1.6;cursor:pointer;transition:all 0.18s}
  .cmc-preset:hover{border-color:#a65d5d;background:#fff5f4;transform:translateY(-1px)}
  .cmc-preset.active{border-color:#a65d5d;background:#fff5f4}

  .cmc-papers{display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem}
  .cmc-paper-btn{border-radius:0.875rem;border:2.5px solid transparent;padding:0.5rem;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:0.3rem;background:rgba(255,255,255,0.7)}
  .cmc-paper-btn:hover{border-color:rgba(166,93,93,0.4)}
  .cmc-paper-btn.active{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.15)}
  .cmc-paper-swatch{width:100%;aspect-ratio:4/3;border-radius:0.5rem;border:1px solid rgba(0,0,0,0.06)}
  .cmc-paper-name{font-size:0.65rem;font-weight:700;color:#a65d5d;font-family:'Montserrat',sans-serif}

  .cmc-decos{display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem}
  .cmc-deco-btn{border-radius:0.875rem;border:2px solid rgba(200,130,140,0.15);padding:0.6rem;cursor:pointer;transition:all 0.18s;display:flex;flex-direction:column;align-items:center;gap:0.2rem;background:rgba(255,255,255,0.78)}
  .cmc-deco-btn:hover{border-color:rgba(166,93,93,0.4);transform:translateY(-1px)}
  .cmc-deco-btn.active{border-color:#a65d5d;background:#fff5f4}
  .cmc-deco-emoji{font-size:1.4rem}
  .cmc-deco-name{font-size:0.65rem;font-weight:700;color:#a65d5d;font-family:'Montserrat',sans-serif}

  /* Live preview */
  .cmc-preview-wrap{display:flex;justify-content:center;margin:0.75rem 0}
  .cmc-preview{position:relative;width:220px;border-radius:14px;padding:1.2rem 1rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:0.3rem;box-shadow:0 8px 30px rgba(166,93,93,0.14);overflow:hidden}
  .cmc-preview::before{content:'';position:absolute;inset:5px;border-radius:10px;pointer-events:none}
  .cmc-prev-to{font-family:'Great Vibes',cursive;font-size:0.8rem;color:#a65d5d}
  .cmc-prev-flower{font-size:1.6rem;line-height:1}
  .cmc-prev-title{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:700;color:#7c3f4f;line-height:1.2}
  .cmc-prev-line{width:30px;height:1px;background:linear-gradient(90deg,transparent,#d4af37,transparent)}
  .cmc-prev-msg{font-family:'Cormorant Garamond',serif;font-size:0.7rem;font-style:italic;color:#7b5455;line-height:1.6;max-width:170px}
  .cmc-prev-heart{font-size:1rem}
  .cmc-prev-from{font-family:'Great Vibes',cursive;font-size:0.8rem;color:#a65d5d}
  .cmc-prev-deco{position:absolute;pointer-events:none;font-size:0.9rem;opacity:0.5}

  /* Shimmer CTA — matches landing page */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .cmc-cta{width:100%;padding:0 1.5rem;min-height:54px;border:none;border-radius:999px;background:linear-gradient(135deg,#a65d5d 0%,#7c3f4f 100%);color:#fff;font-family:'Montserrat',sans-serif;font-size:0.88rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;animation:pw-pulse 2.5s infinite;transition:transform 0.2s ease;display:flex;align-items:center;justify-content:center;gap:8px}
  .cmc-cta:hover{transform:translateY(-2px)}
  .cmc-cta:disabled{background:#e4e2de;color:#a0888d;cursor:not-allowed;box-shadow:none;transform:none;animation:none}

  .cmc-ghost{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.7);color:#7c4343;font-size:0.78rem;font-weight:600;font-family:'Montserrat',sans-serif;border:1.5px solid rgba(124,67,67,0.22);border-radius:999px;padding:0.3rem 0.8rem;cursor:pointer;text-decoration:none;transition:all 0.15s}
  .cmc-ghost:hover{background:#ffd9d8;border-color:#7c4343;transform:translateY(-1px)}
  .cmc-bottom{position:fixed;inset:auto 0 0;z-index:40;background:rgba(253,246,240,0.96);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-top:1px solid rgba(200,130,140,0.10);padding:0.75rem 1.25rem 1.1rem}

  @media(max-width:380px){
    .cmc-papers{grid-template-columns:repeat(2,1fr)}
    .cmc-preview{width:190px}
  }
`;


/* ── Decoration positions (scattered around card) ── */
const DECO_POSITIONS = [
  { top: "5%", left: "8%" }, { top: "8%", right: "10%" },
  { bottom: "12%", left: "6%" }, { bottom: "8%", right: "8%" },
  { top: "45%", left: "2%" }, { top: "40%", right: "3%" },
];

export default function CreateGreetingCard() {
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

  const [toName, setToName] = useState("");
  const [title, setTitle] = useState(isPH ? "Happy Monthsary!" : "Happy Birthday!");
  const [message, setMessage] = useState(activePresets[0]);
  const [fromName, setFromName] = useState("");
  const [paper, setPaper] = useState("blush");
  const [decos, setDecos] = useState(["hearts"]);
  const [musicTrack, setMusicTrack] = useState("none");
  const [added, setAdded] = useState(false);

  const selectedPaper = PAPERS.find(p => p.id === paper) || PAPERS[0];
  const activeDecos = DECOS.filter(d => decos.includes(d.id));

  useEffect(() => {
    applySeo({
      title: "Create a Greeting Card | Personalize & Share Free",
      description: "Create a personalized, interactive greeting card for any occasion with custom messages, paper textures, and decorations. Share it instantly via link or WhatsApp!",
      keywords: ["greeting card", "digital card maker", "ecard creator"],
      path: "/create-greeting-card",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Digital Greeting Card Maker",
        "url": window.location.href,
        "description": "Create and send personalized, interactive digital greeting cards for free.",
        "applicationCategory": "LifestyleApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    });
    trackEvent("card_create_start");
  }, []);

  const toggleDeco = (id) => {
    setDecos(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const buildCardData = () => (
    { to: toName.trim(), title: title.trim(), msg: message, from: fromName.trim(), paper, decos, musicTrack }
  );

  const handlePreview = () => {
    const cardData = buildCardData();
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(cardData))));
    // Save to localStorage for payment page
    localStorage.setItem("pw_pending_greeting_card", JSON.stringify(cardData));
    navigate("/payment-greeting-card", { state: { cardData, encoded } });
  };

  const addCardToCart = () => {
    const cardData = buildCardData();
    addGiftCartItem("greeting_card", cardData);
    trackEvent("gift_cart_add", { type: "greeting_card", paper });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="cmc-root">
      <style>{CSS}</style>

      <header className="cmc-header">
        <div className="cmc-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <img src="/logo-transparent.png" alt="Petals & Words" style={{ height: 28, width: "auto" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Link to="/" className="cmc-ghost">🏠 Home</Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="cmc-body">
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>💌</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.2rem", fontWeight: 500, color: "#3d3028", lineHeight: 1.2, margin: 0 }}>
            {isPH ? "Gumawa ng Greeting Card" : t("card.createTitle", "Create a Greeting Card")}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#705f58", marginTop: "0.4rem" }}>
            {isPH ? "Maglagay ng sweet message, pumili ng style, at i-share agad" : t("card.createSub", "Personalize your message, pick a style, and share the love")}
          </p>
        </div>

        {/* Live Preview */}
        <div className="cmc-card">
          <span className="cmc-label">✨ Live Preview</span>
          <div className="cmc-preview-wrap">
            <div className="cmc-preview" style={{ background: selectedPaper.bg }}>
              <div style={{ position: "absolute", inset: 5, borderRadius: 10, border: `1.5px solid ${selectedPaper.border}`, pointerEvents: "none" }} />
              {activeDecos.map((d, i) => (
                <span key={d.id} className="cmc-prev-deco" style={DECO_POSITIONS[i] || {}}>{d.emoji}</span>
              ))}
              {toName && <p className="cmc-prev-to">To {toName}</p>}
              <span className="cmc-prev-flower">🌷</span>
              <h2 className="cmc-prev-title">{title || "Hello!"}</h2>
              <div className="cmc-prev-line" />
              <p className="cmc-prev-msg">{(message || "Your message here...").slice(0, 80)}{message.length > 80 ? "..." : ""}</p>
              <span className="cmc-prev-heart">❤️</span>
              {fromName && <p className="cmc-prev-from">{fromName}</p>}
            </div>
          </div>
        </div>

        {/* To field */}
        <div className="cmc-card">
          <label className="cmc-label" htmlFor="card-to">💝 To</label>
          <input id="card-to" className="cmc-input" value={toName} onChange={e => setToName(e.target.value)} placeholder="Recipient's name" maxLength={40} />
        </div>

        {/* Title field */}
        <div className="cmc-card">
          <label className="cmc-label" htmlFor="card-title">🎉 Occasion / Title</label>
          <input id="card-title" className="cmc-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Happy Birthday, Congratulations, etc." maxLength={40} />
        </div>

        {/* Message */}
        <div className="cmc-card">
          <label className="cmc-label" htmlFor="card-msg">✍️ Your Message</label>
          <textarea id="card-msg" className="cmc-textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write something from the heart..." maxLength={500} rows={4} />
          <p style={{ fontSize: "0.7rem", color: "#be185d", opacity: 0.5, marginTop: "0.3rem", textAlign: "right" }}>{message.length}/500</p>
          <span className="cmc-label" style={{ marginTop: "0.5rem" }}>💡 Or pick a message</span>
          <div className="cmc-presets">
            {activePresets.map((p, i) => (
              <button key={i} type="button" className={`cmc-preset ${message === p ? "active" : ""}`} onClick={() => setMessage(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* From field */}
        <div className="cmc-card">
          <label className="cmc-label" htmlFor="card-from">💌 From</label>
          <input id="card-from" className="cmc-input" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="With love, your name" maxLength={40} />
        </div>

        {/* Paper texture */}
        <div className="cmc-card">
          <span className="cmc-label">🎨 Paper Texture</span>
          <div className="cmc-papers">
            {PAPERS.map(p => (
              <button key={p.id} type="button" className={`cmc-paper-btn ${paper === p.id ? "active" : ""}`} onClick={() => setPaper(p.id)}>
                <div className="cmc-paper-swatch" style={{ background: p.bg }} />
                <span className="cmc-paper-name">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Decorations */}
        <div className="cmc-card">
          <span className="cmc-label">🎀 Decorations</span>
          <div className="cmc-decos">
            {DECOS.map(d => (
              <button key={d.id} type="button" className={`cmc-deco-btn ${decos.includes(d.id) ? "active" : ""}`} onClick={() => toggleDeco(d.id)}>
                <span className="cmc-deco-emoji">{d.emoji}</span>
                <span className="cmc-deco-name">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        <MusicSelector selectedTrackId={musicTrack} onChange={setMusicTrack} />
      </div>

      {/* Fixed bottom CTA bar */}
      <div className="cmc-bottom">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <button type="button" className="cmc-cta" onClick={handlePreview} disabled={!message.trim()}>
            {t("card.previewBtn", "Preview & Share ✨")}
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" className="cmc-ghost cmc-cart-cta" onClick={addCardToCart} disabled={!message.trim()} style={{ width: "100%", margin: 0 }}>
              <ShoppingCart size={16} />
              {added ? "Added!" : "Add to cart"}
            </button>
            <button type="button" className="cmc-ghost cmc-cart-cta" onClick={() => navigate("/cart")} style={{ width: "100%", margin: 0 }}>
              View cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


