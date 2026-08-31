/**
 * Petals & Words — Shared Design System
 * "Kawaii Bloom" aesthetic: soft pastels, bouncy animations, cute typography,
 * warm gradients. Philippines-first localization layer included.
 *
 * Usage:
 *   import { CUTE_CSS, getCountryLayer, PETAL_DECOS } from '../lib/designSystem';
 */

// ─── Brand tokens ─────────────────────────────────────────────────────────────

export const COLORS = {
  // Warm cream base (matches landing page)
  base: "#fdf6f0",
  baseMid: "#f8edf0",
  baseEnd: "#fdf0f5",
  // Warm whites / surfaces
  white: "#ffffff",
  surface: "#fbf9f5",
  surfaceAlt: "#f5f3ef",
  // Primary brand rose
  primary: "#a65d5d",
  primaryDark: "#7c3f4f",
  primaryLight: "#ffd9d8",
  primaryLighter: "#fff5f4",
  // Accent gold
  accent: "#c8637a",
  accentWarm: "#d4956a",
  // Text
  text: "#3E2723",
  textSub: "#6b5e5f",
  textMuted: "#9e8f90",
  textLabel: "#7b5455",
  // Borders
  border: "rgba(97,75,61,0.08)",
  borderRose: "#ffd9d8",
};

// ─── Geo Localization Data ─────────────────────────────────────────────────────

export const GEO_PH = {
  tickerItems: [
    "💐 Maria just sent a bouquet to her Mama · 2m ago",
    "🎂 Juan baked a birthday cake for Ana · 5m ago",
    "💌 Jasmine sent a love letter to Carlo · 8m ago",
    "🤗 Bea sent a virtual hug to her Ate · 12m ago",
    "💐 Ria made a bouquet for Monthsary · 15m ago",
    "🎂 Diego baked a Pasko cake for Lola · 18m ago",
    "💐 Clara sent flowers to her best friend in Cebu · 21m ago",
    "🎂 Kuya made a cake for his baby sister · 25m ago",
  ],
  testimonials: [
    { quote: "Nagpadala ako ng bouquet sa aking Mama — niyakap niya ang screen niya! 😭 So worth it.", author: "Maria C.", city: "Quezon City", stars: 5 },
    { quote: "My boyfriend is in Dubai. This made our Monthsary feel so real. He cried!", author: "Ria S.", city: "Cebu City", stars: 5 },
    { quote: "Perfect for pasalubong without the expense! Sent it on Valentine's — she screenshotted it right away.", author: "Carlo D.", city: "Makati", stars: 5 },
    { quote: "Ang cute ng animations! Ginamit ko for Pasko para sa Lola ko sa Davao. She loved it!", author: "Bea M.", city: "Davao City", stars: 5 },
    { quote: "Ready in under 1 minute and free. No reason NOT to send your loved ones a surprise 🌸", author: "Ana T.", city: "Pasig", stars: 5 },
  ],
  features: [
    "🌸 Sobrang cute na bouquet layouts",
    "🎨 Customize ng colors at themes",
    "💬 May personal note included",
    "📲 Share via Messenger or Viber",
    "🚀 Tapos sa 60 seconds",
    "🔒 No signup needed",
    "🇵🇭 Gawa para sa mga Pilipino",
    "💸 100% libre forever",
  ],
  heroHeadline: "Send love to your loved ones",
  heroSub: "Build a beautiful digital bouquet, add a heartfelt note, and share instantly — perfect for Monthsary, Pasko, Valentine's, and everyday moments.",
  noteSuggestions: [
    "Mahal kita, always and forever. 💕",
    "Thinking of you today, sana nandito ka na.",
    "Happy Monthsary! Thank you for choosing me every day. 🌸",
    "Maligayang Pasko! Ikaw ang pinaka-espesyal sa lahat.",
    "Missing you so much. This bouquet is a little hug from me. 🤗",
    "Ate/Kuya, thank you for everything you do for our family. 💐",
  ],
  paymentCopy: {
    headline: "Your bouquet is beautiful!",
    sub: "One small payment unlocks your permanent share link — ready to send via Messenger, Viber, or WhatsApp.",
    paymentNote: "Secure checkout · GCash & Maya accepted via Razorpay · No recurring charges",
    trustPills: ["💚 GCash / Maya OK", "⚡ Link agad", "🚫 No subscription"],
  },
  occasions: [
    { emoji: "💕", label: "Monthsary", desc: "Para sa iyong mahal" },
    { emoji: "🎄", label: "Pasko", desc: "Maligayang Pasko!" },
    { emoji: "❤️", label: "Valentine's", desc: "I love you lodi" },
    { emoji: "💐", label: "Mother's Day", desc: "Para kay Mama" },
    { emoji: "🎂", label: "Birthday", desc: "Happy birthday sa'yo!" },
    { emoji: "🤗", label: "Miss You", desc: "Sana nandito ka" },
  ],
};

