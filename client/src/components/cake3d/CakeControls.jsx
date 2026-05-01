import { useTranslation } from "react-i18next";
import {
  FLAVORS,
  MAX_CANDLES,
  MAX_CREAM_SWIRLS,
  MAX_TIERS,
  MAX_TOPPINGS,
  MIN_TIERS,
  TOPPING_TYPES,
} from "./cakeConfig";

const OCCASIONS = [
  { id: "birthday", labelKey: "occasions.birthdayFull", fallback: "🎂 Birthday" },
  { id: "mothers-day", labelKey: "occasions.mothersDayFull", fallback: "🌸 Mother's Day" },
  { id: "fathers-day", labelKey: "occasions.fathersDayFull", fallback: "🎁 Father's Day" },
  { id: "anniversary", labelKey: "occasions.anniversaryFull", fallback: "💕 Anniversary" },
  { id: "wedding", labelKey: "occasions.weddingFull", fallback: "💒 Wedding" },
  { id: "graduation", labelKey: "occasions.graduationFull", fallback: "🎓 Graduation" },
  { id: "baby-shower", labelKey: "occasions.babyShowerFull", fallback: "👶 Baby Sprinkle" },
  { id: "just-because", labelKey: "occasions.justBecauseFull", fallback: "💝 Just Because" },
  { id: "thank-you", labelKey: "occasions.thankYouFull", fallback: "🙏 Thank You" },
];

