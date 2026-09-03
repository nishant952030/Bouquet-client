"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import LanguageSwitcher from "../src/components/LanguageSwitcher";
import { blogPosts } from "../src/data/blogPosts";

const HomeScene = dynamic(() => import("./home-scene"), { ssr: false });

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_GIFTS = [
  { title: "Digital Bouquet", desc: "Arrange real flower stems with a heartfelt note.", icon: "💐", path: "/create", tag: "", color: "#fce4ec", accent: "#e48d9c", indiaOnly: false },
  { title: "Greeting Card", desc: "A beautiful letter in a customisable envelope.", icon: "💌", path: "/create-greeting-card", tag: "NEW", color: "#f3e5f5", accent: "#ab47bc", indiaOnly: false },
  { title: "Shagun Envelope", desc: "Digital cash gift claimed via UPI. Perfect for weddings.", icon: "✉️", path: "/shagun", tag: "NEW", color: "#fff8e1", accent: "#f9a825", indiaOnly: true },
  { title: "3D Birthday Cake", desc: "Bake & decorate a real 3D cake with candles.", icon: "🎂", path: "/create-cake", tag: "", color: "#e8f5e9", accent: "#66bb6a", indiaOnly: false },
  { title: "Plushie Gift Box", desc: "Cute furry 3D plushie inside a surprise box.", icon: "🧸", path: "/create-plushie", tag: "", color: "#e3f2fd", accent: "#42a5f5", indiaOnly: false },
  { title: "Virtual Hug Card", desc: "Pull-to-open interactive warm hug card.", icon: "🤗", path: "/create-hug-card", tag: "", color: "#fce4ec", accent: "#ef5350", indiaOnly: false },
];

const TESTIMONIALS_PH = [
  { quote: "Nagpadala ako ng bouquet sa aking Mama — niyakap niya ang screen niya! 😭 So worth it.", author: "Maria C.", city: "Quezon City", stars: 5 },
  { quote: "My boyfriend is in Dubai. This made our Monthsary feel so real. He cried!", author: "Ria S.", city: "Cebu City", stars: 5 },
  { quote: "Perfect for pasalubong without the expense! Sent it on Valentine's — she screenshotted it right away.", author: "Carlo D.", city: "Makati", stars: 5 },
  { quote: "Ang cute ng animations! Ginamit ko for Pasko para sa Lola ko sa Davao. She loved it!", author: "Bea M.", city: "Davao City", stars: 5 },
  { quote: "Ready in under 1 minute and free. No reason NOT to send your loved ones a surprise 🌸", author: "Ana T.", city: "Pasig", stars: 5 },
];

const TESTIMONIALS_IN = [
  { quote: "I sent this in 2 minutes and it felt so personal, not generic at all.", author: "Aditi S.", city: "Mumbai", stars: 5 },
  { quote: "Sent this to my dad on Father's Day — he called me right after. First time in years.", author: "Rahul G.", city: "Bengaluru", stars: 5 },
  { quote: "It was raining and I just wanted to say I was thinking of her. This was perfect.", author: "Sneha P.", city: "Pune", stars: 5 },
  { quote: "The flowers looked so premium on mobile. She cried happy tears 😭", author: "Priya M.", city: "Hyderabad", stars: 5 },
  { quote: "Got the share link in seconds. Sent it on WhatsApp and she loved it instantly.", author: "Neha K.", city: "Delhi", stars: 5 },
];

const TESTIMONIALS_GLOBAL = [
  { quote: "I sent this in 2 minutes and it felt so personal, not generic at all.", author: "Sarah K.", city: "New York", stars: 5 },
  { quote: "Sent this to my dad on Father's Day — he called me right after. First time in years.", author: "James L.", city: "London", stars: 5 },
  { quote: "It was raining and I just wanted to say I was thinking of her. This was perfect.", author: "Emma R.", city: "Toronto", stars: 5 },
  { quote: "The flowers looked so premium on mobile. She cried happy tears 😭", author: "Lily T.", city: "Sydney", stars: 5 },
  { quote: "Got the share link in seconds. Sent it on WhatsApp and she loved it instantly.", author: "Sofia M.", city: "Amsterdam", stars: 5 },
];

