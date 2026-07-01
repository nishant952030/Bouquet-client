import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { loadGiftCart } from "../lib/giftCart";

export default function FloatingCart() {
  const [count, setCount] = useState(() => loadGiftCart().length);

  useEffect(() => {
    const update = () => setCount(loadGiftCart().length);
    window.addEventListener("gift-cart-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("gift-cart-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  // Hide the floating cart on the cart page itself, or if it's empty.
  if (count === 0 || pathname === "/cart") return null;

  return (
    <a 
      href="/cart" 
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "1.5rem",
        zIndex: 90,
        background: "#be185d",
        color: "#fff",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 30px rgba(190,50,90,0.35)",
        textDecoration: "none",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}
      onMouseOver={e => e.currentTarget.style.transform = "scale(1.08) translateY(-4px)"}
      onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      aria-label="View Cart"
    >
      <ShoppingCart size={26} />
      <span style={{
        position: "absolute",
        top: "-2px",
        right: "-2px",
        background: "#fff",
        color: "#be185d",
        fontSize: "0.8rem",
        fontWeight: "800",
        height: "22px",
        minWidth: "22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
        borderRadius: "11px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }}>
        {count}
      </span>
    </a>
  );
}
