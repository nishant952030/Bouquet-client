import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PLUSHIE_TYPES, COLOR_PRESETS, ACCESSORIES, BOX_STYLES } from "./plushieConfig";

export default function PlushieControls({
  plushieState,
  onChange,
  onAddToCart,
  addedToCart,
  error,
  onSubmit
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTypeChange = (typeId) => {
    onChange("plushieType", typeId);
    // Auto-update default color for the selected type
    const matchingType = PLUSHIE_TYPES.find((p) => p.id === typeId);
    if (matchingType) {
      onChange("furColor", matchingType.defaultColor);
    }
  };

  const currentTypeColors = COLOR_PRESETS[plushieState.plushieType] || [];

  return (
    <form className="plushie3d-controls" onSubmit={onSubmit}>
      {/* ─── Recipient Name ─── */}
      <div className="plushie3d-field">
        <label htmlFor="plushie-to">{t("plushie.recipientName", "Recipient's Name")}</label>
        <input
          id="plushie-to"
          maxLength={36}
          value={plushieState.to}
          onChange={(e) => onChange("to", e.target.value)}
          placeholder={t("plushie.titlePlaceholder", "e.g. For Someone Special")}
        />
      </div>

      {/* ─── Plushie Type ─── */}
      <div className="plushie3d-field">
        <span className="plushie3d-label">{t("plushie.type", "Plushie Type")}</span>
        <div className="plushie3d-grid">
          {PLUSHIE_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className={plushieState.plushieType === type.id ? "active" : ""}
              onClick={() => handleTypeChange(type.id)}
            >
              <span style={{ fontSize: "1.2rem" }}>
                {type.id === "bear" ? "🧸" : type.id === "bunny" ? "🐰" : "🐼"}
              </span>
              <span>{t(type.labelKey, type.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Fur Color ─── */}
      <div className="plushie3d-field">
        <span className="plushie3d-label">{t("plushie.color", "Fur Color")}</span>
        <div className="plushie3d-grid">
          {currentTypeColors.map((color) => (
            <button
              key={color.id}
              type="button"
              className={plushieState.furColor === color.hex ? "active" : ""}
              onClick={() => onChange("furColor", color.hex)}
            >
              <span className="plushie3d-color-swatch" style={{ background: color.hex }} />
              <span style={{ fontSize: "0.7rem" }}>{color.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Accessories ─── */}
      <div className="plushie3d-field">
        <span className="plushie3d-label">{t("plushie.accessory", "Accessory")}</span>
        <div className="plushie3d-grid">
          {ACCESSORIES.map((acc) => (
            <button
              key={acc.id}
              type="button"
              className={plushieState.accessory === acc.id ? "active" : ""}
              onClick={() => onChange("accessory", acc.id)}
            >
              <span style={{ fontSize: "1.1rem" }}>{acc.emoji}</span>
              <span>{acc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Gift Box Style ─── */}
      <div className="plushie3d-field">
        <span className="plushie3d-label">{t("plushie.boxStyle", "Gift Box Style")}</span>
        <div className="plushie3d-grid">
          {BOX_STYLES.map((box) => (
            <button
              key={box.id}
              type="button"
              className={plushieState.boxStyle === box.id ? "active" : ""}
              onClick={() => onChange("boxStyle", box.id)}
            >
              <span
                className="plushie3d-color-swatch"
                style={{
                  background: `linear-gradient(135deg, ${box.baseBg} 50%, ${box.ribbonBg} 50%)`
                }}
              />
              <span style={{ fontSize: "0.7rem" }}>{box.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Sender Name ─── */}
      <div className="plushie3d-field">
        <label htmlFor="plushie-from">{t("plushie.senderName", "Your Name")}</label>
        <input
          id="plushie-from"
          maxLength={36}
          value={plushieState.from}
          onChange={(e) => onChange("from", e.target.value)}
          placeholder="Your Name (Optional)"
        />
      </div>

      {/* ─── Tag Message ─── */}
      <div className="plushie3d-field">
        <label htmlFor="plushie-msg">{t("plushie.tagMessage", "Tag Message")}</label>
        <textarea
          id="plushie-msg"
          maxLength={240}
          value={plushieState.msg}
          onChange={(e) => onChange("msg", e.target.value)}
          placeholder="Write a sweet card message that they will read after opening the box..."
        />
        <p style={{ fontSize: "0.68rem", color: "#be185d", textAlign: "right", margin: 0, opacity: 0.6 }}>
          {plushieState.msg.length}/240
        </p>
      </div>

      {error && <div className="plushie3d-error">{error}</div>}

      {/* ─── CTAs ─── */}
      <button className="plushie3d-submit" type="submit">
        {t("plushie.previewBtn", "Preview & Share ✨")}
      </button>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <button className="plushie3d-cart-submit" type="button" onClick={onAddToCart}>
          <ShoppingCart size={15} />
          {addedToCart ? "Added!" : "Add to cart"}
        </button>
        <button className="plushie3d-cart-submit" type="button" onClick={() => navigate("/cart")}>
          View cart
        </button>
      </div>
    </form>
  );
}
