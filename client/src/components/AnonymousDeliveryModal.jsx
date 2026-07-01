import { useState } from "react";
import { loadRazorpayScript } from "../lib/razorpay";

const PRICE = 49;

const CSS = `
  @keyframes anonSlideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes anonPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(124, 67, 67, 0.3); }
    50%       { box-shadow: 0 0 0 10px rgba(124, 67, 67, 0); }
  }
  @keyframes anonSpin { to { transform: rotate(360deg); } }
  @keyframes anonSuccessPop {
    0%   { transform: scale(0.5); opacity: 0; }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes anonFloat {
    0%, 100% { transform: translateY(0px) rotate(-5deg); }
    50%       { transform: translateY(-8px) rotate(5deg); }
  }

  .anon-overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
    background: rgba(20, 10, 10, 0.6);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  @media (min-width: 480px) {
    .anon-overlay {
      align-items: center;
      padding: 1.5rem;
    }
  }

  .anon-sheet {
    background: #ffffff;
    width: 100%;
    max-width: 440px;
    border-radius: 2rem 2rem 0 0;
    padding: 2rem 1.5rem 2.5rem;
    animation: anonSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    position: relative;
    max-height: 92vh;
    overflow-y: auto;
  }

  @media (min-width: 480px) {
    .anon-sheet {
      border-radius: 2rem;
      padding: 2.5rem 2rem;
    }
  }

  .anon-close {
    position: absolute;
    top: 1.1rem;
    right: 1.25rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: #f5f3ef;
    color: #7b5455;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .anon-close:hover { background: #ffd9d8; }

  .anon-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: linear-gradient(135deg, #7b5455 0%, #c2185b 100%);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.3rem 0.75rem;
    border-radius: 9999px;
    margin-bottom: 0.75rem;
  }

  .anon-phone-input {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 2px solid #e8e3e3;
    border-radius: 0.875rem;
    font-size: 1rem;
    font-family: 'Manrope', sans-serif;
    color: #3E2723;
    background: #faf9f6;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    box-sizing: border-box;
    letter-spacing: 0.03em;
  }
  .anon-phone-input:focus {
    border-color: #7b5455;
    box-shadow: 0 0 0 3px rgba(123, 84, 85, 0.1);
    background: #fff;
  }
  .anon-phone-input::placeholder { color: #c4b5b6; }

  .anon-pay-btn {
    width: 100%;
    min-height: 54px;
    border: none;
    border-radius: 9999px;
    background: linear-gradient(135deg, #7b5455 0%, #c2185b 100%);
    color: #fff;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.18s, box-shadow 0.18s;
    box-shadow: 0 12px 32px rgba(123, 84, 85, 0.28);
    animation: anonPulse 2.5s infinite;
  }
  .anon-pay-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 18px 42px rgba(123, 84, 85, 0.38);
  }
  .anon-pay-btn:active:not(:disabled) { transform: scale(0.98); }
  .anon-pay-btn:disabled {
    background: #e4e2de;
    color: #a09898;
    cursor: not-allowed;
    box-shadow: none;
    animation: none;
  }

  .anon-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: anonSpin 0.8s linear infinite;
  }

  .anon-trust-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    flex-wrap: wrap;
  }
  .anon-trust-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: #9e8f90;
    font-weight: 600;
  }

  .anon-success-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1.25rem;
    animation: anonSuccessPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.25);
  }

  .anon-phone-prefix {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.95rem;
    font-weight: 700;
    color: #7b5455;
    pointer-events: none;
    font-family: 'Manrope', sans-serif;
  }

  .anon-floating-ghost {
    font-size: 3rem;
    animation: anonFloat 3s ease-in-out infinite;
    display: inline-block;
    margin-bottom: 0.5rem;
  }
`;

