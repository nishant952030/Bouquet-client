import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Gift, Home, PackageOpen } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { loadGiftBundle } from "../lib/giftBundle";
import { applySeo } from "../lib/seo";
import MusicPlayer from "../components/MusicPlayer";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box}
  .gb-root{min-height:100vh;background:#fbf9f5;color:#2f2824;font-family:'Manrope',sans-serif;overflow-x:hidden}
  .gb-header{position:sticky;top:0;z-index:30;background:rgba(251,249,245,.9);backdrop-filter:blur(18px);border-bottom:1px solid rgba(97,75,61,.08)}
  .gb-header-inner{max-width:840px;margin:0 auto;padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
  .gb-logo{height:30px;width:auto}
  .gb-actions{display:flex;align-items:center;gap:.6rem}
  .gb-shell{max-width:840px;margin:0 auto;padding:1.5rem 1rem 3rem}
  .gb-intro{text-align:center;margin:1.5rem auto 1.3rem;max-width:620px}
  .gb-mark{width:64px;height:64px;border-radius:8px;background:#fff3e7;color:#7b5455;display:grid;place-items:center;margin:0 auto .9rem;box-shadow:0 10px 26px rgba(46,35,28,.06)}
  .gb-kicker{display:inline-flex;align-items:center;gap:.4rem;color:#7b5455;font-size:.72rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:.45rem}
  .gb-title{font-family:'Noto Serif',serif;font-size:clamp(1.8rem,5vw,2.6rem);line-height:1.08;font-weight:500;margin:0;color:#312722}
  .gb-copy{font-size:.92rem;color:#705f58;margin:.55rem auto 0;line-height:1.65;max-width:520px}
  .gb-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem;margin-top:1.2rem}
  .gb-card{background:#fff;border:1px solid rgba(97,75,61,.09);border-radius:8px;box-shadow:0 10px 28px rgba(46,35,28,.05);padding:1rem;display:flex;flex-direction:column;min-height:190px}
  .gb-card-top{display:flex;align-items:flex-start;gap:.75rem;margin-bottom:.85rem}
  .gb-icon{width:44px;height:44px;border-radius:8px;background:#fff3e7;color:#7b5455;display:grid;place-items:center;flex:none}
  .gb-card h2{font-size:1rem;line-height:1.35;margin:0;color:#312722}
  .gb-card p{font-size:.8rem;color:#75665f;line-height:1.5;margin:.25rem 0 0}
  .gb-state{display:inline-flex;align-items:center;align-self:flex-start;border-radius:999px;background:#f4eee8;color:#7b5455;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:.34rem .55rem;margin-top:.3rem}
  .gb-open{margin-top:auto;min-height:44px;border:0;border-radius:8px;background:#7b5455;color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;text-decoration:none;font-size:.88rem;font-weight:800;box-shadow:0 14px 30px rgba(123,84,85,.2);transition:transform .16s ease,box-shadow .16s ease}
  .gb-open:hover{transform:translateY(-1px);box-shadow:0 18px 38px rgba(123,84,85,.26)}
  .gb-open:active{transform:scale(.98)}
  .gb-btn{min-height:38px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;gap:.45rem;text-decoration:none;font-size:.82rem;font-weight:800;border:1px solid rgba(123,84,85,.18);background:#fff;color:#7b5455;padding:.5rem .75rem}
  .gb-state-card{background:#fff;border:1px solid rgba(97,75,61,.09);border-radius:8px;box-shadow:0 10px 28px rgba(46,35,28,.05);padding:2rem 1.25rem;text-align:center;max-width:420px;margin:3rem auto 0}
  .gb-spinner{width:34px;height:34px;border-radius:50%;border:3px solid #f1e8e2;border-top-color:#7b5455;animation:gbSpin .8s linear infinite;margin:0 auto .9rem}
  @keyframes gbSpin{to{transform:rotate(360deg)}}
  @media(max-width:680px){.gb-list{grid-template-columns:1fr}.gb-intro{text-align:left}.gb-mark{margin-left:0}}
`;

function getOpenedKey(id) {
  return `gift_bundle_opened_${id}`;
}

export default function GiftBundle() {
  const { id } = useParams();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openedIds, setOpenedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getOpenedKey(id))) || [];
    } catch {
      return [];
    }
  });

  const items = useMemo(() => (Array.isArray(bundle?.items) ? bundle.items : []), [bundle]);
  
  const firstMusicTrack = useMemo(() => {
    const itemWithMusic = items.find((item) => item.musicTrack && item.musicTrack !== "none");
    return itemWithMusic ? itemWithMusic.musicTrack : "none";
  }, [items]);

  useEffect(() => {
    applySeo({
      title: "Open Your Gifts | Petals and Words",
      description: "Open a set of digital gifts shared with you.",
      path: id ? `/gift/${id}` : "/gift",
      robots: "noindex,nofollow",
    });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await loadGiftBundle(id);
      if (!cancelled) {
        setBundle(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const markOpened = (item, index) => {
    const itemId = item.storageId || `${item.type}-${index}`;
    setOpenedIds((current) => {
      const next = current.includes(itemId) ? current : [...current, itemId];
      try {
        localStorage.setItem(getOpenedKey(id), JSON.stringify(next));
      } catch {
        // Ignore private browsing storage failures.
      }
      return next;
    });
  };

  if (loading) {
    return (
      <main className="gb-root">
        <style>{CSS}</style>
        <section className="gb-state-card">
          <div className="gb-spinner" />
          <p>Loading your gifts...</p>
        </section>
      </main>
    );
  }

  if (!bundle || !items.length) {
    return (
      <main className="gb-root">
        <style>{CSS}</style>
        <section className="gb-state-card">
          <div className="gb-mark"><Gift size={28} /></div>
          <h1 className="gb-title" style={{ fontSize: "1.45rem" }}>Gift link not found</h1>
          <p className="gb-copy">This bundle may be invalid or expired.</p>
          <Link className="gb-btn" to="/" style={{ marginTop: "1rem" }}><Home size={16} /> Home</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="gb-root">
      <MusicPlayer trackId={firstMusicTrack} />
      <style>{CSS}</style>
      <header className="gb-header">
        <div className="gb-header-inner">
          <Link to="/">
            <img src="/logo-transparent.png" className="gb-logo" alt="Petals and Words" />
          </Link>
          <div className="gb-actions">
            <LanguageSwitcher />
            <Link to="/" className="gb-btn"><Home size={16} /> Home</Link>
          </div>
        </div>
      </header>

      <section className="gb-shell">
        <div className="gb-intro">
          <div className="gb-mark"><PackageOpen size={30} /></div>
          <span className="gb-kicker"><Gift size={15} /> Gift bundle</span>
          <h1 className="gb-title">You have {items.length} gifts to open</h1>
          <p className="gb-copy">Choose any gift below. Each one opens separately, so the receiver can enjoy Gift 1, Gift 2, Gift 3, and so on.</p>
        </div>

        <div className="gb-list">
          {items.map((item, index) => {
            const itemId = item.storageId || `${item.type}-${index}`;
            const isOpened = openedIds.includes(itemId);
            return (
              <article className="gb-card" key={`${item.type}-${item.storageId || index}`}>
                <div className="gb-card-top">
                  <div className="gb-icon"><Gift size={21} /></div>
                  <div>
                    <h2>Gift {index + 1}: {item.title || "Digital gift"}</h2>
                    <p>{item.subtitle || "Open this gift to see the surprise."}</p>
                    <span className="gb-state">{isOpened ? "Opened" : "Ready"}</span>
                  </div>
                </div>
                <a
                  className="gb-open"
                  href={item.url}
                  onClick={() => markOpened(item, index)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open Gift {index + 1} <ArrowRight size={16} />
                </a>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
