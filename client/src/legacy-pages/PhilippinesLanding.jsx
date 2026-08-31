import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Heart, Sparkles, Send, Gift, MessageCircle, Star, ArrowRight, 
  CheckCircle2, Smile, ShieldCheck, ChevronRight 
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { applySeo } from "../lib/seo";

/* ── STYLES matching Kawaii Bloom ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .ph-root {
    min-height: 100vh;
    background: linear-gradient(160deg, #fdf6f0 0%, #f8edf0 55%, #fdf0f5 100%);
    color: #3E2723;
    font-family: 'Manrope', sans-serif;
    overflow-x: hidden;
    position: relative;
  }

  /* Shimmer gradient text */
  @keyframes phShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .ph-shimmer {
    background: linear-gradient(90deg, #a65d5d 0%, #d47b8e 35%, #7c3f4f 70%, #a65d5d 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: phShimmer 3.5s linear infinite;
  }

  /* Shimmer pulsing button */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 14px 34px rgba(124,63,79,0.28); }
    50%       { box-shadow: 0 14px 34px rgba(124,63,79,0.48), 0 0 0 10px rgba(124,63,79,0); }
  }

  .ph-btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    border-radius: 9999px;
    padding: 0 2rem;
    min-height: 56px;
    cursor: pointer;
    text-decoration: none;
    animation: pw-pulse 2.5s infinite;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .ph-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px rgba(124,63,79,0.45);
  }
  .ph-btn-primary:active { transform: scale(0.98); }

  .ph-btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(255,255,255,0.85);
    color: #7c4343;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: 1.5px solid rgba(166,93,93,0.25);
    border-radius: 9999px;
    padding: 0 1.75rem;
    min-height: 52px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.18s ease;
    backdrop-filter: blur(12px);
  }
  .ph-btn-secondary:hover {
    background: #fff5f4;
    border-color: #a65d5d;
    transform: translateY(-1px);
  }

  /* Glass Card */
  .ph-glass-card {
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 1.75rem;
    box-shadow: 0 10px 36px rgba(200, 130, 140, 0.12), 0 2px 8px rgba(200, 100, 100, 0.04);
  }

  /* Header Glass */
  .ph-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: rgba(253, 246, 240, 0.88);
    backdrop-filter: blur(22px);
    border-bottom: 1px solid rgba(200, 130, 140, 0.10);
    box-shadow: 0 2px 20px rgba(200, 100, 120, 0.06);
  }

  /* Marquee animation */
  @keyframes phTicker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ph-ticker-inner {
    display: flex;
    width: max-content;
    animation: phTicker 28s linear infinite;
  }
  .ph-ticker-inner:hover {
    animation-play-state: paused;
  }

  /* Floating petals */
  @keyframes phFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(-12px) rotate(6deg); }
  }
  .ph-floating {
    animation: phFloat 4s ease-in-out infinite;
  }

  /* Mobile bottom sticky action bar */
  .ph-sticky-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    padding: 0.75rem 1.25rem;
    background: rgba(253, 246, 240, 0.96);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(200, 130, 140, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
  }
  @media(min-width: 768px) {
    .ph-sticky-bar { display: none; }
  }