export const GEO_GLOBAL = {
  tickerItems: [
    "💐 Sarah just sent a bouquet to her mom · 2m ago",
    "🎂 James baked a birthday cake for Emma · 5m ago",
    "💌 Lily sent a greeting card to her best friend · 8m ago",
    "🧸 Marco gifted a plushie to his partner · 12m ago",
    "🤗 Sofia sent a virtual hug to her sister · 15m ago",
    "💐 Alex made a bouquet for Mother's Day · 18m ago",
    "🎂 Olivia baked a cake for her dad's birthday · 22m ago",
    "💌 Noah sent a card to surprise his girlfriend · 26m ago",
  ],
  testimonials: [
    { quote: "I sent this in 2 minutes and it felt so personal, not generic at all.", author: "Sarah K.", city: "New York", stars: 5 },
    { quote: "Sent this to my dad on Father's Day — he called me right after. First time in years.", author: "James L.", city: "London", stars: 5 },
    { quote: "It was raining and I just wanted to say I was thinking of her. This was perfect.", author: "Emma R.", city: "Toronto", stars: 5 },
    { quote: "The flowers looked so premium on mobile. She cried happy tears 😭", author: "Lily T.", city: "Sydney", stars: 5 },
    { quote: "Got the share link in seconds. Sent it on WhatsApp and she loved it instantly.", author: "Sofia M.", city: "Amsterdam", stars: 5 },
  ],
  features: [
    "🌸 Real bouquet layouts",
    "🎨 Custom colors & themes",
    "💬 Personal note included",
    "📲 WhatsApp-ready link",
    "🚀 Ready in 60 seconds",
    "🔒 No signup needed",
    "🌍 Works worldwide",
    "💸 100% Free forever",
  ],
  heroHeadline: "Send flowers that feel real",
  heroSub: "Build a beautiful digital bouquet, write a heartfelt note, and share the love in under a minute.",
  noteSuggestions: [
    "Thinking of you today and every day. 💕",
    "You mean the world to me. Thank you for being you.",
    "Just a little reminder that you are so loved 🌸",
    "Happy birthday! May your day be as beautiful as you are.",
    "Wishing you nothing but the best, always.",
    "This is for you — because you deserve all the flowers in the world 💐",
  ],
  paymentCopy: {
    headline: "Your bouquet is beautiful!",
    sub: "A small contribution keeps this platform free for everyone and unlocks your permanent share link.",
    paymentNote: "Secure checkout via Razorpay · International cards accepted · No recurring charges",
    trustPills: ["🔒 One-time only", "⚡ Link ready instantly", "📵 No subscription"],
  },
};

export const GEO_IN = {
  tickerItems: [
    "💐 Aditi just sent a bouquet to her mom · 2m ago",
    "🎂 Rohan baked a birthday cake for Riya · 5m ago",
    "💌 Sneha sent a greeting card to her bestie · 8m ago",
    "🧸 Karan gifted a plushie to his girlfriend · 12m ago",
    "✉️ Amit sent a Shagun envelope for Pooja's wedding · 15m ago",
    "🤗 Priya sent a virtual hug to her sister · 18m ago",
    "💐 Dev made a bouquet for Teacher's Day · 21m ago",
    "🎂 Neha baked a cake for her dad's birthday · 25m ago",
  ],
  testimonials: [
    { quote: "I sent this in 2 minutes and it felt so personal, not generic at all.", author: "Aditi S.", city: "Mumbai", stars: 5 },
    { quote: "Sent this to my dad on Father's Day — he called me right after. First time in years.", author: "Rahul G.", city: "Bengaluru", stars: 5 },
    { quote: "It was raining and I just wanted to say I was thinking of her. This was perfect.", author: "Sneha P.", city: "Pune", stars: 5 },
    { quote: "The flowers looked so premium on mobile. She cried happy tears 😭", author: "Priya M.", city: "Hyderabad", stars: 5 },
    { quote: "Got the share link in seconds. Sent it on WhatsApp and she loved it instantly.", author: "Neha K.", city: "Delhi", stars: 5 },
  ],
  features: [
    "🌸 Real bouquet layouts", "🎨 Custom colors & themes", "💬 Personal note included",
    "📲 WhatsApp-ready link", "🚀 Ready in 60 seconds", "🔒 No signup needed",
    "❤️ Made with love in India", "💸 100% Free forever",
  ],
  heroHeadline: "Send flowers from your heart",
  heroSub: "Build a beautiful digital bouquet, write a heartfelt note, and share it via WhatsApp in seconds. Free, forever.",
  noteSuggestions: [
    "Thinking of you today and always. 💕",
    "You are the reason I smile every single day.",
    "Just a little reminder that you are so loved 🌸",
    "Happy Birthday! May your day be as bright as you are.",
    "Sending you all my love from afar.",
    "This bouquet is for you — because you deserve all the flowers 💐",
  ],
  paymentCopy: {
    headline: "Your bouquet is beautiful!",
    sub: "A small contribution keeps this platform free for everyone and unlocks your permanent share link.",
    paymentNote: "Secure checkout via Razorpay · UPI, Cards & Wallets accepted · No recurring charges",
    trustPills: ["🔒 One-time only", "⚡ Link ready instantly", "📵 No subscription"],
  },
};

