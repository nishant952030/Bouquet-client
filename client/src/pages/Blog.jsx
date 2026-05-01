import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { applySeo } from "../lib/seo";
import { blogPosts } from "../data/blogPosts";

export default function Blog() {
  const { t } = useTranslation();

  useEffect(() => {
    const baseUrl = window.location.origin;
    applySeo({
      title: "Flower Blog — Bouquet Ideas, Messages & Digital Gifting Guides",
      description: "Read practical guides on flower meanings, bouquet notes, apology messages, birthday ideas, Mother's Day gifts, and digital gifting tips. Create your free bouquet today.",
      keywords: [
        "flower blog", "bouquet message ideas", "digital gifting ideas", "flower meanings",
        "mothers day flowers", "anniversary flower message", "romantic bouquet ideas",
        "thank you flowers", "get well soon flowers online",
      ],
      path: "/blog",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Blog",
            name: "Petals and Words — Flower Blog",
            url: `${baseUrl}/blog`,
            description: "Practical guides on flower gifting, bouquet note writing, and digital flower delivery.",
            publisher: {
              "@type": "Organization",
              name: "Petals and Words",
              url: baseUrl,
              logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/logo-transparent.png`,
              },
            },
          },
          {
            "@type": "ItemList",
            itemListElement: blogPosts.map((post, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              url: `${baseUrl}/blog/${post.slug}`,
              name: post.title,
            })),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: baseUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `${baseUrl}/blog`,
              },
            ],
          },
        ],
      },
    });
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:py-12">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <LanguageSwitcher />
      </div>
      <section className="rounded-[2rem] border border-rose-200/70 bg-white/90 p-6 shadow-2xl shadow-rose-200/30 backdrop-blur sm:p-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-stone-400">
          <ol className="flex items-center gap-1.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li><Link to="/" className="hover:text-rose-600 transition-colors">{t("common.home")}</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-stone-600 font-medium">{t("blog.breadcrumb", "Blog")}</li>
          </ol>
        </nav>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">{t("common.brand", "Petals and Words")}</p>
        <h1 className="mt-2 text-4xl text-stone-900 sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {t("blog.title", "Flower Blog")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
          {t("blog.subtitle", "Helpful guides about flower meanings, writing better bouquet notes, and sending thoughtful digital gifts. Whether it's a birthday, apology, anniversary, or just because — find the right words and flowers here.")}
        </p>

        {/* Featured / latest post */}
        {blogPosts.length > 0 && (
          <article className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">{t("blog.latest", "✨ Latest")}</p>
            <h2 className="mt-1 text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              <Link to={`/blog/${blogPosts[0].slug}`} className="hover:text-rose-700 transition-colors">
                {blogPosts[0].title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{blogPosts[0].description}</p>
            <div className="mt-3 flex items-center gap-3">
              <Link
                to={`/blog/${blogPosts[0].slug}`}
                className="rounded-full border border-amber-300 bg-white px-4 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                {t("blog.readArticle", "Read article")} →
              </Link>
              <span className="text-[11px] text-stone-400">{blogPosts[0].readingMinutes} {t("blog.minRead", "min read")}</span>
            </div>
          </article>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {blogPosts.slice(1).map((post) => (
            <article key={post.slug} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-rose-200">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-400">
                {post.publishedAt} · {post.readingMinutes} {t("blog.minRead", "min read")}
              </p>
              <h2 className="mt-2 text-xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                <Link to={`/blog/${post.slug}`} className="hover:text-rose-700 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{post.description}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-3 inline-block rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                {t("blog.readArticle", "Read article")}
              </Link>
            </article>
          ))}
        </div>

        {/* Internal linking block — SEO juice */}
        <div className="mt-8 rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400 mb-3">{t("blog.exploreTools", "Explore our tools")}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { to: "/create", label: `🌸 ${t("payment.createBouquet", "Create Bouquet")}` },
              { to: "/virtual-bouquet-maker", label: `🌐 ${t("blog.virtualBouquetMaker", "Virtual Bouquet Maker")}` },
              { to: "/digital-bouquet-maker", label: `💻 ${t("blog.digitalBouquetMaker", "Digital Bouquet Maker")}` },
              { to: "/online-bouquet-maker", label: `🌼 ${t("blog.onlineBouquetMaker", "Online Bouquet Maker")}` },
              { to: "/hug-card", label: `🤗 ${t("blog.hugCard", "Hug Card")}` },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-rose-300 hover:text-rose-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Link to="/create" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-300">
            {t("blog.backToBuilder", "Back to Bouquet Builder")}
          </Link>
        </div>
      </section>
    </main>
  );
}