export default function AnonymousDeliveryModal({ giftUrl, giftType = "bouquet", onClose }) {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("input"); // input | paying | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [isMock, setIsMock] = useState(false);

  const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID;

  const isValidPhone = /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));

  const handlePay = async () => {
    if (!isValidPhone) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setErrorMsg("");
    setStep("paying");

    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        throw new Error("Unable to load payment. Please disable ad-blocker and try again.");
      }

      // Create Razorpay order
      const orderRes = await fetch("/api/anonymous/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftUrl,
          recipientPhone: phone.replace(/\s/g, ""),
          giftType,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.orderId) {
        throw new Error(orderData?.error || "Could not create payment order.");
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: "INR",
        name: "Petals and Words",
        description: "Anonymous Gift Delivery via WhatsApp",
        theme: { color: "#7b5455" },
        modal: {
          ondismiss: () => {
            setStep("input");
            setErrorMsg("Payment cancelled. Your ₹49 was not charged.");
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/anonymous/verify-and-send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                giftUrl,
                recipientPhone: phone.replace(/\s/g, ""),
                giftType,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData?.ok) {
              throw new Error(verifyData?.error || "Delivery failed. Contact support.");
            }
            setIsMock(verifyData.mock || false);
            setStep("success");
          } catch (err) {
            setErrorMsg(err?.message || "Payment succeeded but delivery failed. Contact support@petalsandwords.com");
            setStep("error");
          }
        },
      });

      razorpay.on("payment.failed", () => {
        setStep("input");
        setErrorMsg("Payment failed. Please try again.");
      });

      razorpay.open();
    } catch (err) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
      setStep("input");
    }
  };

  return (
    <div className="anon-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{CSS}</style>
      <div className="anon-sheet" role="dialog" aria-modal="true" aria-label="Send anonymously via WhatsApp">
        <button className="anon-close" onClick={onClose} aria-label="Close">✕</button>

        {step === "success" ? (
          /* ── Success State ── */
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div className="anon-success-icon">🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 600, color: "#166534", marginBottom: "0.5rem" }}>
              Gift Delivered! 🌸
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#4b5563", lineHeight: 1.6, marginBottom: "0.5rem" }}>
              Your anonymous gift is on its way to{" "}
              <strong style={{ color: "#3E2723" }}>+91 {phone}</strong> via WhatsApp.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              They'll receive: <em>"✨ Someone sent you a secret gift! Open it here 👇"</em>
            </p>
            {isMock && (
              <p style={{ fontSize: "0.72rem", color: "#b45309", background: "#fef3c7", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>
                ⚙️ MSG91 not yet configured — message will be sent live once your WhatsApp account is activated.
              </p>
            )}
            <button
              onClick={onClose}
              style={{
                background: "linear-gradient(135deg, #7b5455, #c2185b)",
                color: "#fff",
                border: "none",
                borderRadius: "9999px",
                padding: "0.75rem 2rem",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              Done ✓
            </button>
          </div>
        ) : step === "error" ? (
          /* ── Error State ── */
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.75rem" }}>⚠️</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#991b1b", marginBottom: "0.5rem" }}>
              Delivery Issue
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#6b5e5f", lineHeight: 1.6, marginBottom: "1.25rem" }}>{errorMsg}</p>
            <button onClick={() => { setStep("input"); setErrorMsg(""); }} style={{ background: "#7b5455", color: "#fff", border: "none", borderRadius: "9999px", padding: "0.65rem 1.75rem", fontWeight: 700, cursor: "pointer" }}>
              Try Again
            </button>
          </div>
        ) : (
          /* ── Input State ── */
          <>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <span className="anon-floating-ghost">🕵️</span>
              <div>
                <span className="anon-badge">✨ New Feature</span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 600, color: "#3E2723", lineHeight: 1.25, marginBottom: "0.4rem" }}>
                Send Anonymously
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#6b5e5f", lineHeight: 1.6 }}>
                We'll deliver your gift directly to their WhatsApp.
                <br />
                <strong style={{ color: "#7b5455" }}>Your identity stays completely hidden.</strong>
              </p>
            </div>

            {/* How it works */}
            <div style={{ background: "#fdf8f8", border: "1.5px solid #f3e8e8", borderRadius: "1rem", padding: "0.9rem 1rem", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { icon: "📱", text: "Enter their WhatsApp number below" },
                { icon: "💳", text: "Pay ₹49 securely via Razorpay" },
                { icon: "🌸", text: "They get: \"Someone sent you a secret gift!\"" },
                { icon: "🕵️", text: "Your name is never revealed" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: "0.8rem", color: "#5c4a40", fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Phone input */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#7b5455", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Recipient's WhatsApp Number
              </label>
              <div style={{ position: "relative" }}>
                <span className="anon-phone-prefix">🇮🇳 +91</span>
                <input
                  id="anon-phone-input"
                  className="anon-phone-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(v);
                    setErrorMsg("");
                  }}
                  style={{ paddingLeft: "4.5rem" }}
                  autoFocus
                />
              </div>
              {errorMsg && (
                <p style={{ fontSize: "0.75rem", color: "#991b1b", marginTop: "0.4rem", fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </p>
              )}
              <p style={{ fontSize: "0.72rem", color: "#9e8f90", marginTop: "0.35rem" }}>
                Indian numbers only (10 digits starting with 6–9)
              </p>
            </div>

            {/* Pay button */}
            <button
              id="anon-pay-btn"
              className="anon-pay-btn"
              onClick={handlePay}
              disabled={!isValidPhone || step === "paying"}
            >
              {step === "paying" ? (
                <>
                  <span className="anon-spinner" />
                  Processing...
                </>
              ) : (
                <>
                  🕵️ Send Anonymously — ₹{PRICE}
                </>
              )}
            </button>

            {/* Trust */}
            <div className="anon-trust-row" style={{ marginTop: "1rem" }}>
              <div className="anon-trust-item"><span>🔒</span> Secure Razorpay</div>
              <div className="anon-trust-item"><span>👻</span> 100% Anonymous</div>
              <div className="anon-trust-item"><span>⚡</span> Instant Delivery</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