/**
 * Returns geo layer based on country code.
 * @param {string|null} country - ISO 3166-1 alpha-2 code from geo API
 */
export function getGeoLayer(country) {
  if (country === "PH") return GEO_PH;
  if (country === "IN") return GEO_IN;
  return GEO_GLOBAL;
}

// ─── Shared CSS string ────────────────────────────────────────────────────────

export const CUTE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  /* ── Base root ── */
  .pw-root {
    font-family: 'Manrope', sans-serif;
    min-height: 100vh;
    background: linear-gradient(160deg, #fdf6f0 0%, #f8edf0 55%, #fdf0f5 100%);
    color: #3E2723;
    overflow-x: hidden;
  }

  /* ── Glassmorphism header ── */
  .pw-header {
    position: sticky; top: 0; z-index: 40;
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    background: rgba(253,246,240,0.88);
    border-bottom: 1px solid rgba(200,130,140,0.10);
    box-shadow: 0 2px 20px rgba(200,100,120,0.06);
  }
  .pw-header-inner {
    max-width: 680px; margin: 0 auto;
    padding: 0.75rem 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ── Floating petal decoration (CSS only, no JS) ── */
  @keyframes pw-petal-drift {
    0%   { transform: translateY(0) rotate(0deg) scale(1); }
    33%  { transform: translateY(-16px) rotate(10deg) scale(1.04); }
    66%  { transform: translateY(-6px) rotate(-7deg) scale(0.97); }
    100% { transform: translateY(0) rotate(0deg) scale(1); }
  }
  .pw-petal {
    position: fixed; border-radius: 50% 0 50% 0;
    pointer-events: none; opacity: 0.35;
    animation: pw-petal-drift ease-in-out infinite;
  }

  /* ── Shimmer CTA button (matches landing page) ── */
  @keyframes pw-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(166,93,93,0.3); }
    50%       { box-shadow: 0 0 0 10px rgba(166,93,93,0); }
  }
  @keyframes pw-shimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  .pw-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    background: linear-gradient(135deg, #a65d5d 0%, #7c3f4f 100%);
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    border: none; border-radius: 9999px;
    padding: 0 2rem; min-height: 54px;
    cursor: pointer;
    box-shadow: 0 14px 34px rgba(124,63,79,0.30);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    animation: pw-pulse 2.5s infinite;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }
  .pw-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(124,63,79,0.38); }
  .pw-btn-primary:active { transform: scale(0.98); }
  .pw-btn-primary:disabled { background: #e4e2de; color: #9e8f90; cursor: not-allowed; box-shadow: none; animation: none; transform: none; }

  /* ── Ghost button ── */
  .pw-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    background: rgba(255,255,255,0.7); color: #7c4343;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.82rem; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    border: 1.5px solid rgba(124,67,67,0.22); border-radius: 9999px;
    padding: 0 1.6rem; min-height: 48px; cursor: pointer;
    transition: all 0.2s ease; text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }
  .pw-btn-ghost:hover { border-color: rgba(124,67,67,0.55); background: rgba(255,255,255,0.95); transform: translateY(-2px); }
  .pw-btn-ghost:active { transform: scale(0.98); }

  /* ── Glass card ── */
  .pw-card {
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(200,130,140,0.10), 0 2px 8px rgba(200,100,100,0.06);
    overflow: hidden;
  }
  .pw-card-solid {
    background: #ffffff;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(27,28,26,0.06), 0 2px 6px rgba(27,28,26,0.04);
    overflow: hidden;
  }

  /* ── Cute section label ── */
  .pw-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem; font-weight: 800;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #a65d5d;
    display: block;
  }

  /* ── Cute section heading ── */
  .pw-heading {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    color: #3E2723;
    line-height: 1.2;
  }

  /* ── Testimonial card ── */
  .pw-testimonial {
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 1.5rem;
    padding: 1.5rem;
    box-shadow: 0 6px 20px rgba(200,100,120,0.08);
  }

  /* ── Trust pill ── */
  .pw-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.05em;
    color: #7b5455;
    background: rgba(255,245,244,0.9);
    border: 1px solid #ffd9d8;
    border-radius: 9999px; padding: 0.3rem 0.8rem;
  }

  /* ── Cute bouncy fade-in ── */
  @keyframes pw-bounce-in {
    0%   { opacity: 0; transform: translateY(18px) scale(0.97); }
    70%  { transform: translateY(-4px) scale(1.01); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .pw-reveal { animation: pw-bounce-in 0.55s cubic-bezier(0.34,1.3,0.64,1) forwards; opacity: 0; }
  .pw-d1 { animation-delay: 0.05s; }
  .pw-d2 { animation-delay: 0.15s; }
  .pw-d3 { animation-delay: 0.25s; }
  .pw-d4 { animation-delay: 0.35s; }
  .pw-d5 { animation-delay: 0.45s; }

  /* ── Share / action buttons ── */
  .pw-share-btn {
    flex: 1; border-radius: 0.875rem; padding: 0.75rem;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.18s;
  }
  .pw-share-btn:active { transform: scale(0.97); }
  .pw-share-btn:hover { transform: translateY(-1px); }

  /* ── Input / Textarea ── */
  .pw-input {
    width: 100%; padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    border: 1.5px solid rgba(200,130,140,0.22);
    font-family: 'Manrope', sans-serif; font-size: 0.9rem; color: #3E2723;
    background: rgba(255,255,255,0.85);
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .pw-input:focus {
    border-color: #a65d5d;
    box-shadow: 0 0 0 3px rgba(166,93,93,0.12);
  }

  .pw-textarea {
    width: 100%; padding: 0.75rem 1rem;
    border-radius: 0.875rem;
    border: 1.5px solid rgba(200,130,140,0.22);
    font-family: 'Manrope', sans-serif; font-size: 0.9rem; color: #3E2723;
    background: rgba(255,255,255,0.85);
    outline: none; resize: vertical; min-height: 110px;
    transition: border-color 0.2s, box-shadow 0.2s;
    line-height: 1.65;
  }
  .pw-textarea:focus {
    border-color: #a65d5d;
    box-shadow: 0 0 0 3px rgba(166,93,93,0.12);
  }

  /* ── Tab bar ── */
  .pw-tab-on  { background: #3E2723; color: #fbf9f5; border-color: #3E2723 !important; }
  .pw-tab-off { color: #6b5e5f; border-color: transparent !important; background: transparent !important; }
  .pw-tab-off:hover { background: rgba(255,255,255,0.6) !important; }

  /* ── Cute note suggestion chip ── */
  .pw-chip {
    text-align: left; padding: 0.65rem 0.9rem;
    border-radius: 0.875rem;
    border: 1.5px solid rgba(200,130,140,0.18);
    background: rgba(255,255,255,0.75);
    font-family: 'Manrope', sans-serif; font-size: 0.82rem;
    color: #7b5455; line-height: 1.55; cursor: pointer;
    transition: all 0.18s;
  }
  .pw-chip:hover { border-color: #a65d5d; background: #fff5f4; transform: translateY(-1px); }
  .pw-chip.active { border-color: #a65d5d; background: #fff5f4; }

  /* ── Floating hearts / petals (recipient view) ── */
  @keyframes pw-float-up {
    0%   { opacity: 0; transform: translateY(0) rotate(0); }
    15%  { opacity: 0.7; }
    85%  { opacity: 0.5; }
    100% { opacity: 0; transform: translateY(-100vh) rotate(25deg) scale(0.7); }
  }
  .pw-float {
    position: fixed; pointer-events: none; z-index: 0;
    animation: pw-float-up linear infinite;
  }

  /* ── Page-level mobile optimization ── */
  @media (max-width: 640px) {
    .pw-header-inner { padding: 0.65rem 1rem; }
    .pw-card, .pw-card-solid { border-radius: 1.25rem; }
    .pw-btn-primary { min-height: 50px; font-size: 0.84rem; }
    .pw-btn-ghost   { min-height: 44px; font-size: 0.78rem; }
  }
`;

// ─── Floating petal decoration data ───────────────────────────────────────────

export const PETAL_DECOS = [
  { w: 90,  h: 55,  top: "7%",   left: "3%",   color: "#f48fb1", dur: "7s",  delay: "0s"   },
  { w: 60,  h: 38,  top: "19%",  left: "92%",  color: "#ffcc80", dur: "9s",  delay: "1.5s" },
  { w: 75,  h: 45,  top: "68%",  left: "5%",   color: "#f8bbd0", dur: "8s",  delay: "3s"   },
  { w: 50,  h: 30,  top: "79%",  left: "88%",  color: "#ce93d8", dur: "10s", delay: "0.8s" },
  { w: 40,  h: 25,  top: "44%",  left: "96%",  color: "#ef9a9a", dur: "6s",  delay: "2s"   },
  { w: 65,  h: 40,  top: "58%",  left: "-2%",  color: "#ffe082", dur: "11s", delay: "4s"   },
];