const TICKER_PH = [
  "💐 Maria just sent a bouquet to her Mama · 2m ago",
  "🎂 Juan baked a Pasko cake for Lola · 5m ago",
  "💌 Jasmine sent a love letter to Carlo · 8m ago",
  "🤗 Bea sent a virtual hug to her Ate · 12m ago",
  "💐 Ria made a bouquet for Monthsary · 15m ago",
  "🎂 Diego baked a birthday cake for Ana · 18m ago",
  "💐 Clara sent flowers to her best friend in Cebu · 21m ago",
  "🤗 Kuya sent a hug card to his baby sister · 25m ago",
];

const TICKER_IN = [
  "💐 Aditi just sent a bouquet to her mom · 2m ago",
  "🎂 Rohan baked a birthday cake for Riya · 5m ago",
  "💌 Sneha sent a greeting card to her bestie · 8m ago",
  "🧸 Karan gifted a plushie to his girlfriend · 12m ago",
  "✉️ Amit sent a Shagun envelope for Pooja's wedding · 15m ago",
  "🤗 Priya sent a virtual hug to her sister · 18m ago",
  "💐 Dev made a bouquet for Teacher's Day · 21m ago",
  "🎂 Neha baked a cake for her dad's birthday · 25m ago",
];

const TICKER_GLOBAL = [
  "💐 Sarah just sent a bouquet to her mom · 2m ago",
  "🎂 James baked a birthday cake for Emma · 5m ago",
  "💌 Lily sent a greeting card to her best friend · 8m ago",
  "🧸 Marco gifted a plushie to his partner · 12m ago",
  "🤗 Sofia sent a virtual hug to her sister · 15m ago",
  "💐 Alex made a bouquet for Mother's Day · 18m ago",
  "🎂 Olivia baked a cake for her dad's birthday · 22m ago",
  "💌 Noah sent a card to surprise his girlfriend · 26m ago",
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick a gift", desc: "Choose from bouquets, cakes, cards, plushies & more.", icon: "🎁" },
  { step: "02", title: "Personalise it", desc: "Add your name, a heartfelt note, and customise the look.", icon: "✏️" },
  { step: "03", title: "Share the link", desc: "Send via WhatsApp, Messenger, or Viber. Done in seconds.", icon: "🔗" },
];

const FEATURES_PH = [
  "🌸 Sobrang cute na bouquet layouts", "🎨 Customize ng colors & themes", "💬 May personal note",
  "📲 Share via Messenger or Viber", "🚀 Tapos sa 60 seconds", "🔒 No signup needed",
  "🇵🇭 Para sa mga Pilipino", "💸 100% Libre forever",
];

const FEATURES_IN = [
  "🌸 Real bouquet layouts", "🎨 Custom colors & themes", "💬 Personal note included",
  "📲 WhatsApp-ready link", "🚀 Ready in 60 seconds", "🔒 No signup needed",
  "❤️ Made with love in India", "💸 100% Free forever",
];

const FEATURES_GLOBAL = [
  "🌸 Real bouquet layouts", "🎨 Custom colors & themes", "💬 Personal note included",
  "📲 WhatsApp-ready link", "🚀 Ready in 60 seconds", "🔒 No signup needed",
  "🌍 Works worldwide", "💸 100% Free forever",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function useIntersectionOnce(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

// Detect visitor country via timezone/locale with lightweight IP geo API fallback.
// Returns country code ("IN", "PH", etc.) or null while loading.
function useCountry() {
  const [country, setCountry] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const locale = String(navigator?.language || "").toUpperCase();
      if (tz === "Asia/Manila" || locale.includes("-PH")) return "PH";
      if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || locale.includes("-IN")) return "IN";
    } catch {}
    return null;
  });

  useEffect(() => {
    if (country === "PH") return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const locale = String(navigator?.language || "").toUpperCase();
      if (tz === "Asia/Manila" || locale.includes("-PH")) {
        setCountry("PH");
        return;
      } else if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || locale.includes("-IN")) {
        setCountry("IN");
      }
    } catch {}

    fetch("https://api.country.is/")
      .then(r => r.json())
      .then(d => {
        if (d?.country) setCountry(d.country);
      })
      .catch(() => {});
  }, [country]);

  return country;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars({ count = 5 }) {
  return <span style={{ color: "#f9a825", letterSpacing: "2px", fontSize: "0.85rem" }}>{"★".repeat(count)}</span>;
}

