import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import CreatorNavbar from "../components/CreatorNavbar";
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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box}

  .cmc-root{font-family:'Manrope',sans-serif;min-height:100vh;background:linear-gradient(160deg,#fdf6f0 0%,#f8edf0 55%,#fdf0f5 100%);color:#3E2723}
  .cmc-header{position:sticky;top:12px;z-index:50;max-width:900px;margin:0 auto 0.75rem;width:calc(100% - 24px);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(255,255,255,0.82);border:1.5px solid rgba(255,255,255,0.95);border-radius:9999px;box-shadow:0 12px 32px rgba(166,93,93,0.12);overflow:hidden}
  .cmc-header-inner{max-width:900px;margin:0 auto;padding:0.55rem 1.15rem;display:flex;align-items:center;justify-content:space-between}

  .cmc-studio-grid{display:grid;grid-template-columns:1fr;gap:1.5rem;max-width:1200px;margin:0 auto;padding:1.25rem 1.25rem 6.5rem}
  @media(min-width:1024px){
    .cmc-studio-grid{grid-template-columns:420px 1fr;gap:2rem;align-items:start}
  }

  .cmc-sticky-stage{position:relative}
  @media(min-width:1024px){
    .cmc-sticky-stage{position:sticky;top:5rem;align-self:start;z-index:20}
  }

  .cmc-card{background:rgba(255,255,255,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.95);border-radius:1.5rem;box-shadow:0 12px 36px rgba(200,130,140,0.10);padding:1.25rem;margin-bottom:1.15rem}

  .cmc-label{font-size:0.68rem;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#a65d5d;margin-bottom:0.45rem;display:block;font-family:'Montserrat',sans-serif}

  .cmc-input{width:100%;padding:0.75rem 1rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.22);font-family:'Manrope',sans-serif;font-size:0.9rem;color:#3E2723;background:rgba(255,255,255,0.9);outline:none;transition:border-color 0.2s,box-shadow 0.2s}
  .cmc-input:focus{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.12)}

  .cmc-textarea{width:100%;padding:0.85rem 1rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.22);font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;color:#3E2723;background:rgba(255,255,255,0.9);outline:none;resize:vertical;min-height:110px;line-height:1.7;transition:border-color 0.2s,box-shadow 0.2s}
  .cmc-textarea:focus{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.12)}

  .cmc-presets{display:flex;flex-direction:column;gap:0.45rem;margin-top:0.6rem}
  .cmc-preset{text-align:left;padding:0.65rem 0.9rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.18);background:rgba(255,255,255,0.8);font-family:'Cormorant Garamond',serif;font-size:0.92rem;font-style:italic;color:#7b5455;line-height:1.6;cursor:pointer;transition:all 0.18s}
  .cmc-preset:hover{border-color:#a65d5d;background:#fff5f4;transform:translateY(-1px)}
  .cmc-preset.active{border-color:#a65d5d;background:#fff5f4;font-weight:600}

  .cmc-papers{display:grid;grid-template-columns:repeat(3,1fr);gap:0.6rem}
  .cmc-paper-btn{border-radius:0.875rem;border:2.5px solid transparent;padding:0.55rem;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:0.35rem;background:rgba(255,255,255,0.85)}
  .cmc-paper-btn:hover{border-color:rgba(166,93,93,0.4);transform:translateY(-1px)}
  .cmc-paper-btn.active{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.15)}
  .cmc-paper-swatch{width:100%;aspect-ratio:4/3;border-radius:0.5rem;border:1px solid rgba(0,0,0,0.06)}
  .cmc-paper-name{font-size:0.68rem;font-weight:700;color:#a65d5d;font-family:'Montserrat',sans-serif}

  .cmc-decos{display:grid;grid-template-columns:repeat(3,1fr);gap:0.6rem}
  .cmc-deco-btn{border-radius:0.875rem;border:2px solid rgba(200,130,140,0.15);padding:0.65rem;cursor:pointer;transition:all 0.18s;display:flex;flex-direction:column;align-items:center;gap:0.25rem;background:rgba(255,255,255,0.85)}
  .cmc-deco-btn:hover{border-color:rgba(166,93,93,0.4);transform:translateY(-1px)}
  .cmc-deco-btn.active{border-color:#a65d5d;background:#fff5f4}
  .cmc-deco-emoji{font-size:1.5rem}
  .cmc-deco-name{font-size:0.68rem;font-weight:700;color:#a65d5d;font-family:'Montserrat',sans-serif}

  /* Live preview Card */
  .cmc-preview-wrap{display:flex;justify-content:center;margin:0.75rem 0}
  .cmc-preview{position:relative;width:100%;max-width:320px;min-height:400px;border-radius:18px;padding:2rem 1.25rem;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:0.75rem;box-shadow:0 16px 40px rgba(166,93,93,0.18);overflow:hidden;transition:all 0.3s ease}
  .cmc-preview:hover{transform:translateY(-3px);box-shadow:0 22px 50px rgba(166,93,93,0.24)}
  .cmc-prev-to{font-family:'Great Vibes',cursive;font-size:1.15rem;color:#a65d5d;margin:0}
  .cmc-prev-flower{font-size:2rem;line-height:1}
  .cmc-prev-title{font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:700;color:#7c3f4f;line-height:1.2;margin:0}
  .cmc-prev-line{width:50px;height:1.5px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:0.25rem auto}
  .cmc-prev-msg{font-family:'Cormorant Garamond',serif;font-size:0.95rem;font-style:italic;color:#7b5455;line-height:1.7;max-width:260px;margin:0}
  .cmc-prev-heart{font-size:1.3rem}
  .cmc-prev-from{font-family:'Great Vibes',cursive;font-size:1.15rem;color:#a65d5d;margin:0}
  .cmc-prev-deco{position:absolute;pointer-events:none;font-size:1.1rem;opacity:0.6}

  /* Step badge */
  .cmc-step-badge{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#7c3f4f;color:#fff;font-size:0.72rem;font-weight:800;margin-right:6px}

  /* Shimmer CTA */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .cmc-cta{width:100%;padding:0 1.5rem;min-height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#a65d5d 0%,#7c3f4f 100%);color:#fff;font-family:'Montserrat',sans-serif;font-size:0.92rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;animation:pw-pulse 2.5s infinite;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;gap:8px}
  .cmc-cta:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(124,63,79,0.4)}
  .cmc-cta:disabled{background:#e4e2de;color:#a0888d;cursor:not-allowed;box-shadow:none;transform:none;animation:none}

  .cmc-ghost{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.8);color:#7c4343;font-size:0.78rem;font-weight:600;font-family:'Montserrat',sans-serif;border:1.5px solid rgba(124,67,67,0.22);border-radius:999px;padding:0.35rem 0.85rem;cursor:pointer;text-decoration:none;transition:all 0.15s}
  .cmc-ghost:hover{background:#ffd9d8;border-color:#7c4343;transform:translateY(-1px)}
  .cmc-bottom{position:fixed;inset:auto 0 0;z-index:40;background:rgba(253,246,240,0.96);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-top:1px solid rgba(200,130,140,0.12);padding:0.75rem 1.25rem 1rem}
`;

/* ── Decoration positions ── */
const DECO_POSITIONS = [
  { top: "6%", left: "8%" }, { top: "8%", right: "10%" },
  { bottom: "10%", left: "8%" }, { bottom: "8%", right: "10%" },
  { top: "45%", left: "4%" }, { top: "42%", right: "4%" },
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

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const [activeMobileTab, setActiveMobileTab] = useState("style");

  const selectedPaper = PAPERS.find(p => p.id === paper) || PAPERS[0];
  const activeDecos = DECOS.filter(d => decos.includes(d.id));

  useEffect(() => {
    applySeo({
      title: "Create a Greeting Card | Personalize & Share Free",
      description: "Create a personalized, interactive greeting card with custom messages, paper textures, and decorations. Share it instantly via link or WhatsApp!",
      keywords: ["greeting card", "digital card maker", "ecard creator"],
      path: "/create-greeting-card",
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
    localStorage.setItem("pw_pending_greeting_card", JSON.stringify(cardData));
    navigate("/payment-greeting-card", { state: { cardData, encoded } });
  };

  return (
    <main className="cmc-root">
      <style>{CSS}</style>

      <CreatorNavbar />

      <div className="cmc-studio-grid">
        {/* ── LEFT COLUMN: STICKY LIVE CARD PREVIEW ── */}
        <div className="cmc-sticky-stage">
          <div className="cmc-card" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span className="cmc-label" style={{ margin: 0 }}>✨ Live Card Preview</span>
              <span style={{ fontSize: "0.72rem", color: "#a65d5d", fontWeight: 700 }}>Interactive 3D Card</span>
            </div>

            <div className="cmc-preview-wrap">
              <div className="cmc-preview" style={{ background: selectedPaper.bg }}>
                <div style={{ position: "absolute", inset: 7, borderRadius: 13, border: `1.5px solid ${selectedPaper.border}`, pointerEvents: "none" }} />
                {activeDecos.map((d, i) => (
                  <span key={d.id} className="cmc-prev-deco" style={DECO_POSITIONS[i] || {}}>{d.emoji}</span>
                ))}
                {toName ? <p className="cmc-prev-to">To {toName}</p> : <p className="cmc-prev-to" style={{ opacity: 0.5 }}>To Someone Special</p>}
                <div>
                  <span className="cmc-prev-flower">🌷</span>
                  <h2 className="cmc-prev-title">{title || "Hello!"}</h2>
                  <div className="cmc-prev-line" />
                </div>
                <p className="cmc-prev-msg">{(message || "Your message here...").slice(0, 120)}{message.length > 120 ? "..." : ""}</p>
                <div>
                  <span className="cmc-prev-heart">❤️</span>
                  {fromName ? <p className="cmc-prev-from">With love, {fromName}</p> : <p className="cmc-prev-from" style={{ opacity: 0.5 }}>With love, You</p>}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginTop: "0.6rem" }}>
              Updates in real time as you customize
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: STUDIO CUSTOMIZATION PANELS ── */}
        <div>
          {/* Headline */}
          <div style={{ marginBottom: "1rem" }}>
            <p className="cmc-label" style={{ marginBottom: "0.25rem" }}>💌 Digital Greeting Card Studio</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 600, color: "#3d3028", lineHeight: 1.15, margin: 0 }}>
              {isPH ? "Gumawa ng Greeting Card" : t("card.createTitle", "Personalize your greeting card.")}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#705f58", marginTop: "0.35rem" }}>
              {isPH ? "Pumili ng luxury paper texture, maglagay ng sweet message, at i-share agad." : "Select luxury stationery, add decorative stamps, and write your heartfelt message."}
            </p>
          </div>

          {/* Mobile Tab Switcher */}
          {!isDesktop && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "0.35rem", background: "rgba(255,255,255,0.75)", padding: "0.3rem", borderRadius: "9999px", border: "1px solid rgba(200,130,140,0.25)" }}>
                {[
                  { id: "style", label: "🎨 Paper & Stamps" },
                  { id: "message", label: "✍️ Letter & Names" },
                  { id: "audio", label: "🎵 Music" },
                ].map((tab) => {
                  const isActive = activeMobileTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveMobileTab(tab.id)}
                      style={{
                        flex: 1,
                        borderRadius: "9999px",
                        padding: "0.5rem 0.3rem",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        color: isActive ? "#fff" : "#6b5e5f",
                        background: isActive ? "linear-gradient(135deg, #7c3f4f 0%, #a65d5d 100%)" : "transparent",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Paper Texture & Stamps */}
          {(isDesktop || activeMobileTab === "style") && (
            <>
              <div className="cmc-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span className="cmc-step-badge">1</span>
                  <span className="cmc-label" style={{ margin: 0 }}>🎨 Stationery Paper Texture</span>
                </div>
                <div className="cmc-papers">
                  {PAPERS.map(p => (
                    <button key={p.id} type="button" className={`cmc-paper-btn ${paper === p.id ? "active" : ""}`} onClick={() => setPaper(p.id)}>
                      <div className="cmc-paper-swatch" style={{ background: p.bg }} />
                      <span className="cmc-paper-name">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cmc-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span className="cmc-step-badge">2</span>
                  <span className="cmc-label" style={{ margin: 0 }}>🎀 Decorative Stickers & Accents</span>
                </div>
                <div className="cmc-decos">
                  {DECOS.map(d => (
                    <button key={d.id} type="button" className={`cmc-deco-btn ${decos.includes(d.id) ? "active" : ""}`} onClick={() => toggleDeco(d.id)}>
                      <span className="cmc-deco-emoji">{d.emoji}</span>
                      <span className="cmc-deco-name">{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Message & Details */}
          {(isDesktop || activeMobileTab === "message") && (
            <>
              <div className="cmc-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span className="cmc-step-badge">3</span>
                  <span className="cmc-label" style={{ margin: 0 }}>✍️ Personalized Message & Names</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div>
                    <label className="cmc-label" htmlFor="card-to">💝 To (Recipient)</label>
                    <input id="card-to" className="cmc-input" value={toName} onChange={e => setToName(e.target.value)} placeholder="e.g. Maria, Mom" maxLength={40} />
                  </div>
                  <div>
                    <label className="cmc-label" htmlFor="card-from">💌 From (Sender)</label>
                    <input id="card-from" className="cmc-input" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Your Name" maxLength={40} />
                  </div>
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                  <label className="cmc-label" htmlFor="card-title">🎉 Occasion / Headline</label>
                  <input id="card-title" className="cmc-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Happy Birthday, Happy Anniversary, etc." maxLength={40} />
                </div>

                <div>
                  <label className="cmc-label" htmlFor="card-msg">✍️ Your Handwritten Note</label>
                  <textarea id="card-msg" className="cmc-textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write something from the heart..." maxLength={500} rows={4} />
                  <p style={{ fontSize: "0.7rem", color: "#a65d5d", opacity: 0.6, marginTop: "0.3rem", textAlign: "right" }}>{message.length}/500</p>
                </div>
              </div>

              {/* Message ideas */}
              <div className="cmc-card">
                <span className="cmc-label">💡 1-Tap Sweet Messages</span>
                <div className="cmc-presets">
                  {activePresets.map((p, i) => (
                    <button key={i} type="button" className={`cmc-preset ${message === p ? "active" : ""}`} onClick={() => setMessage(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Music */}
          {(isDesktop || activeMobileTab === "audio") && (
            <div className="cmc-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span className="cmc-step-badge">4</span>
                <span className="cmc-label" style={{ margin: 0 }}>🎵 Soundtrack & Atmosphere</span>
              </div>
              <MusicSelector selectedTrackId={musicTrack} onChange={setMusicTrack} />
            </div>
          )}

          {/* Desktop Single CTA Box */}
          {isDesktop && (
            <div className="cmc-card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #fff4f6 100%)", border: "1.5px solid rgba(228, 141, 156, 0.45)" }}>
              <button type="button" className="cmc-cta" onClick={handlePreview} disabled={!message.trim()}>
                💌 PREVIEW & SHARE CARD →
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginTop: "0.75rem", fontSize: "0.72rem", color: "#9e8f90" }}>
                <span>✨ 100% Free to create</span><span>•</span>
                <span>Instant Share Link</span><span>•</span>
                <span>Interactive 3D Opening</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Fixed bottom CTA bar */}
      {!isDesktop && (
        <div className="cmc-bottom">
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <button type="button" className="cmc-cta" onClick={handlePreview} disabled={!message.trim()}>
              {t("card.previewBtn", "PREVIEW & SHARE CARD ✨ →")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}


