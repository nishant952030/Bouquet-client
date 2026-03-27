import { Link } from "react-router-dom";
import { useEffect } from "react";
import { applySeo } from "../lib/seo";
import { blogPosts } from "../data/blogPosts";

export default function Blog() {
  useEffect(() => {
    applySeo({
      title: "Flower Blog and Gifting Ideas",
      description: "Read practical guides on flower meanings, bouquet notes, apology messages, and digital gifting ideas.",
      keywords: ["flower blog", "bouquet message ideas", "digital gifting ideas", "flower meanings"],
      path: "/blog",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Petals and Words Blog",
        url: `${window.location.origin}/blog`,
      },
    });
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:py-12">
      <section className="rounded-[2rem] border border-rose-200/70 bg-white/90 p-6 shadow-2xl shadow-rose-200/30 backdrop-blur sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Petals and Words</p>
        <h1 className="mt-2 text-4xl text-stone-900 sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          Flower Blog
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600 sm:text-base">
          Helpful guides about flower meanings, writing better bouquet notes, and sending thoughtful digital gifts.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {blogPosts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-stone-400">
                {post.publishedAt} | {post.readingMinutes} min read
              </p>
              <h2 className="mt-2 text-xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                <Link to={`/blog/${post.slug}`} className="hover:text-rose-700">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{post.description}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-3 inline-block rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Read article
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <Link to="/create" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-300">
            Back to Bouquet Builder
          </Link>
        </div>
      </section>
    </main>
  );
}
