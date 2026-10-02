import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { applySeo, seoKeywords } from "../lib/seo";
import { blogPosts } from "../data/blogPosts";

const TESTIMONIALS = [
  { quote: "\u201cI sent my sister a digital peony bouquet with an audio poem when she defended her thesis. She wept happy tears across four time zones.\u201d", name: "Camille Laurent", role: "Sent \u2018Dawn Rose & Eucalyptus\u2019 bouquet", location: "Paris, France" },
  { quote: "\u201cThe virtual hug card felt surprisingly intimate. My partner listened to the cello soundscape on his commute and felt wrapped in affection.\u201d", name: "Julian Thorne", role: "Created \u2018Meadow Breath\u2019 Hug Card", location: "Edinburgh, UK" },
  { quote: "\u201cThe unsealing animation of the wax stamp is sheer poetry. There is no comparable gifting experience that feels this tactile and authentic online.\u201d", name: "Elena Rostova", role: "Sent \u2018Monogrammed Botanical Wax\u2019 letter", location: "Milan, Italy" },
  { quote: "\u201cI sent this in 2 minutes and it felt so personal, not generic at all. She called me right after.\u201d", name: "Aditi Sharma", role: "Created a birthday bouquet", location: "Mumbai, India" },
  { quote: "\u201cThe flowers looked so premium on mobile. She cried happy tears \ud83d\ude2d Best digital gift I\u2019ve ever sent.\u201d", name: "Priya Kapoor", role: "Sent an anniversary bouquet", location: "Hyderabad, India" },
];

