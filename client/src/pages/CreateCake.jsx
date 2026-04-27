import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { applySeo } from "../lib/seo";

export default function CreateCake() {
  const [name, setName] = useState("");
  const [flavor, setFlavor] = useState("chocolate");
  const [age, setAge] = useState("");
  const [note, setNote] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    applySeo({
      title: "Create a Virtual Birthday Cake | Petals and Words",
      description: "Send a free interactive virtual birthday cake. Choose a flavor, add a personal note, and let them blow out the candles online!",
      keywords: ["virtual birthday cake", "send digital birthday cake", "online birthday cake maker", "virtual cake with candles"],
      path: "/create-cake",
    });
  }, []);

  const handleGenerate = () => {
    if (!name.trim()) {
      alert("Please enter the birthday person's name!");
      return;
    }

    navigate("/payment-cake", {
      state: {
        name: name.trim(),
        flavor,
        age: parseInt(age) || 3,
        note: note.trim()
      }
    });
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:py-12 font-manrope selection:bg-rose-200 selection:text-rose-900">
      <div className="rounded-[2rem] border border-rose-200/70 bg-white/95 p-6 shadow-xl shadow-rose-200/30 sm:p-10 relative overflow-hidden">
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 text-6xl opacity-10 rotate-12 pointer-events-none">🎂</div>
        <div className="absolute bottom-10 left-4 text-4xl opacity-10 -rotate-12 pointer-events-none">✨</div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.1em] text-rose-500 hover:text-rose-700 transition-colors mb-6">
            ← Back to Home
          </Link>

          <h1 className="text-4xl text-stone-900 sm:text-5xl mb-2 font-noto">
            Send a Virtual Cake <svg className="inline-block w-8 h-8 text-rose-400 mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
          </h1>
          <p className="text-stone-600 mb-8 text-sm sm:text-base leading-relaxed max-w-xl">
            Choose a flavor, write a heartfelt note, and send them an interactive cake where they can literally "blow out" the candles on their screen.
          </p>

          <div className="space-y-6 bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Who is the birthday star? *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sarah, Mom, Bestie"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-800 placeholder-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all"
                maxLength={25}
              />
            </div>

            {/* Flavor Selection */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Cake Flavor</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "chocolate", label: "Chocolate", color: "bg-[#3e2723]" },
                  { id: "vanilla", label: "Vanilla", color: "bg-[#fdfbf7] border-stone-200" },
                  { id: "strawberry", label: "Strawberry", color: "bg-[#ffcdd2]" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFlavor(f.id)}
                    className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                      flavor === f.id ? "border-rose-400 bg-rose-50" : "border-stone-100 bg-white hover:border-stone-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mb-2 shadow-inner border ${f.color}`}></div>
                    <span className="text-xs font-semibold text-stone-700">{f.label}</span>
                    {flavor === f.id && (
                      <div className="absolute top-1 right-1">
                        <svg className="w-3 h-3 text-rose-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Candles */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Number of Candles (Optional)</label>
              <p className="text-xs text-stone-500 mb-2">Leave blank for a default of 3 candles.</p>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0 && val <= 100) setAge(val.toString());
                  else if (e.target.value === "") setAge("");
                }}
                placeholder="e.g., 25"
                min="1"
                max="100"
                className="w-full sm:w-32 rounded-xl border border-stone-200 px-4 py-3 text-stone-800 placeholder-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all"
              />
            </div>

            {/* Personal Note */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Birthday Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your birthday wishes here. They'll see it after they blow out the candles!"
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-800 placeholder-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all min-h-[120px] resize-y"
                maxLength={500}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 text-white font-bold text-lg shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              Bake the Cake
            </button>
          </div>


        </div>
      </div>
    </main>
  );
}