export default function CakeControls({
  cakeState,
  activeTool,
  selectedTopping,
  autoRotate,
  name,
  note,
  occasion,
  error,
  onFlavorChange,
  onActiveToolChange,
  onToggleRotation,
  onAddCandle,
  onAddCream,
  onAddTopping,
  onClearCandles,
  onClearCream,
  onClearToppings,
  onTierChange,
  onNameChange,
  onNoteChange,
  onOccasionChange,
  onSelectedToppingChange,
  onSubmit,
}) {
  const { t } = useTranslation();
  const candleCount = cakeState.candles.length;
  const creamCount = cakeState.creamSwirls.length;
  const toppingCount = cakeState.toppings.length;

  return (
    <form className="cake3d-controls" onSubmit={onSubmit}>
      <div className="cake3d-field">
        <label htmlFor="cake3d-name">{t("cakeControls.recipientName", "Recipient name")}</label>
        <input
          id="cake3d-name"
          maxLength={36}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={t("cakeControls.recipientPlaceholder", "e.g. Aanya")}
          value={name}
        />
      </div>

      <div className="cake3d-field">
        <span className="cake3d-label">{t("cakeControls.occasion", "Occasion")}</span>
        <div className="cake3d-flavor-grid" style={{ flexWrap: "wrap" }}>
          {OCCASIONS.map((occ) => (
            <button
              className={occasion === occ.id ? "active" : ""}
              key={occ.id}
              onClick={() => onOccasionChange(occ.id)}
              type="button"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.6rem" }}
            >
              {t(occ.labelKey, occ.fallback)}
            </button>
          ))}
        </div>
      </div>

      <div className="cake3d-field">
        <span className="cake3d-label">{t("cakeControls.flavor", "Flavor")}</span>
        <div className="cake3d-flavor-grid">
          {Object.entries(FLAVORS).map(([id, flavor]) => (
            <button
              className={cakeState.flavor === id ? "active" : ""}
              key={id}
              onClick={() => onFlavorChange(id)}
              type="button"
            >
              <span style={{ background: flavor.cake }} />
              {t(`cakeControls.flavor_${id}`, flavor.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">{t("cakeControls.cakeStoreys", "Cake storeys")}</span>
          <strong>{cakeState.tiers}/{MAX_TIERS}</strong>
        </div>
        <div className="cake3d-button-row">
          <button
            onClick={() => onTierChange(cakeState.tiers + 1)}
            type="button"
            disabled={cakeState.tiers >= MAX_TIERS}
          >
            {t("cakeControls.addStorey", "Add storey")}
          </button>
          <button
            onClick={() => onTierChange(cakeState.tiers - 1)}
            type="button"
            disabled={cakeState.tiers <= MIN_TIERS}
          >
            {t("cakeControls.remove", "Remove")}
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">{t("cakeControls.scene", "Scene")}</span>
          <strong>{autoRotate ? t("cakeControls.rotating", "Rotating") : t("cakeControls.stopped", "Stopped")}</strong>
        </div>
        <button className="cake3d-wide-button" onClick={onToggleRotation} type="button">
          {autoRotate ? t("cakeControls.stopRotation", "Stop rotation") : t("cakeControls.startRotation", "Start rotation")}
        </button>
      </div>

      <div className="cake3d-field">
        <span className="cake3d-label">{t("cakeControls.clickTool", "Click tool")}</span>
        <div className="cake3d-tool-row">
          <button
            className={activeTool === "candle" ? "active" : ""}
            onClick={() => onActiveToolChange("candle")}
            type="button"
          >
            {t("cakeControls.candle", "Candle")}
          </button>
          <button
            className={activeTool === "cream" ? "active" : ""}
            onClick={() => onActiveToolChange("cream")}
            type="button"
          >
            {t("cakeControls.cream", "Cream")}
          </button>
          <button
            className={activeTool === "topping" ? "active" : ""}
            onClick={() => onActiveToolChange("topping")}
            type="button"
          >
            {t("cakeControls.topping", "Topping")}
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">{t("cakeControls.candles", "Candles")}</span>
          <strong>{candleCount}/{MAX_CANDLES}</strong>
        </div>
        <div className="cake3d-button-row">
          <button onClick={onAddCandle} type="button" disabled={candleCount >= MAX_CANDLES}>
            {t("cakeControls.addCandle", "Add candle")}
          </button>
          <button onClick={onClearCandles} type="button" disabled={candleCount === 0}>
            {t("cakeControls.clear", "Clear")}
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">{t("cakeControls.creamSwirls", "Cream swirls")}</span>
          <strong>{creamCount}/{MAX_CREAM_SWIRLS}</strong>
        </div>
        <div className="cake3d-button-row">
          <button onClick={onAddCream} type="button" disabled={creamCount >= MAX_CREAM_SWIRLS}>
            {t("cakeControls.addCream", "Add cream")}
          </button>
          <button onClick={onClearCream} type="button" disabled={creamCount === 0}>
            {t("cakeControls.clear", "Clear")}
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <div className="cake3d-row-label">
          <span className="cake3d-label">{t("cakeControls.toppings", "Toppings")}</span>
          <strong>{toppingCount}/{MAX_TOPPINGS}</strong>
        </div>
        <div className="cake3d-topping-grid">
          {Object.entries(TOPPING_TYPES).map(([id, topping]) => (
            <button
              className={selectedTopping === id ? "active" : ""}
              key={id}
              onClick={() => onSelectedToppingChange(id)}
              type="button"
            >
              <span style={{ background: topping.color }} />
              {t(`cakeControls.topping_${id}`, topping.label)}
            </button>
          ))}
        </div>
        <div className="cake3d-button-row">
          <button
            onClick={() => onAddTopping(selectedTopping)}
            type="button"
            disabled={toppingCount >= MAX_TOPPINGS}
          >
            {t("cakeControls.addTopping", "Add topping")}
          </button>
          <button onClick={onClearToppings} type="button" disabled={toppingCount === 0}>
            {t("cakeControls.clear", "Clear")}
          </button>
        </div>
      </div>

      <div className="cake3d-field">
        <label htmlFor="cake3d-note">{t("cakeControls.birthdayNote", "Birthday note")}</label>
        <textarea
          id="cake3d-note"
          maxLength={240}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={t("cakeControls.notePlaceholder", "Write a wish they will see after the candles are out.")}
          value={note}
        />
      </div>

      {error && <div className="cake3d-error">{error}</div>}

      <button className="cake3d-submit" type="submit">
        {t("cakeControls.bakeCake", "Bake cake")}
      </button>
    </form>
  );
}