const TOOLS = [
  { icon: "\ud83d\udc90", title: "Digital Floral Bouquet", desc: "Curate beautiful stems with a heartfelt note. Free, instant, no signup.", tags: ["Stem Builder", "Color Harmony", "Shareable Link"], path: "/create" },
  { icon: "\ud83d\udc8c", title: "Artisanal Greeting Card", desc: "Write a letter in a beautiful envelope with custom calligraphy and wax seal.", tags: ["Linen Paper", "Wax Stamp", "Audio Note"], path: "/create-greeting-card" },
  { icon: "\ud83e\udd17", title: "Virtual Hug Card", desc: "Send an interactive pull-to-open warm hug card with ambient sound.", tags: ["Breathing Glow", "Soundscapes", "Warmth Tokens"], path: "/create-hug-card" },
];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const featuredPosts = useMemo(() => blogPosts.slice(0, 3), []);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    applySeo({
      title: "Free Online Bouquet Maker | Create & Send Digital Flowers with a Note",
      description: "Send a digital bouquet for birthdays, anniversaries, or just because. Free, instant, no signup.",
      keywords: seoKeywords.home,
      path: "/",
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => { setActiveIdx(v => (v + 1) % TESTIMONIALS.length); setIsSliding(false); }, 200);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const t_ = TESTIMONIALS[activeIdx];

  return (
    <div style={{ minHeight: "100vh", background: "#fff8f7", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .ms{font-family:'Material Symbols Outlined';font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24;display:inline-block;vertical-align:middle;line-height:1}
        .ms-fill{font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24}
        @keyframes floatPetal{0%{transform:translateY(-20px) rotate(0deg);opacity:0}15%{opacity:.65}85%{opacity:.4}100%{transform:translateY(105vh) rotate(380deg) translateX(80px);opacity:0}}
        @keyframes pulseAura{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.08);opacity:.65}}
        @keyframes modalIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
        .petal{position:absolute;pointer-events:none;background:radial-gradient(circle at 35% 35%,#ffd9dd 0%,#fda2b1 55%,#e48d9c 100%);border-radius:70% 30% 70% 30%/30% 70% 30% 70%;filter:drop-shadow(0 4px 6px rgba(124,67,67,.08));animation:floatPetal linear infinite}
        .shimmer{background:linear-gradient(135deg,#602d2d 0%,#904856 50%,#602d2d 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .glass{background:rgba(255,255,255,.55);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.88)}
        .glass2{background:rgba(255,255,255,.76);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.92)}
        .btn-wine{background:linear-gradient(135deg,#7c4343,#904856);color:#fff;font-family:'Montserrat',sans-serif;font-weight:600;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all .22s;box-shadow:0 6px 20px rgba(124,67,67,.28);border:none;cursor:pointer}
        .btn-wine:hover{background:linear-gradient(135deg,#5a2e2e,#7c4343);transform:scale(1.03);box-shadow:0 10px 28px rgba(124,67,67,.38)}
        .btn-glass-s{background:rgba(255,255,255,.6);color:#602d2d;border:1px solid rgba(255,255,255,.85);border-radius:9999px;font-family:'Montserrat',sans-serif;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;text-decoration:none}
        .btn-glass-s:hover{background:rgba(255,255,255,.9)}
        .blog-link{background:rgba(255,255,255,.42);border:1px solid rgba(255,255,255,.78);border-radius:18px;transition:all .22s;display:block;text-decoration:none}
        .blog-link:hover{background:rgba(255,255,255,.76);transform:translateX(4px)}
        .tag-pill{padding:3px 10px;background:rgba(255,255,255,.72);border-radius:9999px;font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#524343}
        .tool-card{background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);border-radius:24px;transition:all .28s;display:flex;flex-direction:column;justify-content:space-between}
        .tool-card:hover{background:rgba(255,255,255,.84);box-shadow:0 16px 40px rgba(124,67,67,.12);transform:translateY(-3px)}
        .modal-bd{position:fixed;inset:0;z-index:50;background:rgba(47,19,24,.45);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:1.25rem}
        .modal-box{animation:modalIn .28s cubic-bezier(.22,1,.36,1);max-height:90vh;overflow-y:auto}
        .dot-ctrl{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.76);border:1px solid rgba(214,194,193,.55);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#602d2d;transition:all .18s}
        .dot-ctrl:hover{background:#fff}
        a,button{cursor:pointer}

        .home-header {
          position: fixed;
          top: 14px;
          left: 14px;
          right: 14px;
          z-index: 40;
          border-radius: 9999px;
          box-shadow: 0 8px 32px rgba(124,67,67,.07);
          max-width: 1200px;
          margin: 0 auto;
        }
        .home-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 24px;
          gap: 12px;
        }
        .home-header-logo {
          height: 34px;
          width: auto;
          object-fit: contain;
          flex-shrink: 0;
          display: block;
        }
        .home-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .home-blog-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #524343;
          text-decoration: none;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .home-blog-link:hover {
          color: #904856;
        }
        .home-btn-gift {
          padding: 9px 20px;
          font-size: 13.5px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .home-header {
            top: 10px;
            left: 10px;
            right: 10px;
          }
          .home-header-inner {
            padding: 7px 12px;
            gap: 8px;
          }
          .home-header-logo {
            height: 26px;
          }
          .home-header-right {
            gap: 8px;
          }
          .home-blog-link {
            display: none;
          }
          .home-btn-gift {
            padding: 7px 13px;
            font-size: 12px;
            gap: 5px;
          }
        }

        @media (max-width: 380px) {
          .home-header-inner {
            padding: 6px 10px;
            gap: 6px;
          }
          .home-header-logo {
            height: 23px;
          }
          .home-btn-gift {
            padding: 6px 10px;
            font-size: 11px;
            gap: 4px;
          }
        }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position:"absolute",top:"-15%",left:"50%",transform:"translateX(-50%)",width:900,height:750,background:"radial-gradient(circle,rgba(253,169,177,.22) 0%,transparent 70%)",borderRadius:"50%",filter:"blur(60px)",animation:"pulseAura 12s ease-in-out infinite" }} />
        <div style={{ position:"absolute",top:"45%",left:"-10%",width:550,height:550,background:"rgba(255,178,190,.14)",borderRadius:"50%",filter:"blur(60px)" }} />
        <div style={{ position:"absolute",bottom:"5%",right:"-5%",width:600,height:600,background:"rgba(255,225,228,.32)",borderRadius:"50%",filter:"blur(60px)" }} />
        <div className="petal" style={{ width:16,height:24,left:"8%",animationDuration:"14s",animationDelay:"0s" }} />
        <div className="petal" style={{ width:12,height:18,left:"22%",animationDuration:"18s",animationDelay:"3s" }} />
        <div className="petal" style={{ width:20,height:28,left:"45%",animationDuration:"16s",animationDelay:"1.5s" }} />
        <div className="petal" style={{ width:14,height:22,left:"68%",animationDuration:"20s",animationDelay:"5s" }} />
        <div className="petal" style={{ width:16,height:24,left:"86%",animationDuration:"15s",animationDelay:"2s" }} />
        <div className="petal" style={{ width:12,height:16,left:"93%",animationDuration:"19s",animationDelay:"7s" }} />
      </div>

      {/* NAV */}
      <header className="glass2 home-header">
        <div className="home-header-inner">
          <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <img src="/logo-transparent.png" alt="Petals & Words" className="home-header-logo" />
          </Link>
          <div className="home-header-right">
            <Link to="/blog" className="home-blog-link">Blog</Link>
            <LanguageSwitcher />
            <button className="btn-wine home-btn-gift" onClick={() => setModalOpen(true)}>
              <span className="ms" style={{ fontSize: 16 }}>redeem</span>
              <span>Send a Gift</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main style={{ position:"relative",zIndex:10,paddingTop:130,paddingBottom:56,padding:"130px 16px 56px",maxWidth:1200,margin:"0 auto" }}>
        <div className="glass" style={{ maxWidth:860,margin:"0 auto 48px",borderRadius:40,padding:"clamp(32px,6vw,64px)",textAlign:"center",position:"relative",overflow:"hidden",boxShadow:"0 20px 60px rgba(124,67,67,.09)" }}>
          <div style={{ position:"absolute",top:-80,right:-80,width:200,height:200,background:"rgba(253,162,177,.32)",borderRadius:"50%",filter:"blur(40px)",pointerEvents:"none" }} />
          <div style={{ position:"absolute",bottom:-80,left:-80,width:200,height:200,background:"rgba(255,225,228,.45)",borderRadius:"50%",filter:"blur(40px)",pointerEvents:"none" }} />

          {/* Kicker */}
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 18px",borderRadius:9999,background:"rgba(255,255,255,.76)",border:"1px solid rgba(255,217,221,.75)",boxShadow:"0 2px 8px rgba(124,67,67,.06)",marginBottom:22 }}>
            <span className="ms" style={{ fontSize:14,color:"#904856" }}>auto_awesome</span>
            <span style={{ fontFamily:"Montserrat,sans-serif",fontSize:11,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#602d2d" }}>✦ MADE FOR MEANINGFUL MOMENTS ✦</span>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(2.1rem,5vw,3.4rem)",lineHeight:1.15,fontWeight:500,color:"#2f1318",margin:"0 0 18px" }}>
            Send flowers that{" "}<em className="shimmer" style={{ fontStyle:"italic",fontWeight:400 }}>feel like you</em>
          </h1>

          <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:16,lineHeight:1.78,color:"#524343",maxWidth:560,margin:"0 auto 34px",fontWeight:300 }}>
            Handcraft bespoke digital floral arrangements paired with poetic notes and heartfelt motion. Free forever, no waste, infinitely cherished.
          </p>

          <div style={{ display:"flex",flexWrap:"wrap",gap:14,justifyContent:"center",marginBottom:26 }}>
            <button className="btn-wine" style={{ padding:"14px 36px",fontSize:15 }} onClick={() => setModalOpen(true)}>
              <span className="ms" style={{ fontSize:20 }}>redeem</span> Gifts &amp; Tools <span className="ms" style={{ fontSize:18 }}>arrow_forward</span>
            </button>
            <Link to="/blog" className="btn-glass-s" style={{ padding:"13px 28px",fontSize:14 }}>
              <span className="ms" style={{ fontSize:18 }}>menu_book</span> Explore Journal
            </Link>
          </div>

          <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:12,color:"#857372" }}>
            <span className="ms" style={{ fontSize:14,color:"#904856",marginRight:4 }}>verified</span>
            No login required · Ready to send in 60 seconds · 100% Free
          </p>

          {/* Feature strip */}
          <div style={{ marginTop:32,paddingTop:22,borderTop:"1px solid rgba(214,194,193,.45)",display:"flex",flexWrap:"wrap",gap:18,justifyContent:"space-around" }}>
            {[{icon:"spa",label:"Living Petals",sub:"Wind & blossom physics"},{icon:"history_edu",label:"Artisan Script",sub:"Letterpress calligraphy"},{icon:"workspace_premium",label:"Wax Seal Stamp",sub:"Bespoke monogram emblems"}].map(f => (
              <div key={f.icon} style={{ display:"flex",alignItems:"center",gap:12,textAlign:"left" }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:"rgba(253,162,177,.28)",display:"flex",alignItems:"center",justifyContent:"center",color:"#602d2d" }}>
                  <span className="ms" style={{ fontSize:19 }}>{f.icon}</span>
                </div>
                <div>
                  <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:600,color:"#602d2d",margin:0 }}>{f.label}</p>
                  <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:11,color:"#857372",margin:0 }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-col cards */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:26 }}>

          {/* Testimonials */}
          <div className="glass" style={{ borderRadius:30,padding:"clamp(24px,4vw,36px)",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden",boxShadow:"0 8px 32px rgba(124,67,67,.06)" }}>
            <span style={{ position:"absolute",top:-16,right:12,fontSize:130,lineHeight:1,color:"rgba(214,194,193,.3)",fontFamily:"'Playfair Display',serif",fontStyle:"italic",pointerEvents:"none",userSelect:"none" }}>"</span>
            <div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span className="ms ms-fill" style={{ fontSize:20,color:"#904856" }}>favorite</span>
                  <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:600,color:"#602d2d",margin:0 }}>Words from the Heart</h2>
                </div>
                <div style={{ display:"flex",gap:2,color:"#904856" }}>
                  {[...Array(5)].map((_,i) => <span key={i} className="ms ms-fill" style={{ fontSize:15 }}>star</span>)}
                </div>
              </div>
              <div style={{ minHeight:120,display:"flex",alignItems:"center",opacity:isSliding?0:1,transform:isSliding?"translateX(-10px)":"translateX(0)",transition:"opacity .2s,transform .2s" }}>
                <p style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontStyle:"italic",lineHeight:1.7,color:"#2f1318",margin:0 }}>{t_.quote}</p>
              </div>
            </div>
            <div style={{ marginTop:22,paddingTop:18,borderTop:"1px solid rgba(214,194,193,.42)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:42,height:42,borderRadius:"50%",background:"rgba(253,162,177,.38)",border:"2px solid rgba(253,162,177,.6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#602d2d",fontFamily:"'Playfair Display',serif",fontWeight:600,fontSize:17 }}>{t_.name[0]}</div>
                <div>
                  <h4 style={{ fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:700,color:"#602d2d",margin:0 }}>{t_.name}</h4>
                  <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:11,color:"#904856",margin:0 }}>{t_.role}</p>
                  <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:600,letterSpacing:".12em",textTransform:"uppercase",color:"#857372",margin:0 }}>{t_.location}</p>
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                <button className="dot-ctrl" onClick={() => setActiveIdx((activeIdx-1+TESTIMONIALS.length)%TESTIMONIALS.length)}><span className="ms" style={{ fontSize:16 }}>arrow_back</span></button>
                <div style={{ display:"flex",gap:5 }}>
                  {TESTIMONIALS.map((_,i) => (
                    <button key={i} onClick={() => setActiveIdx(i)} style={{ width:i===activeIdx?10:7,height:i===activeIdx?10:7,borderRadius:"50%",background:i===activeIdx?"#602d2d":"rgba(133,115,114,.4)",border:"none",cursor:"pointer",transition:"all .2s" }} />
                  ))}
                </div>
                <button className="dot-ctrl" onClick={() => setActiveIdx((activeIdx+1)%TESTIMONIALS.length)}><span className="ms" style={{ fontSize:16 }}>arrow_forward</span></button>
              </div>
            </div>
          </div>

          {/* Blog */}
          <div className="glass" style={{ borderRadius:30,padding:"clamp(24px,4vw,36px)",display:"flex",flexDirection:"column",boxShadow:"0 8px 32px rgba(124,67,67,.06)" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,paddingBottom:14,borderBottom:"1px solid rgba(214,194,193,.42)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span className="ms" style={{ fontSize:22,color:"#904856" }}>auto_stories</span>
                <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:600,color:"#602d2d",margin:0 }}>The Floral Journal</h2>
              </div>
              <Link to="/blog" style={{ fontFamily:"Montserrat,sans-serif",fontSize:12,fontWeight:600,color:"#904856",textDecoration:"none",display:"flex",alignItems:"center",gap:4 }}>
                View all <span className="ms" style={{ fontSize:14 }}>arrow_forward</span>
              </Link>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
              {featuredPosts.map(post => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-link" style={{ padding:"13px 15px" }}>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:13 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background:"rgba(253,162,177,.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20 }}>🌸</div>
                    <div>
                      <div style={{ fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#904856",marginBottom:4 }}>Floral Lore · 4 min read</div>
                      <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:500,color:"#2f1318",margin:0,lineHeight:1.45 }}>{post.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* TOOLS MODAL */}
      {modalOpen && (
        <div className="modal-bd" onClick={() => setModalOpen(false)}>
          <div className="modal-box glass2" style={{ maxWidth:900,width:"100%",borderRadius:40,padding:"clamp(24px,5vw,48px)",position:"relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalOpen(false)} style={{ position:"absolute",top:18,right:18,width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,.88)",border:"1px solid rgba(214,194,193,.55)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#602d2d",transition:"all .2s",zIndex:1 }}>
              <span className="ms" style={{ fontSize:20 }}>close</span>
            </button>
            <div style={{ textAlign:"center",marginBottom:32 }}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",borderRadius:9999,background:"rgba(253,162,177,.28)",border:"1px solid rgba(253,162,177,.5)",marginBottom:12 }}>
                <span className="ms" style={{ fontSize:13,color:"#602d2d" }}>auto_fix_high</span>
                <span style={{ fontFamily:"Montserrat,sans-serif",fontSize:10,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:"#602d2d" }}>Bespoke Digital Suite</span>
              </div>
              <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.4rem,3vw,2rem)",fontWeight:500,color:"#602d2d",margin:"0 0 8px" }}>Choose Your Gesture of Devotion</h2>
              <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:14,color:"#524343",margin:0,fontWeight:300 }}>Select an interactive instrument to build and customize your unique token.</p>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18 }}>
              {TOOLS.map(tool => (
                <div key={tool.path} className="tool-card" style={{ padding:22 }}>
                  <div>
                    <div style={{ fontSize:34,marginBottom:14 }}>{tool.icon}</div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:600,color:"#602d2d",margin:"0 0 8px" }}>{tool.title}</h3>
                    <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:13,color:"#524343",lineHeight:1.65,margin:"0 0 14px" }}>{tool.desc}</p>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:18 }}>
                      {tool.tags.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
                    </div>
                  </div>
                  <button className="btn-wine" style={{ width:"100%",padding:"12px 0",fontSize:14 }} onClick={() => { setModalOpen(false); navigate(tool.path); }}>
                    Explore Tool <span className="ms" style={{ fontSize:15 }}>arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background:"rgba(255,240,241,.6)",borderTop:"1px solid rgba(214,194,193,.4)",position:"relative",zIndex:10,marginTop:52 }}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"36px 24px",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:18 }}>
          <div>
            <h4 style={{ fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:500,color:"#602d2d",margin:"0 0 4px" }}>Petals &amp; Words</h4>
            <p style={{ fontFamily:"Montserrat,sans-serif",fontSize:12,color:"#857372",margin:0 }}>© 2024 Petals &amp; Words. Handcrafted digital floral poetry.</p>
          </div>
          <nav style={{ display:"flex",flexWrap:"wrap",gap:18 }}>
            {[["Blog","/blog"],["Bouquet Maker","/create"],["Greeting Card","/create-greeting-card"],["Virtual Hug","/create-hug-card"]].map(([label,to]) => (
              <Link key={to} to={to} style={{ fontFamily:"Montserrat,sans-serif",fontSize:13,color:"#524343",textDecoration:"none" }}>{label}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
