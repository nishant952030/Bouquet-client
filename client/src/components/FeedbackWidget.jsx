import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";

export default function FeedbackWidget() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating && !message.trim()) return;

    setIsSubmitting(true);
    try {
      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, "feedbacks"), {
          rating,
          message: message.trim(),
          path: location.pathname + location.search,
          timestamp: new Date().toISOString(),
          userAgent: window.navigator.userAgent,
        });
      } else {
        console.warn("Firebase not configured. Feedback not saved.", { rating, message });
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        // Reset after closing animation
        setTimeout(() => {
          setIsSuccess(false);
          setRating(0);
          setMessage("");
        }, 300);
      }, 2500);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999 }}>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7b5455 0%, #ecbaba 160%)",
          color: "white",
          border: "none",
          boxShadow: "0 8px 24px rgba(123,84,85,0.25)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
          transform: isOpen ? "scale(0.9)" : "scale(1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(123,84,85,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? "scale(0.9)" : "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(123,84,85,0.25)";
        }}
        aria-label="Feedback"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        )}
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          ref={modalRef}
          style={{
            position: "absolute",
            bottom: "4.5rem",
            right: 0,
            width: "320px",
            background: "#ffffff",
            borderRadius: "1.25rem",
            boxShadow: "0 12px 48px rgba(27,28,26,0.12), 0 4px 16px rgba(27,28,26,0.08)",
            padding: "1.5rem",
            fontFamily: "'Manrope', sans-serif",
            color: "#3E2723",
            animation: "vvFadeUp 0.3s ease-out forwards",
            transformOrigin: "bottom right",
          }}
        >
          {isSuccess ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎉</div>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#7b5455" }}>
                {t("feedback.thankYou", "Thank you for your feedback! ❤️")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, color: "#3E2723" }}>
                {t("feedback.title", "Give Feedback")}
              </h3>
              
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#4f4445", marginBottom: "0.5rem" }}>
                  {t("feedback.question", "How was your experience?")}
                </p>
                <div style={{ display: "flex", gap: "0.5rem", cursor: "pointer" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        fontSize: "1.8rem",
                        color: star <= (hoverRating || rating) ? "#FFD700" : "#eae8e4",
                        transition: "color 0.2s, transform 0.1s",
                        transform: star <= hoverRating ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedback.placeholder", "Any suggestions or issues? We'd love to hear from you!")}
                style={{
                  width: "100%",
                  minHeight: "90px",
                  padding: "0.8rem",
                  borderRadius: "0.75rem",
                  border: "1.5px solid #eae8e4",
                  background: "#fbf9f5",
                  fontFamily: "inherit",
                  fontSize: "0.85rem",
                  color: "#3E2723",
                  resize: "none",
                  outline: "none",
                  marginBottom: "1rem",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7b5455";
                  e.target.style.boxShadow = "0 0 0 3px rgba(123,84,85,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#eae8e4";
                  e.target.style.boxShadow = "none";
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting || (!rating && !message.trim())}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "9999px",
                  background: (!rating && !message.trim()) ? "#eae8e4" : "linear-gradient(135deg, #7b5455 0%, #ffd9d8 160%)",
                  color: (!rating && !message.trim()) ? "#9e8f90" : "white",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: (!rating && !message.trim()) ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? t("feedback.sending", "Sending...") : t("feedback.submit", "Send Feedback")}
              </button>
            </form>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes vvFadeUp {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
