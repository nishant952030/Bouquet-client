import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { applySeo } from "../lib/seo";
import { getBlogPostBySlug } from "../data/blogPosts";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post = getBlogPostBySlug(slug);

  useEffect(() => {
    if (!post) return;
    applySeo({
      title: post.title,
      description: post.description,
      keywords: post.keywords,
      path: `/blog/${post.slug}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        mainEntityOfPage: `${window.location.origin}/blog/${post.slug}`,
      },
    });
  }, [post]);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:py-12">
      <article className="rounded-[2rem] border border-rose-200/70 bg-white/95 p-6 shadow-xl shadow-rose-200/30 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Flower Guide</p>
        <h1 className="mt-2 text-4xl text-stone-900 sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-stone-500">{post.publishedAt} | {post.readingMinutes} min read</p>
        <p className="mt-5 text-base leading-relaxed text-stone-700">{post.description}</p>

        <div className="mt-8 space-y-6">
          {post.sections.map((section) => (
            <section key={section.heading}>
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

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/blog" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-300">
            Back to Blog
          </Link>
          <Link to="/create" className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100">
            Create Bouquet
          </Link>
        </div>
      </article>
    </main>
  );
}
