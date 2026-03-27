import { useState, useEffect } from "react";

export function msUntilMidnight() {
  const n = new Date(), m = new Date(n);
  m.setHours(24, 0, 0, 0);
  return m.getTime() - n.getTime();
}

export default function MidnightCountdown({ dark = false }) {
  const [ms, setMs] = useState(msUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const boxCls = dark
    ? "flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-white/20 px-1 text-[13px] font-bold text-white tabular-nums"
    : "flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-rose-100 px-1 text-[13px] font-bold text-rose-800 tabular-nums";
  const sepCls = dark ? "text-rose-300 text-[12px]" : "text-rose-400 text-[12px]";
  return (
    <div className="flex items-center gap-0.5 font-mono">
      {[h, m, s].map((unit, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <span className={boxCls}>{unit}</span>
          {i < 2 && <span className={sepCls}>:</span>}
        </span>
      ))}
    </div>
  );
}
