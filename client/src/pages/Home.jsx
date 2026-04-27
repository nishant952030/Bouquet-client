import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as THREE from "three";

import { applySeo, seoKeywords } from "../lib/seo";
import { blogPosts } from "../data/blogPosts";
import { flowers } from "../data/flowerCatalog";

/*  ─── DESIGN SYSTEM: Velvet & Vellum ───────────────────────────────────────
    Primary:   #7b5455  /  Container: #ffd9d8  /  Text: #3E2723
    Surface:   #fbf9f5  /  Container-low: #f5f3ef  /  Lowest: #ffffff
    Fonts:     Noto Serif (headlines) + Manrope (body/labels)
    Rule:      No 1px borders — use tonal background shifts for depth
────────────────────────────────────────────────────────────────────────────── */

const VV = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .vv-root {
    font-family: 'Manrope', sans-serif;
    background: #fbf9f5;
    color: #3E2723;
    min-height: 100vh;
  }

  /* Typography */
  .vv-display {
    font-family: 'Noto Serif', serif;
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1.18;
    color: #3E2723;
  }
  .vv-label {
    font-family: 'Manrope', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7b5455;
  }
  .vv-body {
    font-family: 'Manrope', sans-serif;
    line-height: 1.7;
    color: #4f4445;
  }

  /* Surfaces (tonal, no hard borders) */
  .surf      { background: #fbf9f5; }
  .surf-low  { background: #f5f3ef; }
  .surf-high { background: #eae8e4; }
  .surf-white{ background: #ffffff; }

  /* Glassmorphism header */
  .vv-header {
    position: sticky; top: 0; z-index: 40;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(251,249,245,0.82);
    border-bottom: none;
  }

  /* Primary CTA — velvet gradient pill */
  .vv-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #7b5455 0%, #ffd9d8 160%);
    color: #ffffff;
    font-family: 'Manrope', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    border: none; border-radius: 9999px;
    padding: 0 2rem; min-height: 52px;
    cursor: pointer;
    box-shadow: 0 16px 48px rgba(123,84,85,0.22);
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .vv-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 56px rgba(123,84,85,0.30);
    background: linear-gradient(135deg, #613d3e 0%, #ecbaba 160%);
  }
  .vv-btn-primary:active { transform: scale(0.98); }

  /* Ghost secondary pill */
  .vv-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: transparent;
    color: #7b5455;
    font-family: 'Manrope', sans-serif;
    font-size: 0.8rem; font-weight: 600;
    border: 1.5px solid rgba(210,195,196,0.5);
    border-radius: 9999px;
    padding: 0.4rem 1.1rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    text-decoration: none;
  }
  .vv-btn-ghost:hover { background: #ffd9d8; border-color: #7b5455; }

  /* Petal chip (occasion selector) */
  .petal-chip {
    font-family: 'Manrope', sans-serif;
    font-size: 0.78rem; font-weight: 600;
    background: #f5f3ef;
    color: #4f4445;
    border-radius: 9999px;
    padding: 0.45rem 1rem;
    border: none; cursor: pointer;
    transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  }
  .petal-chip:hover, .petal-chip.active {
    background: #ffd9d8;
    color: #7b5455;
    box-shadow: 0 2px 12px rgba(123,84,85,0.14);
  }

  /* Cake CTA */
  .vv-btn-cake {
    position: relative;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #ffffff 0%, #fdf9f1 100%);
    color: #7b5455;
    font-family: 'Manrope', sans-serif;
    font-size: 0.88rem; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase;
    border: 1.5px solid #d2c3c4;
    border-radius: 9999px;
    padding: 0 2rem; min-height: 52px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(123,84,85,0.08);
    transition: all 0.18s ease;
  }
  .vv-btn-cake:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(123,84,85,0.15);
    border-color: #7b5455;
    background: #fff;
  }
  .vv-btn-cake:active { transform: scale(0.98); }
  
  .vv-tag-new {
    position: absolute; top: -12px; right: -5px;
    background: linear-gradient(135deg, #e91e63 0%, #f48fb1 100%);
    color: #ffffff;
    font-family: 'Manrope', sans-serif;
    font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
    padding: 0.25rem 0.6rem; border-radius: 9999px;
    box-shadow: 0 4px 12px rgba(233,30,99,0.3);
    transform: rotate(8deg);
    animation: vvFloat 4s ease-in-out infinite;
  }

  /* Cards — no hard borders, ambient shadow */
  .vv-card {
    background: #ffffff;
    border-radius: 2rem;
    box-shadow: 0 10px 40px rgba(27,28,26,0.06), 0 2px 8px rgba(27,28,26,0.04);
    overflow: hidden;
  }
  .vv-card-low {
    background: #f5f3ef;
    border-radius: 1.5rem;
  }

  /* Step indicator */
  .step-circle {
    width: 2rem; height: 2rem; border-radius: 9999px;
    background: linear-gradient(135deg, #7b5455, #ecbaba);
    color: #fff; font-weight: 700; font-size: 0.8rem;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* Testimonial dot */
  .t-dot { width: 6px; height: 6px; border-radius: 9999px; background: #d2c3c4; transition: all 0.3s; }
  .t-dot.active { width: 1.4rem; background: #7b5455; }

  /* Shimmer badge */
  @keyframes vvShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .vv-shimmer {
    background: linear-gradient(90deg, #7b5455 0%, #ecbaba 40%, #c8a96e 70%, #7b5455 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: vvShimmer 4s linear infinite;
  }

  /* Ambient float for deco elements */
  @keyframes vvFloat {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(-10px) rotate(4deg); }
  }
  .vv-float-1 { animation: vvFloat 5s ease-in-out infinite; }
  .vv-float-2 { animation: vvFloat 7s ease-in-out infinite 1.5s; }
  .vv-float-3 { animation: vvFloat 4.5s ease-in-out infinite 0.8s; }

  /* Fade-in on load */
  @keyframes vvFadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .vv-f1 { animation: vvFadeUp 0.5s ease forwards; }
  .vv-f2 { animation: vvFadeUp 0.5s ease 0.1s forwards; opacity:0; }
  .vv-f3 { animation: vvFadeUp 0.5s ease 0.2s forwards; opacity:0; }
  .vv-f4 { animation: vvFadeUp 0.5s ease 0.3s forwards; opacity:0; }
  .vv-f5 { animation: vvFadeUp 0.5s ease 0.4s forwards; opacity:0; }

  .offer-glow {
    animation: offerPulse 2.4s ease-in-out infinite;
  }
  @keyframes offerPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(123,84,85,0.3); }
    50%      { box-shadow: 0 0 0 8px rgba(123,84,85,0); }
  }

  .slide-exit { opacity:0; transform:translateX(-16px); transition: opacity 0.2s, transform 0.2s; }
  .slide-enter { opacity:1; transform:translateX(0);   transition: opacity 0.2s, transform 0.2s; }
`;

function HeroThreeBloom() {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 2000);
    camera.position.set(0, 0, 540);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xfff0e9, 0.7);
    key.position.set(-120, 140, 220);
    scene.add(key);
    const group = new THREE.Group();
    scene.add(group);
    const textureLoader = new THREE.TextureLoader();
    const assets = flowers.slice(0, 8).map(f => f.src);
    const meshes = [];
    let rafId = null, disposed = false;
    const updateSize = () => {
      if (!canvasRef.current?.parentElement) return;
      const { clientWidth, clientHeight } = canvasRef.current.parentElement;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(1, clientHeight);
      camera.updateProjectionMatrix();
    };
    const build = async () => {
      for (let i = 0; i < assets.length; i++) {
        if (disposed) return;
        try {
          const texture = await textureLoader.loadAsync(assets[i]);
          texture.colorSpace = THREE.SRGBColorSpace;
          const aspect = (texture.image?.width || 1) / (texture.image?.height || 1);
          const w = 110 + Math.random() * 50;
          const geometry = new THREE.PlaneGeometry(w, w / Math.max(0.1, aspect));
          const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, alphaTest: 0.05, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set((Math.random() * 2 - 1) * 140, (Math.random() * 2 - 1) * 100, -i * 24);
          mesh.rotation.z = THREE.MathUtils.degToRad((Math.random() * 2 - 1) * 20);
          mesh.rotation.y = THREE.MathUtils.degToRad((Math.random() * 2 - 1) * 14);
          group.add(mesh); meshes.push(mesh);
        } catch { /* ignore */ }
      }
    };
    const animate = () => {
      if (disposed) return;
      const t = performance.now() * 0.001;
      group.rotation.y = Math.sin(t * 0.4) * 0.09;
      group.rotation.x = Math.cos(t * 0.3) * 0.04;
      group.position.y = Math.sin(t * 0.7) * 5;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    updateSize();
    build().then(() => { if (!disposed) animate(); });
    window.addEventListener("resize", updateSize);
    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateSize);
      meshes.forEach(m => { group.remove(m); m.geometry.dispose(); m.material.map?.dispose(); m.material.dispose(); });
      renderer.dispose();
    };
  }, []);
  return <canvas ref={canvasRef} className="h-full w-full" />;
}

export default function Home() {
  const navigate = useNavigate();

  const testimonials = useMemo(() => [
    { quote: "I sent this in 2 minutes and it felt so personal, not generic at all.", author: "Aditi", city: "Mumbai" },
    { quote: "The flowers looked so premium on mobile. She cried happy tears 😭", author: "Priya", city: "Hyderabad" },
    { quote: "Got the share link in seconds. So quick and easy!", author: "Neha", city: "Delhi" },
    { quote: "I sent it to my mom and she called me immediately.", author: "Shruti", city: "Pune" },
  ], []);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const featuredPosts = useMemo(() => blogPosts.slice(0, 3), []);

  const occasions = ["For Mom", "For Partner", "For Best Friend", "For Family"];

  useEffect(() => {
    applySeo({
      title: "Free Online Bouquet Maker | Create & Send Digital Flowers with Note",
      description: "Create and send a digital bouquet with a personal note in minutes. Pick flowers, write your message, and share instantly. No signup needed.",
      keywords: seoKeywords.home,
      path: "/",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebSite", name: "Petals and Words", url: window.location.origin, description: "Free online bouquet maker for creating and sharing digital flowers with personal notes." },
          { "@type": "SoftwareApplication", name: "Petals and Words Free Bouquet Maker", applicationCategory: "LifestyleApplication", operatingSystem: "Web", offers: { "@type": "Offer", priceCurrency: "USD", price: "0" }, url: `${window.location.origin}/create` },
        ],
      },
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsSliding(true);
      window.setTimeout(() => { setActiveIdx(v => (v + 1) % testimonials.length); setIsSliding(false); }, 220);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  return (
    <main className="vv-root">
      <style>{VV}</style>

      {/* ── GLASSMORPHISM HEADER ── */}
      <header className="vv-header">
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/logo-transparent.png" alt="Petals and Words" style={{ height: 32, width: "auto" }} />
          <Link to="/blog" className="vv-btn-ghost">Flower Blog</Link>
        </div>
      </header>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 1.25rem 6rem" }}>

        {/* ── HERO CARD ── */}
        <section className="vv-card vv-f1" style={{ marginTop: "1.5rem", position: "relative", overflow: "hidden" }}>

          {/* 3D Flower bloom background */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.28, pointerEvents: "none" }}>
            <HeroThreeBloom />
          </div>

          {/* Decorative gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(251,249,245,0) 40%, rgba(251,249,245,0.85) 100%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", padding: "2.5rem 1.75rem 2rem", textAlign: "center" }}>

            {/* Logo */}
            <img src="/logo-transparent.png" alt="Petals and Words" style={{ height: 40, margin: "0 auto 1rem", display: "block" }} />

            {/* Label */}
            <p className="vv-label" style={{ marginBottom: "0.6rem" }}>Made for Meaningful Moments</p>

            {/* Headline */}
            <h1 className="vv-display" style={{ fontSize: "clamp(1.9rem, 7vw, 2.6rem)", marginBottom: "1rem" }}>
              Send flowers{" "}
              <em className="vv-shimmer">she'll never forget</em>
            </h1>

            {/* Sub copy */}
            <p className="vv-body" style={{ maxWidth: 320, margin: "0 auto 1.5rem", fontSize: "0.92rem" }}>
              A digital bouquet with your words, delivered in seconds — for family, friends, or anyone you care about.
            </p>

            {/* Occasion chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.75rem" }}>
              {occasions.map(label => (
                <button key={label} className="petal-chip" onClick={() => navigate("/create")}>{label}</button>
              ))}
            </div>

            {/* Offer badge */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ display: "inline-block", background: "#f5f3ef", borderRadius: "9999px", padding: "0.5rem 1.2rem", fontSize: "0.8rem", fontWeight: 600, color: "#4f4445" }}>
                ✨ No login · Ready in 60 seconds
              </span>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", width: "100%", maxWidth: 320, margin: "0 auto" }}>
              <button className="vv-btn-primary" onClick={() => navigate("/create")}>
                Create Bouquet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button className="vv-btn-cake" onClick={() => navigate("/create-cake")}>
                <span className="vv-tag-new">NEW</span>
                🎂 Bake a Cake
              </button>
            </div>

            <p style={{ marginTop: "1rem", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#9e8f90" }}>
              Instant share via WhatsApp or Link
            </p>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="vv-f2" style={{ marginTop: "1.5rem" }}>
          <div className="vv-card-low" style={{ padding: "1.5rem 1.25rem" }}>
            <p className="vv-label" style={{ marginBottom: "1.25rem" }}>How it works</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {[
                { n: "1", emoji: "🌸", title: "Pick your flowers", desc: "Choose stems and arrange them into a bouquet they'll love." },
                { n: "2", emoji: "✍️", title: "Write from the heart", desc: "Add a personal note — or pick from our curated message ideas." },
                { n: "3", emoji: "🔗", title: "Share instantly", desc: "Get a unique link. Send over WhatsApp in seconds." },
              ].map(s => (
                <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem", background: "#ffffff", borderRadius: "1.25rem", padding: "0.9rem 1rem" }}>
                  <div className="step-circle">{s.n}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#3E2723", marginBottom: "0.2rem" }}>{s.emoji} {s.title}</p>
                    <p style={{ fontSize: "0.8rem", lineHeight: 1.6, color: "#6b5e5f" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="vv-f3" style={{ marginTop: "1.5rem" }}>
          <div className="vv-card" style={{ padding: "1.5rem 1.25rem" }}>
            <p className="vv-label" style={{ marginBottom: "1rem" }}>What people say</p>
            <div
              style={{
                background: "#f5f3ef", borderRadius: "1.25rem", padding: "1.25rem",
                opacity: isSliding ? 0 : 1,
                transform: isSliding ? "translateX(-12px)" : "translateX(0)",
                transition: "opacity 0.2s, transform 0.2s",
              }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8a96e", marginBottom: "0.5rem" }}>⭐ 5 out of 5</p>
              <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.05rem", fontStyle: "italic", lineHeight: 1.65, color: "#3E2723" }}>
                "{testimonials[activeIdx].quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "1rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "9999px", background: "#ffd9d8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "#7b5455", flexShrink: 0 }}>
                  {testimonials[activeIdx].author[0]}
                </div>
                <p style={{ fontWeight: 600, fontSize: "0.82rem", color: "#4f4445" }}>
                  {testimonials[activeIdx].author}, {testimonials[activeIdx].city}
                </p>
              </div>
            </div>
            {/* Dots */}
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.75rem", alignItems: "center" }}>
              {testimonials.map((_, i) => (
                <span key={i} className={`t-dot ${i === activeIdx ? "active" : ""}`}
                  style={{ cursor: "pointer" }} onClick={() => setActiveIdx(i)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── DARK MESSAGE CARD ── */}
        <section className="vv-f4" style={{ marginTop: "1.5rem" }}>
          <div style={{ borderRadius: "2rem", overflow: "hidden", background: "linear-gradient(135deg, #3E2723 0%, #5c3a34 55%, #7b5455 100%)", padding: "2rem 1.5rem", textAlign: "center", position: "relative" }}>
            <p className="vv-label" style={{ color: "#ecbaba", marginBottom: "0.6rem" }}>Thoughtful Gifts Made Easy</p>
            <p style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.5rem", fontStyle: "italic", fontWeight: 400, color: "#fbf9f5", lineHeight: 1.35, marginBottom: "0.75rem" }}>
              They deserve more than a text.
            </p>
            <p style={{ fontSize: "0.85rem", color: "rgba(251,249,245,0.8)", lineHeight: 1.65, maxWidth: 300, margin: "0 auto 1.5rem" }}>
              Make someone in your life feel truly seen. A bouquet and your words — a gift they'll screenshot and save.
            </p>
            <button
              onClick={() => navigate("/create")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,217,216,0.15)", border: "1.5px solid rgba(255,217,216,0.35)", borderRadius: "9999px", color: "#ffd9d8", fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.65rem 1.6rem", cursor: "pointer", backdropFilter: "blur(8px)", transition: "background 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,217,216,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,217,216,0.15)"}
            >
              Make a bouquet now →
            </button>
          </div>
        </section>

        {/* ── EXPLORE / BLOG ── */}
        <section className="vv-f5" style={{ marginTop: "1.5rem" }}>
          <div className="vv-card-low" style={{ padding: "1.25rem" }}>
            <p className="vv-label" style={{ marginBottom: "0.75rem" }}>Explore more</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {[
                { to: "/virtual-bouquet-maker", label: "🌐 Virtual Bouquet Maker" },
                { to: "/digital-bouquet-maker", label: "💻 Digital Bouquet Maker" },
                { to: "/online-bouquet-maker", label: "🌸 Online Bouquet Maker" },
                { to: "/virtual-bouquet-maker-online-free", label: "🆓 Virtual Maker Online Free" },
                { to: "/digital-bouquet-maker-online-free", label: "🆓 Digital Maker Online Free" },
                { to: "/digital-flower-bouquet-maker", label: "💐 Digital Flower Bouquet Maker" },
                { to: "/bouquet-maker-online", label: "🌼 Bouquet Maker Online" },
              ].map(item => (
                <Link key={item.to} to={item.to} className="vv-btn-ghost" style={{ fontSize: "0.78rem" }}>
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="vv-label" style={{ marginBottom: "0.75rem" }}>From the blog</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {featuredPosts.map(post => (
                <Link key={post.slug} to={`/blog/${post.slug}`}
                  style={{ display: "block", background: "#ffffff", borderRadius: "1rem", padding: "0.85rem 1rem", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffd9d8"}
                  onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                >
                  <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#3E2723", marginBottom: "0.2rem" }}>{post.title}</p>
                  <p style={{ fontSize: "0.78rem", color: "#6b5e5f", lineHeight: 1.5 }}>{post.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
