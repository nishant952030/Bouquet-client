import Link from "next/link";
import { blogPosts } from "../../src/data/blogPosts";

const BASE_URL = "https://www.petalsandwords.com";

export const metadata = {
  title: "Flower Blog — Bouquet Ideas, Messages & Digital Gifting Guides",
  description:
    "Read practical guides on flower meanings, bouquet notes, apology messages, birthday ideas, Mother's Day gifts, and digital gifting tips. Create your free bouquet today.",
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: "Flower Blog — Petals and Words",
    description:
      "Guides on flower meanings, writing better bouquet notes, and sending thoughtful digital gifts.",
    url: `${BASE_URL}/blog`,
    siteName: "Petals and Words",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Blog",
      name: "Petals and Words — Flower Blog",
      url: `${BASE_URL}/blog`,
      description:
        "Practical guides on flower gifting, bouquet note writing, and digital flower delivery.",
      publisher: {
        "@type": "Organization",
        name: "Petals and Words",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/logo-transparent.png`,
        },
      },
    },
    {
      "@type": "ItemList",
      itemListElement: blogPosts.map((post, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${BASE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      ],
    },
  ],
};

export default function BlogPage() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section
        className="rounded-[2rem] border border-rose-200/70 bg-white/90 p-6 shadow-2xl shadow-rose-200/30 sm:p-10"
        style={{ backdropFilter: "blur(8px)" }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-stone-400">
          <ol className="flex items-center gap-1.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li><Link href="/" className="hover:text-rose-600 transition-colors">Home</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-stone-600 font-medium">Blog</li>
          </ol>
        </nav>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
          Petals and Words
        </p>
        <h1
          className="mt-2 text-4xl text-stone-900 sm:text-5xl"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Flower Blog
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
          Helpful guides about flower meanings, writing better bouquet notes, and sending thoughtful
          digital gifts. Whether it&apos;s a birthday, apology, anniversary, or just because — find
          the right words and flowers here.
        </p>

        {/* Featured post */}
        {featured && (
          <article className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">
              ✨ Latest
            </p>
            <h2
              className="mt-1 text-2xl text-stone-900"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              <Link href={`/blog/${featured.slug}`} className="hover:text-rose-700 transition-colors">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{featured.description}</p>
            <div className="mt-3 flex items-center gap-3">
              <Link
                href={`/blog/${featured.slug}`}
                className="rounded-full border border-amber-300 bg-white px-4 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                Read article →
              </Link>
              <span className="text-[11px] text-stone-400">{featured.readingMinutes} min read</span>
            </div>
          </article>
        )}

        {/* Post grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rest.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-rose-200"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-400">
                {post.publishedAt} · {post.readingMinutes} min read
              </p>
              <h2
                className="mt-2 text-xl text-stone-900"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                <Link href={`/blog/${post.slug}`} className="hover:text-rose-700 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-3 inline-block rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Read article
              </Link>
            </article>
          ))}
        </div>

        {/* Internal linking */}
        <div className="mt-8 rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400 mb-3">
            Explore our tools
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/create", label: "🌸 Create Bouquet" },
              { href: "/virtual-bouquet-maker", label: "🌐 Virtual Bouquet Maker" },
              { href: "/digital-bouquet-maker", label: "💻 Digital Bouquet Maker" },
              { href: "/create-hug-card", label: "🤗 Hug Card" },
              { href: "/shagun", label: "💛 Send Shagun" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-rose-300 hover:text-rose-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/create"
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-300"
          >
            Back to Bouquet Builder
          </Link>
        </div>
      </section>
    </main>
  );
}