`;

/* ── PHILIPPINES GIFTS ── */
const PH_GIFTS = [
  {
    icon: "💐",
    title: "Digital Bouquet",
    tagline: "Ang paborito ng mga Pinoy",
    desc: "Pumili ng roses, tulips, o sunflowers at maglagay ng sweet message card.",
    path: "/create",
    badge: "Popular 🔥",
    cta: "Gumawa ng Bouquet",
  },
  {
    icon: "💌",
    title: "Greeting Card",
    tagline: "Vintage Envelope & Letter",
    desc: "Personalized na sulat sa loob ng vintage envelope na may sweet stickers.",
    path: "/create-greeting-card",
    badge: "New ✨",
    cta: "Magsulat ng Card",
  },
  {
    icon: "🎂",
    title: "3D Birthday Cake",
    tagline: "May kandilang nahiihipan!",
    desc: "Interactive 3D cake na pwedeng hipan ang candles gamit ang microphone o tap.",
    path: "/create-cake",
    badge: "Super Fun 🕯️",
    cta: "Mag-bake ng Cake",
  },
  {
    icon: "🤗",
    title: "Virtual Hug Card",
    tagline: "Pull-to-open na yakap",
    desc: "Para sa mga namimiss mo. Mahigpit na yakap mula sa malayo.",
    path: "/create-hug-card",
    badge: "Tearjerker 🥺",
    cta: "Magpadala ng Yakap",
  },
  {
    icon: "🧸",
    title: "Plushie Gift Box",
    tagline: "Cute 3D Teddy Bear",
    desc: "Surprise unboxing box na may kasamang cute at makulit na plushie.",
    path: "/create-plushie",
    badge: "Cute 🌸",
    cta: "Buksan ang Plushie",
  },
];

/* ── PINAS OCCASIONS ── */
const PH_OCCASIONS = [
  {
    emoji: "💖",
    title: "Monthsary & Anniversary",
    desc: "Bawat buwan ay may dahilan para maging sweet. Huwag kalimutan ang inyong monthsary!",
  },
  {
    emoji: "🌸",
    title: "Para kay Nanay / Mama",
    desc: "Pasasalamat sa walang kapantay na pagmamahal at pag-aaruga ni Nanay.",
  },
  {
    emoji: "🥺",
    title: "Pang-suyo (Bati na tayo)",
    desc: "Nagtatampo ba si crush o partner? Mabisang peace offering bago bumili ng milk tea!",
  },
  {
    emoji: "✈️",
    title: "LDR & OFW Care",
    desc: "Nasa ibang bansa o malayo sa pamilya? Iparamdam na laging kasama ka sa bawat sandali.",
  },
  {
    emoji: "🎂",
    title: "Birthday Surprise",
    desc: "Mas memorable kaysa sa simpleng 'HBD' post sa timeline. May sariling link at tugtog!",
  },
  {
    emoji: "✨",
    title: "Just Because (Naisip kita)",
    desc: "Walang okasyon. Gusto mo lang ipaalala kung gaano siya kahalaga sa buhay mo.",
  },
];

/* ── REAL TESTIMONIALS ── */
const PH_REVIEWS = [
  {
    quote: "Nagpadala ako ng bouquet sa GF ko sa Davao habang nasa Dubai ako. Umiyak siya sa tuwa nung binuksan niya sa Messenger! Sobrang touching.",
    author: "Carlo R.",
    location: "OFW Dubai / Davao",
    stars: 5,
    tag: "Monthsary Gift",
  },
  {
    quote: "Pang-suyo ko kay misis nung nagkatampuhan kami haha. Na-cute-an siya sa petals at note kaya bati na kami agad. Salamat Petals & Words!",
    author: "Jian M.",
    location: "Quezon City",
    stars: 5,
    tag: "Pang-suyo",
  },
  {
    quote: "Simple pero sobrang ganda ng aesthetic! Parang totoong Mamahaling card. Niyakap ni Mama ang screen niya nung makita ang flowers.",
    author: "Bea T.",
    location: "Cebu City",
    stars: 5,
    tag: "Para kay Mama",
  },
  {
    quote: "Akala ko mahirap gawin, tapos na pala ako wala pang 1 minute. Direct share sa Messenger tapos may background music pa!",
    author: "Danica L.",
    location: "Makati City",
    stars: 5,
    tag: "Surprise",
  },
];

export default function PhilippinesLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    applySeo({
      title: "Libreng Digital Bouquet Maker sa Pilipinas | Petals & Words",
      description: "Gumawa ng magandang digital bouquet, greeting card, o 3D cake para sa iyong minamahal sa Pilipinas. 100% Libre, walang app download, share agad sa Messenger o WhatsApp!",
      keywords: ["digital bouquet maker philippines", "virtual bouquet tagalog", "online bulaklak regalo", "monthsary gift online", "flowers para kay nanay"],
      path: "/ph",
    });
  }, []);

  return (
    <div className="ph-root">
      <style>{CSS}</style>

      {/* ── HEADER ── */}
      <header className="ph-header">
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <img src="/logo-transparent.png" alt="Petals & Words" style={{ height: 32, width: "auto" }} />
            <span style={{ fontSize: "0.75rem", background: "#ffd9d8", color: "#7c3f4f", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700, fontFamily: "'Montserrat', sans-serif" }}>
              🇵🇭 Pilipinas
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <Link to="/create" className="ph-btn-primary" style={{ minHeight: "40px", padding: "0 1.25rem", fontSize: "0.78rem" }}>
              Gumawa Na 💐
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ── TICKER ── */}
      <div style={{ background: "linear-gradient(90deg, #7c3f4f 0%, #a65d5d 50%, #7c3f4f 100%)", padding: "0.5rem 0", overflow: "hidden", color: "#fff", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em" }}>
        <div className="ph-ticker-inner">
          {[0, 1].map(k => (
            <div key={k} style={{ display: "flex", gap: "2.5rem", paddingRight: "2.5rem" }}>
              <span>🌸 Sobrang cute na bouquet layouts</span>
              <span>💬 May kasamang personal note & music</span>
              <span>📲 1-Click share sa Messenger, Viber & WhatsApp</span>
              <span>⚡ Tapos sa loob ng 60 seconds</span>
              <span>🇵🇭 Walang app na kailangan i-download</span>
              <span>🔒 100% Libre mag-umpisa</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "3.5rem 1.25rem 2.5rem", textAlign: "center" }}>
        
        {/* Cute Pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(200,130,140,0.25)", borderRadius: "9999px", padding: "0.4rem 1.1rem", marginBottom: "1.25rem", boxShadow: "0 4px 14px rgba(200,130,140,0.1)" }}>
          <span style={{ fontSize: "1rem" }}>🌸</span>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.74rem", fontWeight: 800, color: "#a65d5d", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Ang #1 Digital Flower Maker sa Pilipinas
          </span>
        </div>

        {/* Big Emotion Headline */}
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 6.5vw, 4.2rem)", fontWeight: 600, lineHeight: 1.12, color: "#3d3028", margin: "0 0 1.25rem" }}>
          Magpadala ng bulaklak na <br />
          <em className="ph-shimmer" style={{ fontStyle: "italic", fontWeight: 700 }}>
            tatagos sa puso niya.
          </em>
        </h1>

        {/* Subtitle in natural Taglish */}
        <p style={{ fontSize: "1.05rem", color: "#6b544e", lineHeight: 1.7, maxWidth: 620, margin: "0 auto 2.25rem" }}>
          Kahit malayo, pwedeng magpadala ng sweet na digital bouquet, card, o cake sa loob ng 60 seconds. Diretso sa Messenger, Viber, o WhatsApp — walang app na kailangan i-download!
        </p>

        {/* Hero CTAs */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/create" className="ph-btn-primary" style={{ minWidth: 220 }}>
            💐 Gumawa ng Libreng Bouquet
          </Link>
          <a href="#gifts" className="ph-btn-secondary">
            🎁 Iba Pang Regalo
          </a>
        </div>

        {/* Trust Badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.75rem", marginTop: "2.5rem", flexWrap: "wrap", fontSize: "0.8rem", color: "#8a6d6e", fontWeight: 600 }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="#16a34a" /> 100% Libre mag-umpisa
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="#16a34a" /> No account or signup
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="#16a34a" /> GCash & Maya ready
          </span>
        </div>
      </section>

      {/* ── LIVE INTERACTIVE SAMPLE BOUQUET ── */}
      <section style={{ maxWidth: 680, margin: "0 auto 4rem", padding: "0 1.25rem" }}>
        <div className="ph-glass-card" style={{ padding: "1.75rem", position: "relative", overflow: "hidden" }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(200,130,140,0.15)", paddingBottom: "0.85rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.2rem" }}>✨</span>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", fontWeight: 800, color: "#a65d5d", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Halimbawa ng Matatanggap Nila
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", background: "#fdf0f5", color: "#a65d5d", padding: "4px 10px", borderRadius: "9999px", fontWeight: 700 }}>
              Live Sample
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1rem" }}>
            
            {/* Visual flower preview */}
            <div className="ph-floating" style={{ fontSize: "4.5rem", lineHeight: 1, filter: "drop-shadow(0 12px 24px rgba(166,93,93,0.25))" }}>
              💐
            </div>

            {/* Note tag preview */}
            <div style={{ background: "rgba(255,255,255,0.92)", border: "1.5px dashed rgba(166,93,93,0.3)", borderRadius: "1.25rem", padding: "1.25rem 1.5rem", maxWidth: 460, boxShadow: "0 6px 20px rgba(0,0,0,0.04)" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.25rem", color: "#3d3028", lineHeight: 1.5, margin: "0 0 0.5rem" }}>
                "Kahit malayo ako ngayon, ikaw pa rin ang paborito kong pahinga at tahanan. Happy Monthsary, my love! Ingat ka palagi. 💕"
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#a65d5d", fontWeight: 700 }}>
                <span>Para kay: Bea 🌸</span>
                <span>Mula kay: Carlo (Dubai) ✈️</span>
              </div>
            </div>

            <Link to="/create" className="ph-btn-primary" style={{ minHeight: "46px", padding: "0 1.5rem", fontSize: "0.82rem", marginTop: "0.5rem" }}>
              Gawin ang Ganito Para sa Kanya →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PINAS OCCASIONS ── */}
      <section style={{ maxWidth: 960, margin: "0 auto 4.5rem", padding: "0 1.25rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", fontWeight: 800, color: "#a65d5d", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Kailan Nagpapadala ang mga Pinoy?
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4.5vw, 2.8rem)", fontWeight: 600, color: "#3d3028", margin: "0.3rem 0" }}>
            Maging dahilan ng <em className="ph-shimmer">ngiti nila ngayon</em>
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#705f58", maxWidth: 540, margin: "0 auto" }}>
            Hindi kailangang maghintay ng Pasko o Valentine's para magparamdam ng pagmamahal.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {PH_OCCASIONS.map((occ, idx) => (
            <div key={idx} className="ph-glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ fontSize: "2rem" }}>{occ.emoji}</div>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "#3d3028", margin: 0 }}>
                {occ.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#6b544e", lineHeight: 1.6, margin: 0 }}>
                {occ.desc}
              </p>
              <Link to="/create" style={{ color: "#a65d5d", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "auto", paddingTop: "0.5rem" }}>
                Gumawa ng Regalo <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── ALL GIFTS SECTION ── */}
      <section id="gifts" style={{ maxWidth: 960, margin: "0 auto 4.5rem", padding: "0 1.25rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", fontWeight: 800, color: "#a65d5d", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Pumili ng Regalo
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4.5vw, 2.8rem)", fontWeight: 600, color: "#3d3028", margin: "0.3rem 0" }}>
            5 Cute na Paraan para <em className="ph-shimmer">magpasaya</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {PH_GIFTS.map((g, idx) => (
            <div key={idx} className="ph-glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ width: 54, height: 54, borderRadius: "1.25rem", background: "linear-gradient(135deg, #fff5f4, #ffd9d8)", display: "grid", placeItems: "center", fontSize: "1.8rem" }}>
                  {g.icon}
                </div>
                <span style={{ background: "#fff5f4", border: "1px solid rgba(166,93,93,0.2)", color: "#a65d5d", fontSize: "0.68rem", fontWeight: 800, padding: "3px 8px", borderRadius: "9999px", fontFamily: "'Montserrat', sans-serif" }}>
                  {g.badge}
                </span>
              </div>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#3d3028", margin: "0 0 0.2rem" }}>
                {g.title}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "#a65d5d", fontWeight: 700, margin: "0 0 0.5rem" }}>
                {g.tagline}
              </p>
              <p style={{ fontSize: "0.85rem", color: "#6b544e", lineHeight: 1.5, margin: "0 0 1.5rem" }}>
                {g.desc}
              </p>
              <Link to={g.path} className="ph-btn-primary" style={{ minHeight: "44px", padding: "0 1.25rem", fontSize: "0.8rem", marginTop: "auto", width: "100%" }}>
                {g.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 860, margin: "0 auto 4.5rem", padding: "0 1.25rem" }}>
        <div className="ph-glass-card" style={{ padding: "2.5rem 1.75rem", textAlign: "center" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", fontWeight: 800, color: "#a65d5d", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Napakadali Lang
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 600, color: "#3d3028", margin: "0.3rem 0 2rem" }}>
            3 Hakbang, Tapos sa 60 Seconds
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", textAlign: "left" }}>
            
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "1.25rem", padding: "1.25rem", border: "1px solid rgba(200,130,140,0.15)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#a65d5d", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.75rem" }}>1</div>
              <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#3d3028", margin: "0 0 0.3rem" }}>Piliin ang Bulaklak</h4>
              <p style={{ fontSize: "0.82rem", color: "#6b544e", lineHeight: 1.5, margin: 0 }}>Pumili mula sa rosas, tulips, sunflower, at ibat ibang arrangement.</p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "1.25rem", padding: "1.25rem", border: "1px solid rgba(200,130,140,0.15)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#a65d5d", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.75rem" }}>2</div>
              <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#3d3028", margin: "0 0 0.3rem" }}>Isulat ang Sweet Note</h4>
              <p style={{ fontSize: "0.82rem", color: "#6b544e", lineHeight: 1.5, margin: 0 }}>Maglagay ng mensahe mula sa puso o pumili sa aming cute 1-tap Filipino presets.</p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "1.25rem", padding: "1.25rem", border: "1px solid rgba(200,130,140,0.15)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#a65d5d", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.75rem" }}>3</div>
              <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "#3d3028", margin: "0 0 0.3rem" }}>I-share ang Link</h4>
              <p style={{ fontSize: "0.82rem", color: "#6b544e", lineHeight: 1.5, margin: 0 }}>I-send sa Messenger, Viber, o WhatsApp. Pag-click nila, may unboxing at tugtog!</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ maxWidth: 960, margin: "0 auto 5rem", padding: "0 1.25rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", fontWeight: 800, color: "#a65d5d", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Kwentong Pinoy
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4.5vw, 2.8rem)", fontWeight: 600, color: "#3d3028", margin: "0.3rem 0" }}>
            Mahigit libo-libong ngiti <em className="ph-shimmer">sa buong bansa</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {PH_REVIEWS.map((rev, idx) => (
            <div key={idx} className="ph-glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b", fontSize: "0.9rem" }}>
                {"★".repeat(rev.stars)}
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.1rem", color: "#3d3028", lineHeight: 1.5, margin: 0 }}>
                "{rev.quote}"
              </p>
              <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid rgba(200,130,140,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.82rem", fontWeight: 700, color: "#3d3028", margin: 0 }}>{rev.author}</p>
                  <p style={{ fontSize: "0.72rem", color: "#a65d5d", margin: 0 }}>{rev.location}</p>
                </div>
                <span style={{ background: "#fff5f4", color: "#a65d5d", fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
                  {rev.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM BIG CTA ── */}
      <section style={{ maxWidth: 760, margin: "0 auto 6rem", padding: "0 1.25rem", textAlign: "center" }}>
        <div className="ph-glass-card" style={{ padding: "3rem 1.5rem", background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,245,244,0.9))" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🌸</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5.5vw, 3.2rem)", fontWeight: 600, color: "#3d3028", margin: "0 0 1rem" }}>
            Huwag nang hintayin ang bukas.<br />
            <em className="ph-shimmer">Pangitiin mo siya ngayon.</em>
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#6b544e", maxWidth: 480, margin: "0 auto 2rem" }}>
            Libre, mabilis, at sigurado kang matutuwa siya. I-share agad sa Messenger o WhatsApp!
          </p>
          <Link to="/create" className="ph-btn-primary" style={{ minWidth: 240 }}>
            💐 Simulan ang Bouquet Ngayon
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(200,130,140,0.15)", padding: "2rem 1.25rem", textAlign: "center", fontSize: "0.75rem", color: "#8a6d6e" }}>
        <p style={{ margin: "0 0 0.5rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontStyle: "italic", color: "#a65d5d" }}>
          Petals & Words · Para sa mga Pilipino sa buong mundo 💕
        </p>
        <p style={{ margin: 0 }}>
          GCash, Maya & International Cards accepted · All digital bouquets are delivered instantly via web link.
        </p>
      </footer>

      {/* ── MOBILE BOTTOM STICKY BAR ── */}
      <div className="ph-sticky-bar">
        <div>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.78rem", fontWeight: 800, color: "#3d3028" }}>
            🌸 Digital Bouquet Maker
          </div>
          <div style={{ fontSize: "0.68rem", color: "#16a34a", fontWeight: 700 }}>
            100% Libre mag-umpisa
          </div>
        </div>
        <Link to="/create" className="ph-btn-primary" style={{ minHeight: "44px", padding: "0 1.25rem", fontSize: "0.78rem" }}>
          Gumawa Na 💐
        </Link>
      </div>
    </div>
  );
}
