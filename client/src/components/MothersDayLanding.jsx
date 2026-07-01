/**
 * Shared SSR landing page component for keyword-targeted Mother's Day pages.
 * Renders full static HTML so Google can index the content.
 */
import Link from "next/link";

export default function MothersDayLanding({ content, slug }) {
  const BASE_URL = "https://www.petalsandwords.com";
  const pageUrl = `${BASE_URL}/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: content.seoTitle,
        description: content.description,
        url: pageUrl,
        publisher: {
          "@type": "Organization",
          name: "Petals and Words",
          url: BASE_URL,
          logo: { "@type": "ImageObject", url: `${BASE_URL}/logo-transparent.png` },
        },
      },
      content.faq && {
        "@type": "FAQPage",
        mainEntity: content.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: content.title, item: pageUrl },
        ],
      },
    ].filter(Boolean),
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff1f2 0%, #fdf2f8 50%, #fef9ee 100%)",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(244, 63, 94, 0.12)",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/">
          <img src="/logo-transparent.png" alt="Petals and Words" style={{ height: "2rem" }} />
        </Link>
        <Link
          href="/create"
          style={{
            background: "#e11d48",
            color: "white",
            padding: "0.5rem 1.25rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Create Free Card
        </Link>
      </header>

      <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem", fontSize: "0.75rem", color: "#78716c" }}>
          <ol style={{ display: "flex", gap: "0.4rem", listStyle: "none", padding: 0, margin: 0 }}>
            <li><Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Home</Link></li>
            <li aria-hidden="true">›</li>
            <li style={{ color: "#57534e", fontWeight: 500 }}>{content.title}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section
          style={{
            background: "white",
            borderRadius: "2rem",
            padding: "2.5rem",
            boxShadow: "0 20px 60px rgba(244, 63, 94, 0.08)",
            border: "1px solid rgba(244, 63, 94, 0.12)",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#e11d48",
            }}
          >
            Petals and Words
          </span>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 600,
              color: "#1c1917",
              margin: "0.5rem 0 1rem",
              lineHeight: 1.2,
            }}
          >
            {content.title}
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.7,
              color: "#57534e",
              maxWidth: "42rem",
              margin: "0 auto 1.75rem",
            }}
          >
            {content.intro}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/create"
              style={{
                background: "linear-gradient(135deg, #e11d48, #be123c)",
                color: "white",
                padding: "0.85rem 2rem",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(225, 29, 72, 0.3)",
              }}
            >
              Create Free Card →
            </Link>
            <Link
              href="/create-hug-card"
              style={{
                border: "1.5px solid #fda4af",
                color: "#e11d48",
                padding: "0.85rem 1.75rem",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                background: "#fff1f2",
              }}
            >
              🤗 Hug Card
            </Link>
          </div>
        </section>

        {/* Features grid */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "1.75rem",
              color: "#1c1917",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Why moms love it
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { emoji: "💌", title: "Envelope Reveal", desc: "An elegant envelope slides open to reveal your personal letter." },
              { emoji: "🎨", title: "Fully Customizable", desc: "Pick paper textures, colours, and emoji sticker decorations." },
              { emoji: "📱", title: "Works on Any Device", desc: "Perfectly optimized for mobile, tablet, and desktop." },
              { emoji: "⚡", title: "Instant Sharing", desc: "Send via WhatsApp, iMessage, SMS, or email in one click." },
              { emoji: "🆓", title: "100% Free", desc: "No signup, no credit card, no hidden fees. Ever." },
              { emoji: "♾️", title: "Kept Forever", desc: "Unlike physical cards, digital cards never get lost or thrown away." },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: "white",
                  borderRadius: "1.25rem",
                  padding: "1.25rem",
                  border: "1px solid #fce7f3",
                  boxShadow: "0 4px 16px rgba(244, 63, 94, 0.04)",
                }}
              >
                <span style={{ fontSize: "1.75rem" }}>{f.emoji}</span>
                <h3
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1c1917",
                    margin: "0.4rem 0 0.3rem",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#78716c", lineHeight: 1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        {content.faq && content.faq.length > 0 && (
          <section
            style={{
              background: "white",
              borderRadius: "2rem",
              padding: "2rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
              border: "1px solid #f3f4f6",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: "1.75rem",
                color: "#1c1917",
                marginBottom: "1.25rem",
              }}
            >
              Frequently asked questions
            </h2>
            <dl style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {content.faq.map((item) => (
                <div key={item.q} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "1.25rem" }}>
                  <dt
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#1c1917",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {item.q}
                  </dt>
                  <dd style={{ fontSize: "0.9rem", color: "#57534e", lineHeight: 1.65, margin: 0 }}>
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Final CTA */}
        <section
          style={{
            background: "linear-gradient(135deg, #fff1f2, #fdf2f8)",
            borderRadius: "2rem",
            padding: "2.5rem",
            textAlign: "center",
            border: "1px solid #fda4af",
          }}
        >
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "2rem",
              color: "#1c1917",
              marginBottom: "0.5rem",
            }}
          >
            Make Mom&apos;s day — in 2 minutes
          </h2>
          <p style={{ color: "#78716c", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            Free, instant, no account needed.
          </p>
          <Link
            href="/create"
            style={{
              background: "linear-gradient(135deg, #e11d48, #be123c)",
              color: "white",
              padding: "0.9rem 2.25rem",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 8px 24px rgba(225, 29, 72, 0.3)",
            }}
          >
            Create Your Free Card →
          </Link>

          {/* Internal links for SEO */}
          <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {[
              { href: "/create-hug-card", label: "🤗 Create Hug Card" },
              { href: "/virtual-bouquet-maker", label: "💐 Virtual Bouquet" },
              { href: "/digital-bouquet-maker", label: "🌸 Digital Bouquet" },
              { href: "/blog", label: "📖 Flower Blog" },
              { href: "/shagun", label: "💛 Send Shagun" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "999px",
                  border: "1px solid #fda4af",
                  background: "white",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#e11d48",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
