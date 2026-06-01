import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";

import { applySeo, seoKeywords } from "../lib/seo";
import { blogPosts } from "../data/blogPosts";

/* --- 3D Components --- */

const Petal = ({ color, position, rotation, scale }) => {
  const mesh = useRef();
  const [speed] = useState(() => 0.1 + Math.random() * 0.4);
  
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y += speed * 0.05;
    mesh.current.rotation.z += speed * 0.02;
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2} position={position} rotation={rotation}>
      <mesh ref={mesh} scale={[scale, scale * 0.1, scale * 0.5]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

const SceneBackground = () => {
  const [petals] = useState(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8 - 2
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: 0.5 + Math.random() * 1.5,
      color: i % 2 === 0 ? '#e48d9c' : '#fbc4ab'
    }));
  });

  return (
    <group>
      {petals.map((props, i) => <Petal key={i} {...props} />)}
      <ContactShadows position={[0, -4, 0]} opacity={0.3} scale={20} blur={2} far={4.5} />
    </group>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const testimonials = useMemo(() => [
    { quote: "I sent this in 2 minutes and it felt so personal, not generic at all.", author: "Aditi", city: "Mumbai" },
    { quote: "The flowers looked so premium on mobile. She cried happy tears 😭", author: "Priya", city: "Hyderabad" },
    { quote: "Got the share link in seconds. So quick and easy!", author: "Neha", city: "Delhi" },
  ], []);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const featuredPosts = useMemo(() => blogPosts.slice(0, 3), []);

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
    <div className="relative w-full h-screen overflow-hidden bg-[#fff5f6] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@400;500;600;700&display=swap');
        .glass-card {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 10px 40px rgba(228, 141, 156, 0.15);
        }
        .ui-layer { pointer-events: none; }
        .ui-layer * { pointer-events: auto; }
        
        .vv-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #a65d5d 0%, #7c4343 100%);
          color: #ffffff;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          border: none; border-radius: 9999px;
          padding: 0 2rem; min-height: 56px;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(124, 67, 67, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: 100%;
        }
        .vv-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(124, 67, 67, 0.35);
        }
        
        .vv-btn-secondary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #ffffff;
          color: #7c4343;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          border: 1.5px solid rgba(166, 93, 93, 0.2);
          border-radius: 9999px;
          padding: 0 2rem; min-height: 56px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          width: 100%;
        }
        .vv-btn-secondary:hover {
          transform: translateY(-2px);
          border-color: rgba(166, 93, 93, 0.5);
          box-shadow: 0 10px 25px rgba(166, 93, 93, 0.1);
        }

        .vv-tag-new {
          position: absolute; top: -10px; right: 10px;
          background: linear-gradient(135deg, #e91e63 0%, #f48fb1 100%);
          color: #ffffff;
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
          padding: 0.25rem 0.6rem; border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(233,30,99,0.3);
          transform: rotate(8deg);
        }
        
        /* Shimmer badge */
        @keyframes vvShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .vv-shimmer {
          background: linear-gradient(90deg, #7c4343 0%, #e48d9c 40%, #c8a96e 70%, #7c4343 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: vvShimmer 4s linear infinite;
        }
      `}</style>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#fff5f6" />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <SceneBackground />
          <Environment preset="dawn" />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="ui-layer absolute inset-0 z-10 flex flex-col items-center overflow-y-auto px-4 pb-20">
        
        {/* Header */}
        <header className="w-full max-w-6xl flex items-center justify-between py-6 mb-4 md:mb-10">
          <img src="/logo-transparent.png" alt="Petals and Words" className="h-8 md:h-10" />
          <div className="flex items-center gap-4">
            <Link to="/blog" className="text-[#7c4343] font-semibold text-sm tracking-wide hover:opacity-70 transition-opacity hidden md:block">{t("common.blog")}</Link>
            <LanguageSwitcher />
          </div>
        </header>

        {/* Hero Section Card */}
        <main className="w-full flex items-center justify-center mb-16">
          <div className="glass-card max-w-2xl w-full rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
            
            {/* Logo Area */}
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-4 text-[#e48d9c] opacity-60">
                <svg fill="none" height="30" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 60 30" width="60"><path d="M30 15c-5-10-15-10-20-5 5 5 15 5 20 5m0 0c5-10 15-10 20-5-5 5-15 5-20 5" strokeLinecap="round"></path></svg>
              </div>
              <h2 className="uppercase tracking-widest text-xs font-bold mb-2 text-[#7c4343] opacity-80">
                {t("home.label", "Made for Meaningful Moments")}
              </h2>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#3d3028] mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Send flowers she'll <br className="hidden md:block"/>
              <em className="vv-shimmer italic font-medium">never forget</em>
            </h1>
            
            <p className="text-[#5c4a40] text-sm md:text-base font-medium mb-10 max-w-md mx-auto leading-relaxed">
              A digital bouquet with your words, delivered in seconds — for family, friends, or anyone you care about.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <button className="vv-btn-primary" onClick={() => navigate("/create")}>
                {t("common.createBouquet")}
              </button>

              <div className="relative w-full">
                <button className="vv-btn-secondary" onClick={() => navigate("/create-greeting-card")}>
                  💌 {t("home.createCard", "Send a Card")}
                </button>
                <span className="vv-tag-new">{t("common.new")}</span>
              </div>

              <button className="vv-btn-secondary" onClick={() => navigate("/create-cake")} style={{ border: "none", background: "transparent", color: "#a65d5d", minHeight: "44px" }}>
                🍰 {t("home.bakeCake")}
              </button>
            </div>
            
            <p className="mt-8 text-[10px] md:text-xs tracking-widest uppercase font-semibold text-[#a65d5d] opacity-70">
              No login • Ready in 60 seconds
            </p>
          </div>
        </main>

        {/* Below the fold content */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          
          {/* Testimonials */}
          <div className="glass-card rounded-[2rem] p-8">
            <h3 className="uppercase tracking-widest text-xs font-bold mb-6 text-[#7c4343] opacity-80">{t("home.testimonials")}</h3>
            <div 
              style={{
                opacity: isSliding ? 0 : 1,
                transform: isSliding ? "translateX(-12px)" : "translateX(0)",
                transition: "opacity 0.2s, transform 0.2s",
              }}
            >
              <p className="font-serif text-xl italic text-[#3d3028] mb-6 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                "{testimonials[activeIdx].quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#fbc4ab] text-[#7c4343] flex items-center justify-center font-bold">
                  {testimonials[activeIdx].author[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#5c4a40] text-sm">{testimonials[activeIdx].author}</p>
                  <p className="text-xs text-[#a65d5d]">{testimonials[activeIdx].city}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-8">
              {testimonials.map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveIdx(i)}
                  className={`h-2 rounded-full cursor-pointer transition-all ${i === activeIdx ? 'w-8 bg-[#7c4343]' : 'w-2 bg-[#e48d9c] opacity-40'}`} 
                />
              ))}
            </div>
          </div>

          {/* Blog / Explore */}
          <div className="glass-card rounded-[2rem] p-8">
            <h3 className="uppercase tracking-widest text-xs font-bold mb-6 text-[#7c4343] opacity-80">{t("home.fromBlog")}</h3>
            <div className="flex flex-col gap-4">
              {featuredPosts.map(post => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
                  <h4 className="font-semibold text-[#3d3028] text-sm mb-1 group-hover:text-[#7c4343] transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-xs text-[#5c4a40] opacity-80 line-clamp-2">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#e48d9c]/20">
               <Link to="/blog" className="text-xs font-bold tracking-widest uppercase text-[#a65d5d] hover:text-[#7c4343] transition-colors flex items-center gap-2">
                 View all articles
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
               </Link>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
