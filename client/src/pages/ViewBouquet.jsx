import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import RecipientBouquetCanvas from "../components/RecipientBouquetCanvas";
import { db, isFirebaseConfigured } from "../lib/firebase";

function getSharedBouquetFromLocalStorage(id) {
  try {
    const raw = localStorage.getItem(`bouquet_share_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Unable to read shared bouquet", error);
    return null;
  }
}

export default function ViewBouquet() {
  const { id } = useParams();
  const [shared, setShared] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSharedBouquet = async () => {
      if (!id) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        if (isFirebaseConfigured && db) {
          let snapshot;
          try {
            snapshot = await getDocFromServer(doc(db, "bouquets", id));
          } catch (serverError) {
            console.warn("Server fetch failed, falling back to cached Firestore read.", serverError);
            snapshot = await getDoc(doc(db, "bouquets", id));
          }

          if (snapshot.exists()) {
            if (!cancelled) {
              setShared(snapshot.data());
              setIsLoading(false);
            }
            return;
          }
        }

        const localData = getSharedBouquetFromLocalStorage(id);
        if (!cancelled) setShared(localData);
      } catch (error) {
        console.error("Unable to read shared bouquet", error);
        if (!cancelled) setShared(getSharedBouquetFromLocalStorage(id));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadSharedBouquet();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8">
        <section className="w-full rounded-[2rem] border border-rose-200/70 bg-white/85 p-6 text-center shadow-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-rose-600">Loading</p>
          <h1 className="mt-2 text-3xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Opening bouquet...
          </h1>
        </section>
      </main>
    );
  }

  if (!shared) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8">
        <section className="w-full rounded-[2rem] border border-rose-200/70 bg-white/85 p-6 text-center shadow-xl sm:p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-rose-600">Bouquet Not Found</p>
          <h1 className="mt-2 text-3xl text-stone-900" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            This link is invalid or expired
          </h1>
          <Link to="/" className="mt-6 inline-block rounded-full border border-rose-200 bg-white px-5 py-2 text-sm font-medium text-rose-700">
            Go Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <section className="rounded-[2rem] border border-rose-200/70 bg-white/80 p-5 shadow-2xl shadow-rose-200/30 backdrop-blur sm:p-8">
        <div className="flex justify-center">
          <RecipientBouquetCanvas stems={shared.stems} />
        </div>

        {shared.note?.trim() && (
          <article className="mx-auto mt-6 max-w-xl rounded-3xl border border-amber-100 bg-amber-50/50 p-5">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-amber-700">Note</p>
            <p className="text-xl leading-relaxed text-amber-950" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
              {shared.note}
            </p>
          </article>
        )}

        <p className="mt-5 text-center text-sm text-stone-600">
          This bouquet was crafted with love for you by{" "}
          <span className="font-semibold text-stone-800">{shared.senderName?.trim() || "someone special"}</span>.
        </p>
      </section>
    </main>
  );
}
