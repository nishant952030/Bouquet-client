import { useEffect, useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { applySeo } from "../lib/seo";
import { blogPosts, getBlogPostBySlug } from "../data/blogPosts";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const post = getBlogPostBySlug(slug);

  // Get related posts (same keywords overlap, excluding current)
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const currentKeywords = new Set(post.keywords.map(k => k.toLowerCase()));
    return blogPosts
      .filter(p => p.slug !== post.slug)
      .map(p => {
        const overlap = p.keywords.filter(k => currentKeywords.has(k.toLowerCase())).length;
        // Score by keyword overlap + recency
        return { ...p, score: overlap * 2 + (new Date(p.publishedAt).getTime() / 1e12) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [post]);

  useEffect(() => {
    if (!post) return;

    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/blog/${post.slug}`;

    applySeo({
      title: post.title,
      description: post.description,
      keywords: post.keywords,
      path: `/blog/${post.slug}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": postUrl,
            },
            author: {
              "@type": "Organization",
              name: "Petals and Words",
              url: baseUrl,
            },
            publisher: {
              "@type": "Organization",
              name: "Petals and Words",
              logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/logo-transparent.png`,
              },
            },
            image: `${baseUrl}/logo-transparent.png`,
            wordCount: post.sections.reduce(
              (acc, s) => acc + s.paragraphs.join(" ").split(/\s+/).length,
              0
            ),
            articleSection: "Flower Gifting",
            inLanguage: "en-US",
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
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: postUrl,
              },
            ],
          },
        ],
      },
    });
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:py-12">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <LanguageSwitcher />
      </div>
      <article className="rounded-[2rem] border border-rose-200/70 bg-white/95 p-6 shadow-xl shadow-rose-200/30 sm:p-10">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-stone-400">
          <ol className="flex items-center gap-1.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li><Link to="/" className="hover:text-rose-600 transition-colors">{t("common.home")}</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link to="/blog" className="hover:text-rose-600 transition-colors">{t("blog.breadcrumb", "Blog")}</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-stone-600 font-medium truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">{t("blogPost.flowerGuide", "Flower Guide")}</p>
        <h1 className="mt-2 text-4xl text-stone-900 sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {post.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-stone-500">
          <time dateTime={post.publishedAt}>{post.publishedAt}</time>
          <span>·</span>
          <span>{post.readingMinutes} {t("blog.minRead", "min read")}</span>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <>
              <span>·</span>
              <span className="text-emerald-600 font-medium">{t("blogPost.updated", "Updated")} {post.updatedAt}</span>
            </>
          )}
        </div>
        <p className="mt-5 text-base leading-relaxed text-stone-700">{post.description}</p>

        {/* Table of contents */}
        <nav className="mt-6 rounded-xl border border-stone-100 bg-stone-50/70 p-4" aria-label="Table of contents">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400 mb-2">{t("blogPost.inThisArticle", "In this article")}</p>
          <ol className="space-y-1" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {post.sections.map((section, idx) => (
              <li key={section.heading}>
                <a
                  href={`#${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="text-sm text-stone-600 hover:text-rose-700 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  {idx + 1}. {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-6">
          {post.sections.map((section) => (
            <section key={section.heading} id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
              <h2 className="text-2xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                {section.heading}
              </h2>
              <div className="mt-2 space-y-3">
                {section.paragraphs.map((para) => (
                  <p key={para} className="text-[15px] leading-relaxed text-stone-700">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA section */}
        <div className="mt-10 rounded-2xl border border-rose-100 bg-rose-50/60 p-5 text-center">
          <p className="text-lg font-medium text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            {t("blogPost.readyTitle", "Ready to create your bouquet?")}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {t("blogPost.readySubtitle", "Choose flowers, write your note, and share instantly. No signup needed.")}
          </p>
          <Link
            to="/create"
            className="mt-3 inline-block rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            {t("blogPost.createCta", "Create Your Bouquet →")}
          </Link>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3">{t("blogPost.youMightAlsoLike", "You might also like")}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/blog/${rp.slug}`}
                  className="rounded-xl border border-stone-100 bg-white p-3 shadow-sm transition hover:border-rose-200 hover:shadow-md"
                  style={{ textDecoration: "none" }}
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-400">
                    {rp.readingMinutes} {t("blog.minRead", "min read")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-900 leading-tight">
                    {rp.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/blog" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-300">
            {t("blogPost.backToBlog", "Back to Blog")}
          </Link>
          <Link to="/create" className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">
            {t("payment.createBouquet", "Create Bouquet")}
          </Link>
        </div>
      </article>
    </main>
  );
}