function GiftCard({ gift, onClick }) {
  return (
    <button
      onClick={() => onClick(gift.path)}
      style={{
        flexShrink: 0, width: "200px",
        background: gift.color,
        border: `1.5px solid ${gift.accent}22`,
        borderRadius: "1.5rem", padding: "1.25rem 1rem",
        textAlign: "left", cursor: "pointer",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        position: "relative", outline: "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${gift.accent}33`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {gift.tag && (
        <span style={{
          position: "absolute", top: "10px", right: "10px",
          background: "linear-gradient(135deg, #e91e63, #f48fb1)",
          color: "#fff", fontSize: "0.6rem", fontWeight: 800,
          letterSpacing: "0.1em", padding: "2px 8px", borderRadius: "9999px",
        }}>{gift.tag}</span>
      )}
      <div style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>{gift.icon}</div>
      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#3d3028", marginBottom: "0.35rem", fontFamily: "'Montserrat', sans-serif" }}>{gift.title}</div>
      <div style={{ fontSize: "0.75rem", color: "#705f58", lineHeight: 1.5 }}>{gift.desc}</div>
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", fontWeight: 700, color: gift.accent, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Make it free
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomeClient() {
  const router = useRouter();
  const { t } = useTranslation();

  const country = useCountry();
  const isIndia = country === "IN";
  const isPH = country === "PH";

  // Locale-aware data: Philippines, India, or Global
  const GIFTS      = useMemo(() => isIndia ? ALL_GIFTS : ALL_GIFTS.filter(g => !g.indiaOnly), [isIndia]);
  const TESTIMONIALS = useMemo(() => isPH ? TESTIMONIALS_PH : isIndia ? TESTIMONIALS_IN : TESTIMONIALS_GLOBAL, [isIndia, isPH]);
  const TICKER_ITEMS = useMemo(() => isPH ? TICKER_PH : isIndia ? TICKER_IN : TICKER_GLOBAL, [isIndia, isPH]);
  const FEATURES   = useMemo(() => isPH ? FEATURES_PH : isIndia ? FEATURES_IN : FEATURES_GLOBAL, [isIndia, isPH]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [load3D, setLoad3D] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  const statsRef = useRef(null);
  const statsVisible = useIntersectionOnce(statsRef);
  const bouquetCount = useCountUp(12847, 1800, statsVisible);
  const happyCount = useCountUp(98, 1200, statsVisible);
  const secondsCount = useCountUp(60, 900, statsVisible);

  const featuredPosts = useMemo(() => blogPosts.slice(0, 3), []);

  // Automatically redirect Philippine visitors to dedicated /ph landing page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("global") === "1" || params.get("no_redirect") === "1") return;

    if (isPH) {
      router.replace("/ph");
    }
  }, [isPH, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setLoad3D(true), { timeout: 1000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setLoad3D(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => { setActiveIdx(v => (v + 1) % TESTIMONIALS.length); setIsSliding(false); }, 220);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => { setTickerIdx(v => (v + 1) % TICKER_ITEMS.length); setTickerVisible(true); }, 350);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleGiftClick = useCallback((path) => router.push(path), [router]);

  // If Philippines is detected, immediately show clean loading while redirecting to /ph
  if (isPH && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("global") !== "1" && params.get("no_redirect") !== "1") {
      return (
        <div
          suppressHydrationWarning
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(160deg, #fdf6f0 0%, #f8edf0 55%, #fdf0f5 100%)",
            color: "#7b5455",
            fontFamily: "'Manrope', sans-serif",
            fontSize: "0.9rem",
          }}
        >
          Loading…
        </div>
      );
    }
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh", overflowX: "hidden", background: "linear-gradient(160deg, #fdf6f0 0%, #f8edf0 50%, #fdf0f5 100%)", fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Montserrat:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .hw-glass {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 8px 40px rgba(200,130,140,0.12);
        }

        @keyframes petalDrift {
          0%   { transform: translateY(0px) rotate(0deg) scale(1); }
          33%  { transform: translateY(-18px) rotate(12deg) scale(1.04); }
          66%  { transform: translateY(-8px) rotate(-8deg) scale(0.97); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerText {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulseSoft {
          0%, 100% { box-shadow: 0 0 0 0 rgba(166,93,93,0.3); }
          50%       { box-shadow: 0 0 0 10px rgba(166,93,93,0); }
        }

        .hw-shimmer {
          background: linear-gradient(90deg, #7c4343 0%, #c8637a 25%, #d4956a 50%, #c8637a 75%, #7c4343 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 5s linear infinite;
        }
        .hw-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
          color: #fff; font-family: 'Montserrat', sans-serif;
          font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          border: none; border-radius: 9999px;
          padding: 0 2.2rem; min-height: 56px; cursor: pointer;
          box-shadow: 0 14px 34px rgba(124,63,79,0.30);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: pulseSoft 2.5s infinite;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .hw-cta:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(124,63,79,0.38); }
        .hw-cta:active { transform: scale(0.98); }

        .hw-cta-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: rgba(255,255,255,0.7); color: #7c4343;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.85rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          border: 1.5px solid rgba(124,67,67,0.25); border-radius: 9999px;
          padding: 0 1.8rem; min-height: 52px; cursor: pointer;
          transition: all 0.2s ease; text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .hw-cta-ghost:hover { border-color: rgba(124,67,67,0.6); background: rgba(255,255,255,0.95); transform: translateY(-2px); }
        .hw-cta-ghost:active { transform: scale(0.98); }

        .petal-deco {
          position: absolute; border-radius: 50% 0 50% 0;
          opacity: 0.4; pointer-events: none;
          animation: petalDrift ease-in-out infinite;
        }
        .hw-scroll-strip {
          display: flex; gap: 0.85rem; overflow-x: auto;
          padding: 0.5rem 1rem 1.25rem;
          scrollbar-width: none; -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
        }
        .hw-scroll-strip::-webkit-scrollbar { display: none; }
        .hw-scroll-strip > * {
          scroll-snap-align: start;
        }

        .hw-marquee-track {
          display: flex; gap: 2.5rem;
          animation: marqueeScroll 22s linear infinite;
          white-space: nowrap;
        }
        .hw-step-card {
          flex: 1; min-width: 180px; text-align: center;
          padding: 2rem 1.25rem; border-radius: 1.75rem;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.75);
          transition: transform 0.2s ease;
        }
        .hw-step-card:hover { transform: translateY(-3px); }

        /* Responsive Mobile Styles */
        @media (max-width: 640px) {
          .hw-header {
            padding: 0.75rem 1rem !important;
          }
          .hw-logo-img {
            height: 38px !important;
          }
          .hw-hero-section {
            padding: 1.25rem 1rem 0 !important;
          }
          .hw-hero-eyebrow {
            padding: 0.35rem 0.9rem !important;
            font-size: 0.65rem !important;
            margin-bottom: 1rem !important;
          }
          .hw-hero-headline { 
            font-size: 2.45rem !important; 
            line-height: 1.15 !important;
            margin-bottom: 1rem !important;
          }
          .hw-hero-sub {
            font-size: 0.92rem !important;
            line-height: 1.6 !important;
            margin-bottom: 1.75rem !important;
            padding: 0 0.25rem !important;
          }
          .hw-cta-group {
            flex-direction: column !important;
            gap: 0.75rem !important;
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto 2rem !important;
          }
          .hw-cta, .hw-cta-ghost {
            width: 100% !important;
            min-height: 50px !important;
            font-size: 0.85rem !important;
          }
          .hw-ticker-wrap {
            padding: 0 1rem !important;
            margin-bottom: 2.5rem !important;
          }
          .hw-stats-grid { 
            gap: 0.5rem !important; 
            padding: 0 0.75rem !important;
            margin-bottom: 3rem !important;
          }
          .hw-stat-card {
            padding: 1rem 0.5rem !important;
            border-radius: 1.2rem !important;
            flex: 1 1 30% !important;
            min-width: 90px !important;
          }
          .hw-stat-num {
            font-size: 1.75rem !important;
          }
          .hw-stat-label {
            font-size: 0.62rem !important;
          }
          .hw-section-title {
            font-size: 2rem !important;
          }
          .hw-steps { 
            flex-direction: column !important; 
            gap: 0.85rem !important; 
          }
          .hw-step-card {
            padding: 1.35rem 1rem !important;
            border-radius: 1.35rem !important;
          }
          .hw-step-arrow-h {
            display: none !important;
          }
          .hw-step-arrow-v {
            display: block !important;
            font-size: 1.25rem !important;
            color: #e48d9c !important;
            opacity: 0.6 !important;
            margin-top: 0.5rem !important;
          }
          .hw-grid-twocol {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
            padding: 0 1rem !important;
            margin-bottom: 3rem !important;
          }
          .hw-testimonial-card, .hw-blog-card {
            padding: 1.5rem 1.25rem !important;
            border-radius: 1.5rem !important;
          }
          .hw-testimonial-quote {
            font-size: 1.15rem !important;
            line-height: 1.5 !important;
          }
          .hw-banner-card {
            padding: 2.5rem 1.25rem !important;
            border-radius: 1.75rem !important;
          }
          .hw-banner-heading {
            font-size: 2rem !important;
            line-height: 1.2 !important;
          }
          .hw-banner-btn {
            width: 100% !important;
            max-width: 280px !important;
          }
        }

        @media (min-width: 641px) {
          .hw-step-arrow-v {
            display: none !important;
          }
        }
      `}</style>

      {/* 3D Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        {load3D && <HomeScene />}
      </div>

      {/* CSS Petal Decorations */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
        {[
          { w: 90, h: 55, top: "8%",  left: "3%",   color: "#f48fb1", dur: "7s",  delay: "0s"   },
          { w: 60, h: 38, top: "20%", left: "92%",  color: "#ffcc80", dur: "9s",  delay: "1.5s" },
          { w: 75, h: 45, top: "70%", left: "5%",   color: "#f8bbd0", dur: "8s",  delay: "3s"   },
          { w: 50, h: 30, top: "80%", left: "88%",  color: "#ce93d8", dur: "10s", delay: "0.8s" },
          { w: 40, h: 25, top: "45%", left: "96%",  color: "#ef9a9a", dur: "6s",  delay: "2s"   },
          { w: 65, h: 40, top: "60%", left: "-2%",  color: "#ffe082", dur: "11s", delay: "4s"   },
        ].map((p, i) => (
          <div key={i} className="petal-deco" style={{
            width: p.w, height: p.h, top: p.top, left: p.left,
            background: `radial-gradient(ellipse at 30% 30%, ${p.color}cc, ${p.color}55)`,
            animationDuration: p.dur, animationDelay: p.delay,
          }} />
        ))}
      </div>

      {/* UI Layer */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: "5rem" }}>

        {/* Header */}
        <header className="hw-header" style={{ 
          width: "100%", 
          maxWidth: "1160px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "1rem 1.5rem",
          zIndex: 20
        }}>
          <Link 
            href="/" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              textDecoration: "none",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.opacity = "1";
            }}
          >
            <img 
              src="/logo-transparent.png" 
              alt="Petals and Words" 
              className="hw-logo-img"
              style={{ 
                height: "44px", 
                width: "auto", 
                objectFit: "contain",
                display: "block",
                userSelect: "none"
              }} 
            />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link 
              href="/blog" 
              style={{ 
                color: "#7c4343", 
                fontWeight: 600, 
                fontSize: "0.78rem", 
                letterSpacing: "0.06em", 
                textTransform: "uppercase", 
                textDecoration: "none", 
                padding: "0.45rem 0.9rem",
                borderRadius: "9999px",
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(228, 141, 156, 0.3)",
                boxShadow: "0 2px 10px rgba(124, 67, 67, 0.06)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 67, 67, 0.12)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.75)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(124, 67, 67, 0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {t("common.blog", "Blog")}
            </Link>
            <div style={{
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(12px)",
              borderRadius: "9999px",
              border: "1px solid rgba(228, 141, 156, 0.3)",
              boxShadow: "0 2px 10px rgba(124, 67, 67, 0.06)",
              padding: "0.15rem 0.35rem"
            }}>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="hw-hero-section" style={{ width: "100%", maxWidth: "900px", padding: "2rem 1.5rem 0", animation: "floatUp 0.8s ease both" }}>
          {/* Eyebrow */}
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
            <span className="hw-hero-eyebrow" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.7)", border: "1px solid rgba(228,141,156,0.3)",
              borderRadius: "9999px", padding: "0.45rem 1.2rem",
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#a65d5d", backdropFilter: "blur(12px)",
            }}>
              <span style={{ fontSize: "1rem" }}>🌸</span>
              Made for meaningful moments
            </span>
          </div>

          {/* Headline */}
          <h1 className="hw-hero-headline" style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "4.2rem", fontWeight: 500, lineHeight: 1.1,
            color: "#3d3028", textAlign: "center", margin: "0 auto 1.5rem", maxWidth: "780px",
          }}>
            {isPH
              ? <>{"Padalhan ng pagmamahal ang iyong"}<br />{"mga "}<em className="hw-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>{"mahal sa buhay."}</em></>
              : <>Someone out there is<br />waiting for a message{" "}<em className="hw-shimmer" style={{ fontStyle: "italic", fontWeight: 600 }}>from you.</em></>
            }
          </h1>

          {/* Sub-headline */}
          <p className="hw-hero-sub" style={{ textAlign: "center", maxWidth: "520px", margin: "0 auto 2.25rem", fontSize: "1.05rem", color: "#5c4a40", lineHeight: 1.75, fontWeight: 400 }}>
            {isPH
              ? "Valentine's, Monthsary, Pasko, Mother's Day — o basta gusto mong mag-surprise. Free, tapos sa 60 seconds."
              : "Birthdays, rainy Tuesdays, anniversaries, Father's Day — or just because you thought of them. Free digital gifts, ready in 60 seconds."
            }
          </p>

          {/* CTAs */}
          <div className="hw-cta-group" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
            <Link href="/create" className="hw-cta">{isPH ? "💐 Gumawa ng Bouquet" : "💐 Make a Bouquet"}</Link>
            <button className="hw-cta-ghost" onClick={() => document.getElementById("hw-gift-strip")?.scrollIntoView({ behavior: "smooth" })}>
              {isPH ? "Lahat ng gifts ↓" : "See all gifts ↓"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#a65d5d", opacity: 0.75, marginBottom: "2.5rem" }}>
            {isPH ? "Walang login · Walang bayad · Libre forever" : "No login · No credit card · Free forever"}
          </p>

          {/* Interactive Live Bouquet Preview Showcase */}
          <div 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              margin: "0 auto 3.5rem", 
              maxWidth: "360px", 
              width: "100%",
            }}
          >
            <Link 
              href="/create" 
              style={{ 
                textDecoration: "none", 
                display: "block", 
                width: "100%",
                borderRadius: "2rem",
                padding: "0.55rem",
                background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,244,246,0.85) 100%)",
                border: "1.5px solid rgba(228, 141, 156, 0.45)",
                boxShadow: "0 24px 60px rgba(166, 93, 93, 0.18), 0 4px 16px rgba(0,0,0,0.04)",
                transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
                e.currentTarget.style.boxShadow = "0 30px 70px rgba(166, 93, 93, 0.25), 0 8px 24px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 24px 60px rgba(166, 93, 93, 0.18), 0 4px 16px rgba(0,0,0,0.04)";
              }}
            >
              <div style={{ position: "relative", overflow: "hidden", borderRadius: "1.6rem" }}>
                <img
                  src="/landing-bouquet-preview.png"
                  alt="Interactive digital flower bouquet with personal voice note and love letter"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: "1.6rem",
                  }}
                />
              </div>

              {/* Floating CTA Pill below image */}
              <div style={{
                marginTop: "0.65rem",
                padding: "0.55rem 0.9rem",
                background: "rgba(255,255,255,0.92)",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                border: "1px solid rgba(228, 141, 156, 0.35)",
                boxShadow: "0 2px 10px rgba(124, 67, 67, 0.06)"
              }}>
                <span style={{ fontSize: "0.85rem" }}>✨</span>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#7c3f4f",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase"
                }}>
                  {isPH ? "I-tap para gumawa ng bouquet mo →" : "Tap to make your bouquet →"}
                </span>
              </div>
            </Link>
          </div>
        </main>

        {/* Live Ticker */}
        <div className="hw-ticker-wrap" style={{ width: "100%", maxWidth: "600px", margin: "0 auto 3rem", padding: "0 1.5rem" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(228,141,156,0.35)", borderRadius: "9999px", padding: "0.6rem 1.25rem",
            boxShadow: "0 4px 20px rgba(124, 67, 67, 0.08)",
            overflow: "hidden"
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#43a047", boxShadow: "0 0 0 3px rgba(67,160,71,0.25)", flexShrink: 0 }} />
            <span style={{
              fontSize: "0.8rem", color: "#3d3028", fontWeight: 600,
              opacity: tickerVisible ? 1 : 0,
              transform: tickerVisible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {TICKER_ITEMS[tickerIdx]}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="hw-stats-grid" style={{
          display: "flex", gap: "1.25rem", flexWrap: "wrap", justifyContent: "center",
          margin: "0 auto 4rem", padding: "0 1.5rem", maxWidth: "700px", width: "100%"
        }}>
          {[
            { num: bouquetCount.toLocaleString() + "+", label: "moments sent", icon: "💐" },
            { num: happyCount + "%", label: "would send again", icon: "❤️" },
            { num: secondsCount + "s", label: "to make one", icon: "⚡" },
          ].map(stat => (
            <div key={stat.label} className="hw-stat-card" style={{
              textAlign: "center", flex: "1 1 140px",
              background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.8)", borderRadius: "1.5rem",
              padding: "1.5rem 1rem", boxShadow: "0 4px 24px rgba(200,130,140,0.1)",
            }}>
              <div style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
              <div className="hw-stat-num" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.4rem", fontWeight: 600, color: "#7c3f4f", lineHeight: 1, marginBottom: "0.35rem" }}>{stat.num}</div>
              <div className="hw-stat-label" style={{ fontSize: "0.72rem", color: "#a65d5d", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Gift Strip */}
        <section id="hw-gift-strip" style={{ width: "100%", maxWidth: "1100px", padding: "0 1rem", marginBottom: "4rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a65d5d", fontWeight: 700, marginBottom: "0.5rem" }}>Pick your gift</p>
            <h2 className="hw-section-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.6rem", fontWeight: 500, color: "#3d3028", margin: 0 }}>Six ways to make someone's day</h2>
          </div>
          <div className="hw-scroll-strip">
            {GIFTS.map(gift => <GiftCard key={gift.path} gift={gift} onClick={handleGiftClick} />)}
          </div>
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#a65d5d", opacity: 0.65, marginTop: "0.5rem" }}>← swipe to see all →</p>
        </section>

        {/* Marquee Trust Strip */}
        <div style={{
          width: "100%", overflow: "hidden",
          borderTop: "1px solid rgba(228,141,156,0.2)", borderBottom: "1px solid rgba(228,141,156,0.2)",
          background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
          padding: "0.85rem 0", marginBottom: "4rem",
        }}>
          <div style={{ display: "flex", overflow: "hidden" }}>
            <div className="hw-marquee-track">
              {[...FEATURES, ...FEATURES].map((f, i) => (
                <span key={i} style={{ fontSize: "0.76rem", fontWeight: 600, color: "#7c4343", letterSpacing: "0.06em" }}>
                  {f}<span style={{ marginLeft: "2.5rem", color: "#e48d9c", opacity: 0.5 }}>·</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <section style={{ width: "100%", maxWidth: "900px", padding: "0 1rem", marginBottom: "4rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
            <p style={{ fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a65d5d", fontWeight: 700, marginBottom: "0.5rem" }}>Simple as sending a text</p>
            <h2 className="hw-section-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.6rem", fontWeight: 500, color: "#3d3028", margin: 0 }}>How it works</h2>
          </div>
          <div className="hw-steps" style={{ display: "flex", gap: "1.25rem" }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className="hw-step-card">
                <div style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>{s.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.75rem", fontWeight: 700, color: "#e48d9c", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Step {s.step}</div>
                <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#3d3028", margin: "0 0 0.4rem" }}>{s.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "#705f58", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <>
                    <div className="hw-step-arrow-h" style={{ fontSize: "1.4rem", color: "#e48d9c", opacity: 0.4, marginTop: "0.75rem" }}>→</div>
                    <div className="hw-step-arrow-v">↓</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials + Blog */}
        <div className="hw-grid-twocol" style={{
          width: "100%", maxWidth: "1000px",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem", padding: "0 1.25rem", marginBottom: "4rem",
        }}>
          {/* Testimonials */}
          <div className="hw-glass hw-testimonial-card" style={{ borderRadius: "2rem", padding: "2.25rem" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a65d5d", fontWeight: 700, margin: "0 0 1.25rem" }}>
              {t("home.testimonials", "What people say")}
            </p>
            <div style={{ opacity: isSliding ? 0 : 1, transform: isSliding ? "translateX(-10px)" : "translateX(0)", transition: "opacity 0.22s ease, transform 0.22s ease", minHeight: "140px" }}>
              <Stars count={TESTIMONIALS[activeIdx].stars} />
              <p className="hw-testimonial-quote" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontStyle: "italic", color: "#3d3028", lineHeight: 1.6, margin: "0.75rem 0 1.25rem" }}>
                "{TESTIMONIALS[activeIdx].quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #fbc4ab, #f48fb1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#7c4343", fontSize: "0.95rem" }}>
                  {TESTIMONIALS[activeIdx].author[0]}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#3d3028", margin: 0 }}>{TESTIMONIALS[activeIdx].author}</p>
                  <p style={{ fontSize: "0.75rem", color: "#a65d5d", margin: 0 }}>{TESTIMONIALS[activeIdx].city}</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "1.5rem" }}>
              {TESTIMONIALS.map((_, i) => (
                <div key={i} onClick={() => setActiveIdx(i)} style={{ height: 6, borderRadius: "9999px", cursor: "pointer", transition: "all 0.3s ease", width: i === activeIdx ? 28 : 6, background: i === activeIdx ? "#7c4343" : "rgba(228,141,156,0.4)" }} />
              ))}
            </div>
          </div>

          {/* Blog */}
          <div className="hw-glass hw-blog-card" style={{ borderRadius: "2rem", padding: "2.25rem" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a65d5d", fontWeight: 700, margin: "0 0 1.25rem" }}>
              {t("home.fromBlog", "From the blog")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {featuredPosts.map((post, i) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, flexShrink: 0, marginTop: "2px", borderRadius: "50%", background: "linear-gradient(135deg, #fbc4ab, #e48d9c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#7c4343" }}>{i + 1}</div>
                    <div>
                      <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#3d3028", margin: "0 0 0.3rem", transition: "color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#7c4343"}
                        onMouseLeave={e => e.currentTarget.style.color = "#3d3028"}
                      >{post.title}</h4>
                      <p style={{ fontSize: "0.75rem", color: "#705f58", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(228,141,156,0.2)" }}>
              <Link href="/blog" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a65d5d", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                View all articles
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA Banner */}
        <section style={{ width: "100%", maxWidth: "860px", padding: "0 1rem", marginBottom: "3rem" }}>
          <div className="hw-banner-card" style={{
            borderRadius: "2.5rem",
            background: "linear-gradient(135deg, #a65d5d 0%, #7c3f4f 60%, #5c3344 100%)",
            padding: "3.5rem 2.5rem", textAlign: "center", position: "relative", overflow: "hidden",
            boxShadow: "0 24px 60px rgba(92,51,68,0.35)",
          }}>
            <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)", top: -60, right: -40, pointerEvents: "none" }} />
            <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)", bottom: -40, left: -20, pointerEvents: "none" }} />
            <p style={{ fontSize: "1.75rem", margin: "0 0 0.75rem" }}>🌸</p>
            <h2 className="hw-banner-heading" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", fontWeight: 500, color: "#fff", margin: "0 0 1rem", lineHeight: 1.15 }}>
              Don't wait for a reason.<br /><em>Make someone's day today.</em>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", margin: "0 auto 2rem", maxWidth: "420px", lineHeight: 1.7 }}>
              Free, takes 60 seconds, works on WhatsApp. No account needed.
            </p>
            <Link href="/create" className="hw-banner-btn" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
              background: "#fff", color: "#7c3f4f",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.9rem", fontWeight: 800,
              letterSpacing: "0.08em", textTransform: "uppercase",
              border: "none", borderRadius: "9999px",
              padding: "0 2.5rem", minHeight: "56px",
              textDecoration: "none",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)"; }}
            >
              💐 Start for free
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
