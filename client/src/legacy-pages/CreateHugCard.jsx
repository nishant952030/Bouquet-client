import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import CreatorNavbar from "../components/CreatorNavbar";
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
  .chc-header{position:sticky;top:12px;z-index:50;max-width:900px;margin:0 auto 0.75rem;width:calc(100% - 24px);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(255,255,255,0.82);border:1.5px solid rgba(255,255,255,0.95);border-radius:9999px;box-shadow:0 12px 32px rgba(166,93,93,0.12);overflow:hidden}
  .chc-header-inner{max-width:900px;margin:0 auto;padding:0.55rem 1.15rem;display:flex;align-items:center;justify-content:space-between}

  .chc-studio-grid{display:grid;grid-template-columns:1fr;gap:1.5rem;max-width:1200px;margin:0 auto;padding:1.25rem 1.25rem 6.5rem}
  @media(min-width:1024px){
    .chc-studio-grid{grid-template-columns:380px 1fr;gap:2rem;align-items:start}
  }

  .chc-sticky-stage{position:relative}
  @media(min-width:1024px){
    .chc-sticky-stage{position:sticky;top:5rem;align-self:start;z-index:20}
  }

  .chc-card{background:rgba(255,255,255,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.95);border-radius:1.5rem;box-shadow:0 12px 36px rgba(200,130,140,0.10);padding:1.25rem;margin-bottom:1.15rem}

  .chc-label{font-size:0.68rem;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#a65d5d;margin-bottom:0.45rem;display:block;font-family:'Montserrat',sans-serif}

  .chc-input{width:100%;padding:0.75rem 1rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.22);font-family:'Manrope',sans-serif;font-size:0.9rem;color:#3E2723;background:rgba(255,255,255,0.9);outline:none;transition:border-color 0.2s,box-shadow 0.2s;margin-bottom:0.5rem}
  .chc-input:focus{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.12)}

  .chc-textarea{width:100%;padding:0.85rem 1rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.22);font-family:'Patrick Hand',cursive;font-size:1.15rem;color:#3E2723;background:rgba(255,255,255,0.9);outline:none;resize:vertical;min-height:110px;line-height:1.5;transition:border-color 0.2s,box-shadow 0.2s}
  .chc-textarea:focus{border-color:#a65d5d;box-shadow:0 0 0 3px rgba(166,93,93,0.12)}

  .chc-presets{display:flex;flex-direction:column;gap:0.45rem;margin-top:0.6rem}
  .chc-preset{text-align:left;padding:0.65rem 0.9rem;border-radius:0.875rem;border:1.5px solid rgba(200,130,140,0.18);background:rgba(255,255,255,0.8);font-family:'Patrick Hand',cursive;font-size:1.05rem;color:#7b5455;line-height:1.4;cursor:pointer;transition:all 0.18s}
  .chc-preset:hover{border-color:#a65d5d;background:#fff5f4;transform:translateY(-1px)}
  .chc-preset.active{border-color:#a65d5d;background:#fff5f4;font-weight:700}

  /* Live preview */
  .chc-preview-wrap{display:flex;justify-content:center;margin:0.75rem 0}
  .chc-preview{position:relative;width:100%;max-width:300px;min-height:360px;border-radius:18px;padding:2rem 1.25rem;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:space-between;box-shadow:0 14px 38px rgba(166,93,93,0.16);background:rgba(255,255,255,0.95);border:2.5px dashed rgba(166,93,93,0.4);transition:all 0.3s ease}
  .chc-preview:hover{transform:translateY(-3px);box-shadow:0 20px 48px rgba(166,93,93,0.22)}
  .chc-prev-title{font-family:'Caveat',cursive;font-size:2.2rem;font-weight:700;color:#a65d5d;line-height:1.1;margin:0}
  .chc-prev-msg{font-family:'Patrick Hand',cursive;font-size:1.15rem;color:#3E2723;line-height:1.5;margin:0}

  .chc-step-badge{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#7c3f4f;color:#fff;font-size:0.72rem;font-weight:800;margin-right:6px}

  /* Shimmer CTA */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }
  .chc-cta{width:100%;padding:0 1.5rem;min-height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#a65d5d 0%,#7c3f4f 100%);color:#fff;font-family:'Montserrat',sans-serif;font-size:0.92rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;animation:pw-pulse 2.5s infinite;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;gap:8px}
  .chc-cta:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(124,63,79,0.4)}
  .chc-cta:disabled{background:#e4e2de;color:#a0888d;cursor:not-allowed;box-shadow:none;transform:none;animation:none}

  .chc-ghost{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.8);color:#7c4343;font-size:0.78rem;font-weight:600;font-family:'Montserrat',sans-serif;border:1.5px solid rgba(124,67,67,0.22);border-radius:999px;padding:0.35rem 0.85rem;cursor:pointer;text-decoration:none;transition:all 0.15s}
  .chc-ghost:hover{background:#ffd9d8;border-color:#7c4343;transform:translateY(-1px)}
  .chc-bottom{position:fixed;inset:auto 0 0;z-index:40;background:rgba(253,246,240,0.96);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-top:1px solid rgba(200,130,140,0.12);padding:0.75rem 1.25rem 1rem}
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

  const [line1, setLine1] = useState(isPH ? "Warm" : "Happy");
  const [line2, setLine2] = useState(isPH ? "Virtual" : "Mother's");
  const [line3, setLine3] = useState(isPH ? "Hug!" : "Day!");
  const [message, setMessage] = useState(activePresets[0]);
  const [toName, setToName] = useState("");
  const [fromName, setFromName] = useState("");
  const [musicTrack, setMusicTrack] = useState("none");

  useEffect(() => {
    applySeo({
      title: "Create a Virtual Hug Card | Personalize & Share Free",
      description: "Create a personalized, interactive virtual hug card with a custom message. Share it instantly via link or WhatsApp!",
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

  return (
    <main className="chc-root">
      <style>{CSS}</style>

      <CreatorNavbar />

      <div className="chc-studio-grid">
        {/* ── LEFT COLUMN: STICKY LIVE PREVIEW ── */}
        <div className="chc-sticky-stage">
          <div className="chc-card" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span className="chc-label" style={{ margin: 0 }}>✨ Live Hug Preview</span>
              <span style={{ fontSize: "0.72rem", color: "#a65d5d", fontWeight: 700 }}>Pull-To-Open Hug</span>
            </div>

            <div className="chc-preview-wrap">
              <div className="chc-preview">
                {toName ? <p style={{ fontFamily: "'Patrick Hand',cursive", color: "#be185d", fontSize: "1.05rem", margin: 0 }}>To {toName}</p> : <p style={{ fontFamily: "'Patrick Hand',cursive", color: "#be185d", fontSize: "1.05rem", opacity: 0.5, margin: 0 }}>To Someone Special</p>}
                <div>
                  <h2 className="chc-prev-title">
                    {line1 || "..."}<br />{line2}<br />{line3}
                  </h2>
                  <div style={{ width: 45, height: 2, background: "#fecdd3", margin: "0.5rem auto" }} />
                </div>
                <p className="chc-prev-msg">{(message || "Your inside message here...").slice(0, 100)}{message.length > 100 ? "..." : ""}</p>
                {fromName ? <p style={{ fontFamily: "'Patrick Hand',cursive", color: "#be185d", fontSize: "1.05rem", margin: 0 }}>— {fromName}</p> : <p style={{ fontFamily: "'Patrick Hand',cursive", color: "#be185d", fontSize: "1.05rem", opacity: 0.5, margin: 0 }}>— With love</p>}
              </div>
            </div>

            <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginTop: "0.6rem" }}>
              Interactive opening animation when recipient unlocks
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: STUDIO CONTROLS ── */}
        <div>
          {/* Headline */}
          <div style={{ marginBottom: "1rem" }}>
            <p className="chc-label" style={{ marginBottom: "0.25rem" }}>🤗 Virtual Hug Studio</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 600, color: "#3d3028", lineHeight: 1.15, margin: 0 }}>
              {isPH ? "Gumawa ng Virtual Hug" : "Send a Warm Virtual Hug"}
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#705f58", marginTop: "0.35rem" }}>
              {isPH ? "Magpadala ng mahigpit na yakap na bubukas sa screen nila nang libre." : "Personalize your pull-to-open virtual hug card and send it across the miles."}
            </p>
          </div>

          {/* Step 1: Names & Cover */}
          <div className="chc-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span className="chc-step-badge">1</span>
              <span className="chc-label" style={{ margin: 0 }}>💝 Recipient & Cover Lines</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label className="chc-label" htmlFor="hc-to">To (Recipient)</label>
                <input id="hc-to" className="chc-input" value={toName} onChange={e => setToName(e.target.value)} placeholder="Recipient's Name" maxLength={30} />
              </div>
              <div>
                <label className="chc-label" htmlFor="hc-from">From (Sender)</label>
                <input id="hc-from" className="chc-input" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Your Name" maxLength={30} />
              </div>
            </div>

            <label className="chc-label">🌟 Cover Text (3 Animated Lines)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
              <input className="chc-input" value={line1} onChange={e => setLine1(e.target.value)} placeholder="Line 1" maxLength={15} />
              <input className="chc-input" value={line2} onChange={e => setLine2(e.target.value)} placeholder="Line 2" maxLength={15} />
              <input className="chc-input" value={line3} onChange={e => setLine3(e.target.value)} placeholder="Line 3" maxLength={15} />
            </div>
          </div>

          {/* Step 2: Inside Message */}
          <div className="chc-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span className="chc-step-badge">2</span>
              <span className="chc-label" style={{ margin: 0 }}>✍️ Inside Hug Note</span>
            </div>

            <textarea id="hc-msg" className="chc-textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write something from the heart..." maxLength={250} rows={3} />
            <p style={{ fontSize: "0.7rem", color: "#a65d5d", opacity: 0.6, marginTop: "0.3rem", textAlign: "right" }}>{message.length}/250</p>

            <span className="chc-label" style={{ marginTop: "0.6rem" }}>💡 1-Tap Sweet Notes</span>
            <div className="chc-presets">
              {activePresets.map((p, i) => (
                <button key={i} type="button" className={`chc-preset ${message === p ? "active" : ""}`} onClick={() => setMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Music */}
          <div className="chc-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span className="chc-step-badge">3</span>
              <span className="chc-label" style={{ margin: 0 }}>🎵 Background Soundtrack</span>
            </div>
            <MusicSelector selectedTrackId={musicTrack} onChange={setMusicTrack} />
          </div>

          {/* Desktop Single CTA Box */}
          {isDesktop && (
            <div className="chc-card" style={{ background: "linear-gradient(135deg, #ffffff 0%, #fff4f6 100%)", border: "1.5px solid rgba(228, 141, 156, 0.45)" }}>
              <button type="button" className="chc-cta" onClick={handlePreview} disabled={!message.trim() || !line1.trim()}>
                🤗 PREVIEW & SHARE HUG CARD →
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginTop: "0.75rem", fontSize: "0.72rem", color: "#9e8f90" }}>
                <span>✨ 100% Free to create</span><span>•</span>
                <span>Instant Share Link</span><span>•</span>
                <span>Interactive Hug Unfold</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Fixed bottom CTA bar */}
      {!isDesktop && (
        <div className="chc-bottom">
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <button type="button" className="chc-cta" onClick={handlePreview} disabled={!message.trim() || !line1.trim()}>
              🤗 PREVIEW & SHARE HUG CARD →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

