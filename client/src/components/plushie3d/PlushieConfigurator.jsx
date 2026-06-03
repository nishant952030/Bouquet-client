import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher.jsx";
import PlushieScene from "./PlushieScene";
import PlushieControls from "./PlushieControls";
import { DEFAULT_PLUSHIE } from "./plushieConfig";
import { addGiftCartItem } from "../../lib/giftCart";
import { trackEvent } from "../../lib/analytics";
import "./plushie3d.css";

export default function PlushieConfigurator() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Load initial state from local storage or default
  const [plushieState, setPlushieState] = useState(() => {
    try {
      const saved = localStorage.getItem("pw_pending_plushie");
      return saved ? JSON.parse(saved) : { ...DEFAULT_PLUSHIE };
    } catch {
      return { ...DEFAULT_PLUSHIE };
    }
  });

  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState("");

  // Sync state changes with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("pw_pending_plushie", JSON.stringify(plushieState));
    } catch (e) {
      console.warn("Storage sync failed:", e);
    }
  }, [plushieState]);

  const handleFieldChange = (field, value) => {
    setPlushieState((prev) => ({
      ...prev,
      [field]: value
    }));
    setError("");
  };

  const handleAddToCart = () => {
    if (!plushieState.msg.trim()) {
      setError(t("plushie.errorMsgRequired", "Add a message tag first."));
      return;
    }

    addGiftCartItem("plushie", plushieState);
    trackEvent("plushie_added_to_cart", {
      type: plushieState.plushieType,
      box: plushieState.boxStyle,
      accessory: plushieState.accessory
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!plushieState.msg.trim()) {
      setError(t("plushie.errorMsgRequired", "Add a message tag first."));
      return;
    }

    trackEvent("plushie_config_complete", {
      type: plushieState.plushieType,
      box: plushieState.boxStyle
    });

    // Save finalized copy
    localStorage.setItem("pw_pending_plushie", JSON.stringify(plushieState));
    
    // Direct navigate to checkout
    navigate("/payment-plushie", { state: { plushieData: plushieState } });
  };

  return (
    <div className="plushie3d-page">
      <div className="plushie3d-shell">
        {/* Navigation header */}
        <header className="plushie3d-nav">
          <Link to="/" className="plushie3d-home">
            {t("common.home", "← Home")}
          </Link>
          <img src="/logo-transparent.png" alt="Petals & Words Logo" />
          <LanguageSwitcher />
        </header>

        {/* Layout split */}
        <div className="plushie3d-layout">
          {/* Stage section (3D Canvas) */}
          <section className="plushie3d-stage">
            <div className="plushie3d-stage-copy">
              <p>{t("plushie.type", "Plushie Box")}</p>
              <h1>
                {plushieState.to ? `${plushieState.to}'s ` : ""}
                <em style={{ fontStyle: "italic", fontWeight: "medium", color: "#be185d" }}>
                  Plushie Gift
                </em>
              </h1>
            </div>

            <div className="plushie3d-canvas-card">
              <PlushieScene
                plushieType={plushieState.plushieType}
                furColor={plushieState.furColor}
                accessory={plushieState.accessory}
                boxStyle={plushieState.boxStyle}
                isOpen={true} // Keep open during editing
                autoRotate={false}
              />
            </div>
          </section>

          {/* Panel section (Customization Controls) */}
          <section className="plushie3d-panel">
            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.32rem", fontWeight: 700, color: "#2b1712", margin: "0 0 4px" }}>
                {t("plushie.createTitle", "Create a Virtual Plushie")}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "#be185d", opacity: 0.8, margin: 0 }}>
                {t("plushie.createSub", "Customize your plushie, choose a cute accessory, wrap it in a box, and share a sweet note")}
              </p>
            </div>

            <PlushieControls
              plushieState={plushieState}
              onChange={handleFieldChange}
              onAddToCart={handleAddToCart}
              addedToCart={addedToCart}
              error={error}
              onSubmit={handleSubmit}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
